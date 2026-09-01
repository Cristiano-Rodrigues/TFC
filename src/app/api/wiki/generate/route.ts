import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'wiki:create');
    if (!hasPermission) return unauthorizedResponse();

    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "O tópico é obrigatório" }, { status: 400 });
    }

    const supabase = getAuthenticatedSupabase(session.token);
    const { data: user } = await supabase
      .from('users')
      .select('id, department_id, role_id, company_id')
      .eq('id', session.sub)
      .single();

    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      throw new Error("N8N_WEBHOOK_URL não está configurada");
    }

    const n8nResponse = await fetch(`${n8nUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: topic, 
        type: 'wiki',
        company_id: user?.company_id, 
        user_id: user?.id,
        department_id: user?.department_id,
        role_id: user?.role_id
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!n8nResponse.ok) {
      throw new Error("Erro na comunicação com o n8n");
    }

    const data = await n8nResponse.json();
    
    let parsedData: any = {};
    try {
      let resultText = data.answer ? data.answer.trim() : "{}";
      if (resultText.startsWith('```json')) {
        resultText = resultText.replace(/```json\n?/, '').replace(/```$/, '').trim();
      } else if (resultText.startsWith('```')) {
        resultText = resultText.replace(/```\n?/, '').replace(/```$/, '').trim();
      }
      parsedData = JSON.parse(resultText);
    } catch (parseError) {
      console.error("Falha ao analisar a resposta JSON da AI:", parseError);
      parsedData = {
        title: `Artigo sobre ${topic}`,
        summary: "Não foi possível estruturar o artigo corretamente.",
        content: data.answer || "Conteúdo não disponível.",
        sources: []
      };
    }

    return NextResponse.json({
      title: parsedData.title || `Guia sobre ${topic}`,
      category: 'Geral',
      summary: parsedData.summary || '',
      content: parsedData.content || '',
      sources: parsedData.sources || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro Wiki Generator:", error);
    return NextResponse.json(
      {
        error: "Falha ao gerar o artigo automático da Wiki",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
