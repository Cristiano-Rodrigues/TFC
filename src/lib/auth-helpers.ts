import { headers } from 'next/headers';
import { getAuthenticatedSupabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export interface AuthSession {
  sub: string;
  email: string;
  role: string;
  company_id: string;
  token: string;
}

export async function requireAuth(): Promise<AuthSession | null> {
  const headersList = await headers();
  const sub = headersList.get('x-user-sub');
  const company_id = headersList.get('x-company-id');
  const role = headersList.get('x-user-role');
  const email = headersList.get('x-user-email');
  const token = headersList.get('x-auth-token');
  
  if (!sub || !company_id || !token) return null;
  
  return {
    sub,
    company_id,
    role: role || '',
    email: email || '',
    token
  };
}

export async function requirePermission(session: AuthSession, permissionCode: string): Promise<boolean> {
  if (session.role === 'admin') return true;

  const { data: userRecord } = await getAuthenticatedSupabase(session.token)
    .from('users')
    .select('roles(role_permissions(permissions(code)))')
    .eq('id', session.sub)
    .single();

  const permissions = (userRecord as any)?.roles?.role_permissions || [];
  return permissions.some((rp: any) => rp.permissions?.code === permissionCode);
}

export function requireTenantResource(session: AuthSession, resourceCompanyId: string): boolean {
  return session.company_id === resourceCompanyId;
}

export function unauthorizedResponse(message: string = 'Não autorizado') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function unauthenticatedResponse() {
  return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}
