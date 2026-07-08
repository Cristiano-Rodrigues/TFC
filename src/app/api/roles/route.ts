import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });

    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select('company_id, role')
      .eq('id', payload.sub)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { data: roles, error } = await supabaseAdmin
      .from('roles')
      .select(`
        id,
        name,
        description,
        created_at,
        role_permissions (
          permissions (
            id,
            code
          )
        )
      `)
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Roles fetch error:", error);
      return NextResponse.json({ error: 'Erro ao carregar roles' }, { status: 500 });
    }

    return NextResponse.json({ roles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });

    const { data: user, error: userErr } = await supabaseAdmin
      .from('users')
      .select(`
        company_id, 
        role,
        roles (
          role_permissions (
            permissions ( code )
          )
        )
      `)
      .eq('id', payload.sub)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const hasPermission = user.role === 'admin' || (user as any)?.roles?.role_permissions?.some(
      (rp: any) => rp.permissions?.code === 'roles:manage'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, permission_ids } = body;

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const { data: newRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .insert({
        name,
        description,
        company_id: user.company_id
      })
      .select('id')
      .single();

    if (roleError || !newRole) {
      console.error("Erro criar role:", roleError);
      return NextResponse.json({ error: 'Erro ao criar cargo' }, { status: 500 });
    }

    // Connect permissions
    if (permission_ids && permission_ids.length > 0) {
      const permsToInsert = permission_ids.map((pId: string) => ({
        role_id: newRole.id,
        permission_id: pId
      }));

      const { error: permError } = await supabaseAdmin
        .from('role_permissions')
        .insert(permsToInsert);

      if (permError) {
        console.error("Erro associar permissoes:", permError);
      }
    }

    return NextResponse.json({ success: true, id: newRole.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
