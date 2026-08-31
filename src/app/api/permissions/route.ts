import { NextResponse } from 'next/server';
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'roles:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { data: permissions, error } = await getAuthenticatedSupabase(session.token)
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
