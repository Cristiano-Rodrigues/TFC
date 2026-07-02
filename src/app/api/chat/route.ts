import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
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
      body: JSON.stringify({ query: message }),
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

    console.log("data: ", data)

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
