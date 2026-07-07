import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
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

    const hasPermission = (user as any)?.roles?.role_permissions?.some(
      (rp: any) => rp.permissions?.code === 'roles:manage'
    );

    if (userErr || !user || !hasPermission) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, permission_ids } = body;

    const { error: roleError } = await supabaseAdmin
      .from('roles')
      .update({ name, description })
      .eq('id', id)
      .eq('company_id', user.company_id);

    if (roleError) {
      console.error("Erro atualizar role:", roleError);
      return NextResponse.json({ error: 'Erro ao atualizar cargo' }, { status: 500 });
    }

    // Connect permissions
    if (permission_ids !== undefined) {
      await supabaseAdmin
        .from('role_permissions')
        .delete()
        .eq('role_id', id);

      if (permission_ids.length > 0) {
        const permsToInsert = permission_ids.map((pId: string) => ({
          role_id: id,
          permission_id: pId
        }));

        const { error: permError } = await supabaseAdmin
          .from('role_permissions')
          .insert(permsToInsert);

        if (permError) {
          console.error("Erro associar permissoes:", permError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
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

    const hasPermission = (user as any)?.roles?.role_permissions?.some(
      (rp: any) => rp.permissions?.code === 'roles:manage'
    );

    if (userErr || !user || !hasPermission) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', id)
      .eq('company_id', user.company_id);

    if (error) {
      console.error("Erro eliminar role:", error);
      return NextResponse.json({ error: 'Erro ao eliminar cargo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
