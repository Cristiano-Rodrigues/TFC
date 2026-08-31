import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'roles:manage');
    if (!hasPermission) return unauthorizedResponse();

    const body = await req.json();
    const { name, description, permission_ids } = body;

    const { error: roleError } = await getAuthenticatedSupabase(session.token)
      .from('roles')
      .update({ name, description })
      .eq('id', id)
      .eq('company_id', session.company_id);

    if (roleError) {
      console.error("Erro actualizar role:", roleError);
      return NextResponse.json({ error: 'Erro ao actualizar cargo' }, { status: 500 });
    }

    // Connect permissions
    if (permission_ids !== undefined) {
      await getAuthenticatedSupabase(session.token)
        .from('role_permissions')
        .delete()
        .eq('role_id', id);

      if (permission_ids.length > 0) {
        const permsToInsert = permission_ids.map((pId: string) => ({
          role_id: id,
          permission_id: pId
        }));

        const { error: permError } = await getAuthenticatedSupabase(session.token)
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
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'roles:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { error } = await getAuthenticatedSupabase(session.token)
      .from('roles')
      .delete()
      .eq('id', id)
      .eq('company_id', session.company_id);

    if (error) {
      console.error("Erro eliminar role:", error);
      return NextResponse.json({ error: 'Erro ao eliminar cargo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
