import { NextRequest, NextResponse } from "next/server";
import { ai, GEMINI_MODEL } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { topic, department } = await req.json();

    if (!topic || !department) {
      return NextResponse.json({ error: "Tópico e departamento são obrigatórios" }, { status: 400 });
    }

    if (!ai) {
      // Graceful fallback article
      const fallbackTitle = `Guia Geral sobre ${topic}`;
      return NextResponse.json({
        title: fallbackTitle,
        category: department,
        summary: `Resumo gerado automaticamente sobre ${topic} para o departamento de ${department}.`,
        content: `### 1. Visão Geral\nEste artigo corporativo descreve as principais diretrizes sobre **${topic}** no âmbito do departamento de **${department}**.\n\n### 2. Procedimentos Recomendados\n* **Acompanhamento**: Manter registo detalhado de todas as operações associadas ao tópico.\n* **Conformidade**: Validar os dados internamente com as chefias de equipa da área de ${department}.\n* **Garantia de Qualidade**: Assegurar o reporte de quaisquer anomalias observadas de imediato.\n\n### 3. Conclusão e Recursos\nPara consultar mais dados práticos detalhados, use o nosso motor de Pesquisa Inteligente RAG na barra de ferramentas lateral do portal.`,
        sources: ["Manual Organizacional Global"],
        generatedAt: new Date().toISOString(),
      });
    }

    const systemInstruction = `Você é o Redator-Chefe de Inteligência Artificial para a Wiki Corporativa de uma grande organização.
Seu objetivo é criar um artigo técnico, estruturado, polido e denso (Wiki corporativa) para sanar dúvidas comuns no assunto: "${topic}" pertencente ao departamento de "${department}".

REGRAS DO ARTIGO:
1. O artigo deve conter títulos limpos no padrão Markdown (ex: ### 1. Introdução, ### 2. Melhores Práticas, ### 3. Fluxo de Trabalho).
2. Escreva num tom corporativo neutro e sério, livre de jargões de inteligência artificial ou saudações enérgicas.
3. Crie tópicos bem construídos com resumos informativos.
4. Inclua referências realistas a documentos internos de trabalho (ex: Manuais Operacionais, Normativos de Compliance, Matriz de Responsabilidades).

Retorne obrigatoriamente um formato estruturado em JSON com os seguintes campos:
- title: Título elegante do artigo para a Wiki.
- summary: Um parágrafo de resumo em uma linha que introduza as diretrizes chave deste tópico.
- content: Conteúdo completo formatado em Markdown com títulos com hashtags (###), negritos e listas por marcadores.
- sources: Array contendo de 1 a 3 fontes simuladas que embasaram este compilado de conhecimento.`;

    const promptText = `Por favor, elabore um artigo corporativo aprofundado para a nossa Wiki sobre o tema: "${topic}" pertencente ao departamento de "${department}".`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
            sources: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "summary", "content", "sources"],
        },
      },
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const parsedData = JSON.parse(resultText);

    return NextResponse.json({
      title: parsedData.title,
      category: department,
      summary: parsedData.summary,
      content: parsedData.content,
      sources: parsedData.sources,
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
