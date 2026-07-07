import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const department_ids_str = formData.get('department_ids') as string | null;
    const role_ids_str = formData.get('role_ids') as string | null;
    const access_logic = (formData.get('access_logic') as string) || 'AND';
    
    let role_ids: string[] = [];
    if (role_ids_str) {
      try { role_ids = JSON.parse(role_ids_str); } catch (e) {}
    }
    let department_ids: string[] = [];
    if (department_ids_str) {
      try { department_ids = JSON.parse(department_ids_str); } catch (e) {}
    }

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro recebido" }, { status: 400 });
    }

    const originalName = file.name || 'document';
    const lastDotIndex = originalName.lastIndexOf('.');
    let fileExt = '';
    if (lastDotIndex !== -1 && lastDotIndex !== 0) {
      fileExt = originalName.slice(lastDotIndex + 1);
    }
    
    if (fileExt && !/^[a-zA-Z0-9]+$/.test(fileExt)) {
      fileExt = '';
    }

    const fileName = fileExt ? `${crypto.randomUUID()}.${fileExt}` : crypto.randomUUID();
    const storagePath = `${payload.sub}/${fileName}`;

    const { error: storageError } = await supabaseAdmin
      .storage
      .from('rag_documents')
      .upload(storagePath, file);

    if (storageError) {
      console.error("Storage Error:", storageError);
      return NextResponse.json(
        { error: "Erro ao guardar o ficheiro na cloud", details: storageError.message },
        { status: 500 }
      );
    }

    const { data: docData, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        filename: file.name,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: payload.sub,
        n8n_status: 'pending',
        metadata: { access_logic }
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json(
        { error: "Erro ao guardar os metadados na base de dados", details: dbError.message },
        { status: 500 }
      );
    }

    if (role_ids.length > 0) {
      const permsToInsert = role_ids.map(rId => ({
        document_id: docData.id,
        role_id: rId
      }));
      const { error: permError } = await supabaseAdmin
        .from('document_permissions')
        .insert(permsToInsert);
      if (permError) {
        console.error("DB Perm Error:", permError);
      }
    }

    if (department_ids.length > 0) {
      const deptsToInsert = department_ids.map(dId => ({
        document_id: docData.id,
        department_id: dId
      }));
      const { error: deptError } = await supabaseAdmin
        .from('document_departments')
        .insert(deptsToInsert);
      if (deptError) {
        console.error("DB Dept Error:", deptError);
      }
    }

    let n8nTriggered = false;
    let n8nError: string | null = null;

    try {
      const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
      const n8nFormData = new FormData();
      n8nFormData.append('data', file);
      n8nFormData.append('document_id', docData.id);
      n8nFormData.append('user_id', payload.sub);
      if (department_ids.length > 0) {
        n8nFormData.append('department_ids', JSON.stringify(department_ids));
      }

      const n8nResponse = await fetch(`${n8nUrl}/upload`, {
        method: 'POST',
        body: n8nFormData,
        signal: AbortSignal.timeout(15000),
      });

      if (n8nResponse.ok) {
        n8nTriggered = true;
        await supabaseAdmin
          .from('documents')
          .update({ n8n_status: 'processing' })
          .eq('id', docData.id);
      } else {
        n8nError = `n8n respondeu com status ${n8nResponse.status}`;
        console.warn("n8n webhook warning:", n8nError);
      }
    } catch (err: any) {
      n8nError = err.message;
      console.warn("n8n webhook unreachable:", n8nError);
    }

    return NextResponse.json({
      success: true,
      message: n8nTriggered
        ? "Ficheiro guardado e pipeline de IA iniciado com sucesso."
        : "Ficheiro guardado com sucesso. Pipeline de IA será iniciado em breve.",
      document_id: docData.id,
      n8n_triggered: n8nTriggered,
      n8n_error: n8nError,
    });

  } catch (error: any) {
    console.error("Erro RAG Upload:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro ao submeter o ficheiro",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
