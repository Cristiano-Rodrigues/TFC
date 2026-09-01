import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .select('id, filename, metadata, created_at, uploaded_by, document_permissions(roles(id, name)), document_departments(departments(id, name))')
      .eq('company_id', session.company_id)
      .eq('source_type', 'wiki')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Wiki fetch error:", error);
      return NextResponse.json({ error: "Erro ao carregar os artigos da wiki" }, { status: 500 });
    }

    return NextResponse.json({ articles: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'wiki:create');
    if (!hasPermission) return unauthorizedResponse();

    const body = await req.json();
    const { title, summary, content, status = 'draft', department_ids = [], role_ids = [], access_logic = 'AND' } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
    }

    const documentId = crypto.randomUUID();

    const { data: docData, error: dbError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .insert({
        id: documentId,
        filename: title,
        uploaded_by: session.sub,
        company_id: session.company_id,
        n8n_status: status === 'published' ? 'pending' : 'draft',
        source_type: 'wiki',
        metadata: { 
          access_logic,
          content,
          summary,
          status,
          is_ai_generated: body.is_ai_generated || false,
          updated_at: new Date().toISOString()
        }
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("DB Error (Wiki Create):", dbError);
      return NextResponse.json({ error: "Erro ao criar artigo", details: dbError.message }, { status: 500 });
    }

    if (role_ids.length > 0) {
      const permsToInsert = role_ids.map((rId: string) => ({
        document_id: docData.id,
        role_id: rId
      }));
      await getAuthenticatedSupabase(session.token).from('document_permissions').insert(permsToInsert);
    }

    if (department_ids.length > 0) {
      const deptsToInsert = department_ids.map((dId: string) => ({
        document_id: docData.id,
        department_id: dId
      }));
      await getAuthenticatedSupabase(session.token).from('document_departments').insert(deptsToInsert);
    }
    
    let n8nTriggered = false;
    let n8nError = null;

    if (status === 'published') {
      try {
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
        const n8nResponse = await fetch(`${n8nUrl}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: docData.id,
            filename: title,
            user_id: session.sub,
            company_id: session.company_id,
            data: content
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (n8nResponse.ok) {
          n8nTriggered = true;
          await getAuthenticatedSupabase(session.token)
            .from('documents')
            .update({ n8n_status: 'processing' })
            .eq('id', docData.id);
        } else {
          n8nError = `n8n respondeu com status ${n8nResponse.status}`;
        }
      } catch (err: any) {
        n8nError = err.message;
        console.warn("n8n webhook unreachable:", n8nError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Artigo guardado com sucesso.",
      document_id: docData.id,
      n8n_triggered: n8nTriggered
    });

  } catch (error: any) {
    console.error("Erro RAG Wiki Create:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao guardar o artigo", details: error.message }, { status: 500 });
  }
}
