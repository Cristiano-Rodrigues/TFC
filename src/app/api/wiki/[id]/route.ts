import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'wiki:edit');
    if (!hasPermission) return unauthorizedResponse();

    const { id } = await context.params;
    const body = await req.json();
    const { title, summary, content, status = 'draft', department_ids = [], role_ids = [], access_logic = 'AND' } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 });
    }

    const { error: dbError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .update({
        filename: title,
        n8n_status: status === 'published' ? 'pending' : 'draft',
        metadata: { 
            access_logic,
            content,
            summary,
            status,
            is_ai_generated: body.is_ai_generated || false,
            updated_at: new Date().toISOString()
        }
      })
      .eq('id', id)
      .eq('company_id', session.company_id);

    if (dbError) {
      console.error("DB Error (Wiki Update):", dbError);
      return NextResponse.json({ error: "Erro ao atualizar artigo", details: dbError.message }, { status: 500 });
    }

    await getAuthenticatedSupabase(session.token).from('document_permissions').delete().eq('document_id', id);
    if (role_ids.length > 0) {
      const permsToInsert = role_ids.map((rId: string) => ({
        document_id: id,
        role_id: rId
      }));
      await getAuthenticatedSupabase(session.token).from('document_permissions').insert(permsToInsert);
    }

    await getAuthenticatedSupabase(session.token).from('document_departments').delete().eq('document_id', id);
    if (department_ids.length > 0) {
      const deptsToInsert = department_ids.map((dId: string) => ({
        document_id: id,
        department_id: dId
      }));
      await getAuthenticatedSupabase(session.token).from('document_departments').insert(deptsToInsert);
    }
    
    let n8nTriggered = false;
    let n8nError = null;

    if (status === 'published') {
      try {
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
        const n8nResponse = await fetch(`${n8nUrl}/wiki/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: id,
            user_id: session.sub,
            company_id: session.company_id,
            content: content
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (n8nResponse.ok) {
          n8nTriggered = true;
          await getAuthenticatedSupabase(session.token)
            .from('documents')
            .update({ n8n_status: 'processing' })
            .eq('id', id);
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
      message: "Artigo atualizado com sucesso.",
      n8n_triggered: n8nTriggered
    });

  } catch (error: any) {
    console.error("Erro RAG Wiki Update:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao atualizar o artigo", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'wiki:delete');
    if (!hasPermission) return unauthorizedResponse();

    const { id } = await context.params;

    const { error: dbError } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('company_id', session.company_id);

    if (dbError) {
      console.error("DB Error (Wiki Delete):", dbError);
      return NextResponse.json({ error: "Erro ao apagar artigo", details: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Artigo apagado com sucesso" });

  } catch (error: any) {
    console.error("Erro RAG Wiki Delete:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao apagar o artigo", details: error.message }, { status: 500 });
  }
}
