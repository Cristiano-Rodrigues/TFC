# Anexos

## Anexo I - Código Fonte Principal

O código integral do protótipo desenvolvido encontra-se disponível em repositório público (cujo link se encontra no resumo deste trabalho). Apresentam-se abaixo os trechos fundamentais que asseguram o funcionamento da filtragem de acesso e integração RAG.

### I.1. Função PL/pgSQL para Pesquisa Semântica com RBAC (`match_chunks`)

*Nota: A validação da identidade do utilizador (e da verificação de que o seu papel e departamento lhe pertencem de facto) é efectuada na camada aplicacional (Next.js) antes da invocação desta função, que recebe apenas os atributos já resolvidos e autenticados.*

\begin{lstlisting}[breaklines=true, language=SQL, basicstyle=\small\ttfamily]
CREATE OR REPLACE FUNCTION public.match_chunks(
  p_embedding vector, 
  p_threshold double precision, 
  p_count integer, 
  p_company_id uuid DEFAULT NULL::uuid,
  p_department_id uuid DEFAULT NULL::uuid, 
  p_role_id uuid DEFAULT NULL::uuid
)
 RETURNS TABLE(content text, filename text, document_id uuid)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select
    chunks.content,
    COALESCE(documents.filename, 'Desconhecido') as filename,
    documents.id as document_id
  from chunks
  left join documents on documents.id = chunks.document_id
  where 1 - (chunks.embedding <=> p_embedding) > p_threshold
  -- Imposição rigorosa de isolamento por Empresa (Tenant)
  and documents.company_id = p_company_id 
  and (
    -- Bypass total para utilizadores com permissão explícita
    exists(
      select 1 from role_permissions rp
      join permissions p on p.id = rp.permission_id
      where rp.role_id = p_role_id and p.code = 'doc:view_all'
    )
    OR
    -- Fallback global: documentos públicos da própria empresa
    (
      not exists(
        select 1 from document_departments dd 
        where dd.document_id = documents.id
      ) 
      AND 
      not exists(
        select 1 from document_permissions dp 
        where dp.document_id = documents.id
      )
    )
    OR
    -- Lógica de restrição combinada (AND / OR) do documento
    (
      CASE 
        WHEN COALESCE(documents.metadata->>'access_logic', 'AND') = 'OR' THEN
          (
            exists(
              select 1 from document_departments dd 
              where dd.document_id = documents.id 
                and dd.department_id = p_department_id
            ) 
            OR 
            exists(
              select 1 from document_permissions dp 
              where dp.document_id = documents.id 
                and dp.role_id = p_role_id
            )
          )
        ELSE
          (
            (
              not exists(
                select 1 from document_departments dd 
                where dd.document_id = documents.id
              )
              OR
              exists(
                select 1 from document_departments dd 
                where dd.document_id = documents.id 
                  and dd.department_id = p_department_id
              )
            )
            AND 
            (
              not exists(
                select 1 from document_permissions dp 
                where dp.document_id = documents.id
              )
              OR 
              exists(
                select 1 from document_permissions dp 
                where dp.document_id = documents.id 
                  and dp.role_id = p_role_id
              )
            )
          )
      END
    )
  )
  order by (1 - (chunks.embedding <=> p_embedding)) desc
  limit p_count;
end;
$function$;
\end{lstlisting}

### I.2. Endpoint Next.js para Encaminhamento RAG (`route.ts`)

\begin{lstlisting}[breaklines=true, language=Java, basicstyle=\small\ttfamily]
// Excerto simplificado de src/app/api/chat/route.ts
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' }, { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    const { query } = await req.json();
    
    // Obtenção dos dados do utilizador do Supabase
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('company_id, department_id, role_id')
      .eq('id', payload.sub)
      .single();

    // Encaminhamento do pedido ao pipeline n8n
    const response = await fetch(process.env.N8N_WEBHOOK_URL + '/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        user_id: payload.sub,
        company_id: user?.company_id,
        department_id: user?.department_id,
        role_id: user?.role_id
      })
    });

    const result = await response.json();
    
    // Filtro inteligente de fontes: apenas mostra ao utilizador
    // os documentos que a IA efetivamente referenciou na resposta.
    const relevantSources = (result.sources || []).filter((source: any) => {
      if (!source.title) return false;
      const titleWithoutExt = source.title.replace(/\.[^/.]+$/, "");
      return result.answer.includes(source.title) || 
             result.answer.includes(titleWithoutExt);
    });

    return NextResponse.json({
      answer: result.answer,
      sources: relevantSources
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no servidor" }, { status: 500 }
    );
  }
}
\end{lstlisting}

## Anexo II - Prompts e Configurações do Sistema

Para assegurar o alinhamento das respostas geradas pelo modelo LLM com a realidade corporativa e com os requisitos de conformidade (APD), definiu-se a seguinte Instrução de Sistema (*System Prompt*), que é embutida no pipeline do n8n:

**Instrução de Sistema (*System Prompt*):**
\begin{lstlisting}[breaklines=true, basicstyle=\small\ttfamily]
És um assistente corporativo rigoroso, profissional e de total confiança. 
O teu objectivo é responder às perguntas do utilizador baseando-te EXCLUSIVAMENTE 
no contexto documental fornecido abaixo.

REGRAS ESTritas:
1. Responde apenas usando as informações presentes no CONTEXTO FORNECIDO.
2. Se a resposta não estiver no contexto, diz categoricamente: 
   "Não possuo informações nos meus registos para responder a esta questão."
3. Não inventes, não deduza nem acrescentes informações externas.
4. AUDITORIA DE PRIVACIDADE: Se o contexto recuperado contiver Dados 
   Pessoais Sensíveis (PII) explícitos que não tenham relação direta e 
   estritamente necessária com a pergunta do utilizador, deves mascará-los 
   (ex: [DADO OCULTO]) na tua resposta.
5. Usa formatação Markdown (negritos, listas) para tornar a leitura clara.
6. Sempre que usares um dado do contexto, refere de forma natural o documento 
   de onde retiraste a informação (ex: "De acordo com o documento X...").

CONTEXTO FORNECIDO:
{{ $json.contexto_recuperado }}
\end{lstlisting}

**Configurações Chave do Modelo (Cohere command-r-plus-08-2024):**
*   **Temperature:** 0.1 (Garante consistência e previsibilidade, reduzindo criatividade desnecessária ou alucinações).
*   **Max Tokens:** 1024 (Suficiente para respostas abrangentes sem sobrecarregar a janela de contexto de saída).
*   **Presence Penalty:** 0.0 (O modelo não é penalizado por reutilizar vocabulário, mantendo o jargão técnico das fontes inalterado).
