import { NextResponse } from "next/server";
import { requireAuth, unauthenticatedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .select('id, filename, storage_path, file_size, mime_type, n8n_status, metadata, created_at, uploaded_by, document_permissions(roles(id, name)), document_departments(departments(id, name))')
      .eq('company_id', session.company_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Documents fetch error:", error);
      return NextResponse.json({ error: "Erro ao carregar documentos" }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
