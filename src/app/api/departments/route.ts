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

    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('id, name, description, created_at')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Depts fetch error:", error);
      return NextResponse.json({ error: 'Erro ao carregar departamentos' }, { status: 500 });
    }

    return NextResponse.json({ departments });
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
      (rp: any) => rp.permissions?.code === 'departments:manage'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const { data: newDept, error: deptError } = await supabaseAdmin
      .from('departments')
      .insert({
        name,
        description,
        company_id: user.company_id
      })
      .select('id')
      .single();

    if (deptError || !newDept) {
      console.error("Erro criar dept:", deptError);
      return NextResponse.json({ error: 'Erro ao criar departamento' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: newDept.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
