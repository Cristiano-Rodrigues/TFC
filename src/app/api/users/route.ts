import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/hash';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

    const { email, fullName, role_id, department_id, password } = await req.json();

    if (!email || !fullName || !password || !role_id || !department_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        role_id,
        department_id,
        password_hash: passwordHash,
        company_id: payload.company_id,
        active: true
      })
      .select('id, email, full_name, active, role_id, department_id')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, full_name, active, roles(id, name), departments(id, name)')
      .eq('company_id', payload.company_id);

    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('company_id', payload.company_id);

    const { data: deptsData, error: deptsError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('company_id', payload.company_id);

    if (usersError || rolesError || deptsError) {
      return NextResponse.json({ error: 'Erro ao listar dados' }, { status: 500 });
    }

    const formattedUsers = usersData?.map((u: any) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      active: u.active,
      role: u.roles?.name || 'N/A',
      department: u.departments?.name || 'N/A',
      role_id: u.roles?.id,
      department_id: u.departments?.id
    })) || [];

    return NextResponse.json({ users: formattedUsers, roles: rolesData || [], departments: deptsData || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
