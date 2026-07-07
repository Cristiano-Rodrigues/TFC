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

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, department_id, role_id')
      .eq('id', payload.sub)
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
        role_id: user?.role_id
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

    return NextResponse.json({
      answer: data.answer || "Resposta não fornecida pelo modelo.",
      sources: data.sources || [],
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
