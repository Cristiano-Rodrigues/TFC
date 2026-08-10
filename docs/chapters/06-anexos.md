# Anexos

## Anexo I - Código Fonte Principal

O código integral do protótipo desenvolvido encontra-se disponível em repositório público (cujo link se encontra no resumo deste trabalho). Apresentam-se abaixo os trechos fundamentais que asseguram o funcionamento da filtragem de acesso e integração RAG.

### I.1. Função PL/pgSQL para Pesquisa Semântica com RBAC (`match_chunks`)

```sql
CREATE OR REPLACE FUNCTION public.match_chunks(
  p_embedding vector, 
  p_threshold double precision, 
  p_count integer, 
  p_company_id uuid DEFAULT NULL::uuid,
  p_user_id uuid DEFAULT NULL::uuid, 
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
    -- Bypass total para utilizadores com permissão explícita de visão global
    exists(
      select 1 from role_permissions rp
      join permissions p on p.id = rp.permission_id
      where rp.role_id = p_role_id and p.code = 'doc:view_all'
    )
    OR
    -- Fallback global: documentos públicos da própria empresa
    (
      not exists(select 1 from document_departments dd where dd.document_id = documents.id) 
      AND 
      not exists(select 1 from document_permissions dp where dp.document_id = documents.id)
    )
    OR
    -- Lógica de restrição combinada (AND / OR) do documento
    (
      CASE 
        WHEN COALESCE(documents.metadata->>'access_logic', 'AND') = 'OR' THEN
          (
            exists(
              select 1 from document_departments dd 
              where dd.document_id = documents.id and dd.department_id = p_department_id
            ) 
            OR 
            exists(
              select 1 from document_permissions dp 
              where dp.document_id = documents.id and dp.role_id = p_role_id
            )
          )
        ELSE
          (
            (
              not exists(select 1 from document_departments dd where dd.document_id = documents.id)
              OR
              exists(
                select 1 from document_departments dd 
                where dd.document_id = documents.id and dd.department_id = p_department_id
              )
            )
            AND 
            (
              not exists(select 1 from document_permissions dp where dp.document_id = documents.id)
              OR 
              exists(
                select 1 from document_permissions dp 
                where dp.document_id = documents.id and dp.role_id = p_role_id
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
```

### I.2. Endpoint Next.js para Encaminhamento RAG (`route.ts`)

```typescript
// Excerto simplificado de src/app/api/chat/route.ts
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    
    const payload = verifyToken(token);
    const { query } = await req.json();
    
    // Obtenção dos dados do utilizador a partir da base de dados do Supabase
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('company_id, department_id, role_id')
      .eq('id', payload.sub)
      .single();

    // Encaminhamento do pedido ao pipeline n8n com o respectivo contexto RAG seguro
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
      return result.answer.includes(source.title) || result.answer.includes(titleWithoutExt);
    });

    return NextResponse.json({
      answer: result.answer,
      sources: relevantSources
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
```
