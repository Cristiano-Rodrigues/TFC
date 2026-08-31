import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireTenantResource, unauthenticatedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const { department_ids, role_ids, access_logic } = await req.json();

    if (!Array.isArray(department_ids) || !Array.isArray(role_ids) || !access_logic) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const { data: docToUpdate, error: fetchError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .select('company_id')
      .eq('id', id)
      .single();

    if (fetchError || !docToUpdate || !requireTenantResource(session, docToUpdate.company_id)) {
      return NextResponse.json({ error: 'Documento não encontrado ou acesso negado' }, { status: 404 });
    }

    const { error: updateError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .update({ metadata: { access_logic } })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await getAuthenticatedSupabase(session.token).from('document_departments').delete().eq('document_id', id);
    await getAuthenticatedSupabase(session.token).from('document_permissions').delete().eq('document_id', id);

    if (department_ids.length > 0) {
      const deptsToInsert = department_ids.map((dId: string) => ({
        document_id: id,
        department_id: dId
      }));
      await getAuthenticatedSupabase(session.token).from('document_departments').insert(deptsToInsert);
    }

    if (role_ids.length > 0) {
      const permsToInsert = role_ids.map((rId: string) => ({
        document_id: id,
        role_id: rId
      }));
      await getAuthenticatedSupabase(session.token).from('document_permissions').insert(permsToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const { data: docData, error: fetchError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .select('storage_path, company_id')
      .eq('id', id)
      .single();

    if (fetchError || !docData || !requireTenantResource(session, docData.company_id)) {
      return NextResponse.json({ error: 'Documento não encontrado ou acesso negado' }, { status: 404 });
    }

    const { error: dbError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    if (docData?.storage_path) {
      await getAuthenticatedSupabase(session.token).storage.from('rag_documents').remove([docData.storage_path]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
