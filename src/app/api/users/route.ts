import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/hash';
import crypto from 'crypto';
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'users:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { email, fullName, role_id, department_id, password } = await req.json();

    if (!email || !fullName || !password || !role_id || !department_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        role_id,
        department_id,
        password_hash: passwordHash,
        company_id: session.company_id,
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
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'users:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, active, roles(id, name), departments(id, name)')
      .eq('company_id', session.company_id);

    const { data: rolesData, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('company_id', session.company_id);

    const { data: deptsData, error: deptsError } = await supabaseAdmin
      .from('departments')
      .select('id, name')
      .eq('company_id', session.company_id);

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
