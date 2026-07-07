import { NextResponse } from 'next/server';
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

    const { data: permissions, error } = await supabaseAdmin
      .from('permissions')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      console.error("Permissions fetch error:", error);
      return NextResponse.json({ error: 'Erro ao carregar permissões' }, { status: 500 });
    }

    return NextResponse.json({ permissions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
