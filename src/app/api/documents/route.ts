import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';

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

    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('id, filename, storage_path, file_size, mime_type, n8n_status, metadata, created_at, uploaded_by')
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
