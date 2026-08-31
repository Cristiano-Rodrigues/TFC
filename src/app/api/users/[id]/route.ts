import { NextResponse } from 'next/server';
import { requireAuth, requirePermission, requireTenantResource, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'users:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { id } = await params;
    const body = await req.json();

    const { data: userToUpdate, error: fetchError } = await getAuthenticatedSupabase(session.token)
      .from('users')
      .select('company_id')
      .eq('id', id)
      .single();

    if (fetchError || !userToUpdate || !requireTenantResource(session, userToUpdate.company_id)) {
      return NextResponse.json({ error: 'Utilizador não encontrado ou sem permissão' }, { status: 404 });
    }

    const { error: updateError } = await getAuthenticatedSupabase(session.token)
      .from('users')
      .update({
        full_name: body.fullName,
        role_id: body.role_id,
        department_id: body.department_id,
        active: body.active
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao actualizar utilizador' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'users:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { id } = await params;

    const { data: userToDelete, error: fetchError } = await getAuthenticatedSupabase(session.token)
      .from('users')
      .select('company_id')
      .eq('id', id)
      .single();

    if (fetchError || !userToDelete || !requireTenantResource(session, userToDelete.company_id)) {
      return NextResponse.json({ error: 'Utilizador não encontrado ou sem permissão' }, { status: 404 });
    }

    const { error: deleteError } = await getAuthenticatedSupabase(session.token)
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Erro ao apagar utilizador' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
