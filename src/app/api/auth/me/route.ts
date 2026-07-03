import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        full_name, 
        active, 
        company_id,
        companies (
          name
        ),
        roles (
          id,
          name,
          role_permissions (
            permissions (
              code
            )
          )
        ),
        departments (
          id,
          name
        )
      `)
      .eq('id', payload.sub)
      .single();

    const userRecord = data as any;

    if (error || !userRecord) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    let permissions: string[] = [];
    if (userRecord.roles?.role_permissions) {
      permissions = userRecord.roles.role_permissions
        .map((rp: any) => rp.permissions?.code)
        .filter(Boolean);
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      full_name: userRecord.full_name,
      active: userRecord.active,
      company_id: userRecord.company_id,
      companyName: userRecord.companies?.name || 'A Minha Organização',
      role_id: userRecord.roles?.id,
      role: userRecord.roles?.name || 'user',
      department_id: userRecord.departments?.id,
      department: userRecord.departments?.name || 'Geral',
      permissions
    };

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
