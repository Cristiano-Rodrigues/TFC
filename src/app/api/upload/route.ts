import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // Expected structure: formData.get('file') is a File
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro recebido" }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
    
    // n8n expects the binary data often in "data" property via multipart form
    const n8nFormData = new FormData();
    n8nFormData.append('data', file);

    const response = await fetch(`${n8nUrl}/upload`, {
      method: 'POST',
      body: n8nFormData,
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: "Upload enviado com sucesso para o n8n.",
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
