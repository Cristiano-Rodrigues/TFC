import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const { data: roles, error } = await getAuthenticatedSupabase(session.token)
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
      .eq('company_id', session.company_id)
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
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'roles:manage');
    if (!hasPermission) return unauthorizedResponse();

    const body = await req.json();
    const { name, description, permission_ids } = body;

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const { data: newRole, error: roleError } = await getAuthenticatedSupabase(session.token)
      .from('roles')
      .insert({
        name,
        description,
        company_id: session.company_id
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

      const { error: permError } = await getAuthenticatedSupabase(session.token)
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
