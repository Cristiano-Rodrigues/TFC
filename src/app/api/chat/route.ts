import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const { data: user } = await getAuthenticatedSupabase(session.token)
      .from('users')
      .select('id, department_id, role_id, company_id')
      .eq('id', session.sub)
      .single();

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia registrada" }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
    const response = await fetch(`${n8nUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: message,
        user_id: user?.id,
        department_id: user?.department_id,
        role_id: user?.role_id,
        company_id: user?.company_id
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    const textResponse = await response.text();
    let data;
    try {
      data = textResponse ? JSON.parse(textResponse) : {};
    } catch (parseError) {
      console.error("n8n retornou uma resposta inválida:", textResponse);
      throw new Error(`O n8n devolveu uma resposta não-JSON ou vazia: ${textResponse.slice(0, 100)}...`);
    }

    const rawAnswer = data.answer || "Resposta não fornecida pelo modelo.";
    const allSources = data.sources || [];
    const relevantSources = allSources.filter((source: any) => {
      if (!source.title) return false;
      const titleWithoutExt = source.title.replace(/\.[^/.]+$/, "");
      return rawAnswer.includes(source.title) || rawAnswer.includes(titleWithoutExt);
    });

    return NextResponse.json({
      answer: rawAnswer,
      sources: relevantSources,
    });
  } catch (error: any) {
    console.error("Erro RAG Chat:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro ao processar a pesquisa inteligente",
        details: error.message,
        answer: "Ocorreu um erro ao tentar processar o seu pedido via IA. Verifique se o n8n está em execução.",
        sources: [],
      },
      { status: 500 }
    );
  }
}
