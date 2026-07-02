# Guia de Configuração (TFC)

Este guia explica passo a passo como  colocar este projeto em funcionamento, incluindo o frontend em React/Next.js, a base de dados no Supabase e o pipeline de RAG no n8n.

---

## Estrutura de Ficheiros

No repositório, foram criadas duas pastas principais que contêm as definições necessárias:
1. **`supabase/schema.sql`**: Contém todo o esquema de tabelas para o modelo SaaS Multi-Tenant com suporte a empresas, cargos dinâmicos, permissões globais e funções (como `match_chunks`).
2. **`n8n/minimal_ai_ingestion_pipeline.json`**: Contém o fluxo completo do pipeline RAG pronto a ser importado para o n8n (com placeholders para as chaves secretas).

---

## Passo 1: Configuração do Supabase (Base de Dados)

A pessoa que vai testar o projeto deve seguir estes passos:

1. Criar um projeto gratuito no [Supabase](https://supabase.com/).
2. No painel do projeto Supabase, aceder ao **SQL Editor** (no menu lateral esquerdo).
3. Criar uma nova query, colar todo o conteúdo do ficheiro `supabase/schema.sql` e clicar em **Run**.
   * *Isto ativará a extensão `vector`, criará todas as tabelas necessárias para o modelo SaaS Multi-Tenant e inserirá as permissões por defeito.*
4. Aceder a **Project Settings > API** e recolher o **Project URL**, a **anon public / publishable key** e a **service_role secret**. Esta última é vital para que o nosso backend consiga fazer upload de ficheiros para a cloud contornando as restrições normais de segurança (RLS).
5. Aceder ao menu **Storage** (no menu lateral esquerdo), e criar um novo bucket chamado `rag_documents` (pode deixá-lo público ou privado, conforme a necessidade). Sem isto os uploads de documentos irão falhar.

> [!WARNING]
> **Nota de Segurança sobre RLS (Row Level Security):**
> Por predefinição, as tabelas criadas no Supabase não têm as políticas de RLS ativas para facilitar o desenvolvimento local. Para um ambiente de produção ou testes públicos seguros, deves ativar o RLS e configurar políticas específicas.
> Podes ativar o RLS correndo:
> ```sql
> ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
> ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
> -- Repetir para as restantes tabelas se necessário
> ```

---

## Passo 2: Configuração do n8n

O n8n é o motor que processa os uploads de ficheiros, gera os embeddings com a Cohere e armazena os vetores no Supabase.

1. Abrir a instância do n8n.
2. Criar um novo fluxo (workflow) e, no canto superior direito, clicar nos três pontos (`...`) e selecionar **Import from File**. Escolher o ficheiro `n8n/minimal_ai_ingestion_pipeline.json`.
3. Configurar as credenciais nos nós correspondentes:
   * **Nós do Cohere (Embeddings e Chat)**:
     * Substituir o placeholder `YOUR_COHERE_API_KEY` pela chave de API da Cohere nos cabeçalhos `Authorization` (ex: `Bearer <chave>`).
   * **Nó Supabase Vector Store**:
     * Clicar no nó e associar uma conta do Supabase (introduzindo o URL e a chave de serviço/anon).
   * **Nó Supabase_RPC_Search_Manual**:
     * Alterar o URL para apontar para o novo projeto: `https://<NOVO_PROJECT_REF>.supabase.co/rest/v1/rpc/match_chunks`.
     * Alterar as variáveis nos cabeçalhos `apikey` e `Authorization` para a nova chave anónima do Supabase.
4. Clicar em **Active** (ou guardar e ativar) para colocar o webhook em funcionamento.
5. Registar os URLs de Webhook gerados pelos nós de Trigger:
   * O URL terminado em `/upload` (produção ou teste).
   * O URL terminado em `/query` (produção ou teste).

---

## Passo 3: Configuração da Aplicação Frontend (Next.js)

1. Clonar o repositório Git:
   ```bash
   git clone <URL_DO_TEU_REPOSITORIO>
   cd TFC
   ```
2. Aceder à pasta `src` e duplicar o ficheiro `.env.example` criando um ficheiro `.env` (ou `.env.local`):
   ```bash
   cp src/.env.example src/.env
   ```
3. Preencher o ficheiro `.env` com as configurações do novo ambiente:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<NOVO_PROJECT_REF>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key...
   N8N_WEBHOOK_URL=http://localhost:5678/webhook
   ```
   *(Nota: Se o n8n estiver a correr localmente, manter `http://localhost:5678/webhook`. Se estiver online, usar o URL de produção do n8n sem a parte do `/upload` ou `/query`, já que o código concatena estes caminhos dinamicamente).*
4. Instalar as dependências e iniciar o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```

---

## Passo 4: Como Testar a Integração

1. **Registo de Empresa (SaaS)**: Aceder à aplicação Next.js e criar uma **Empresa**. Isto irá registar o primeiro administrador e inicializar automaticamente os cargos (roles) e departamentos da empresa.
2. **Criação de Utilizadores**: Aceder ao painel de administração (apenas para o admin da empresa) para criar outros utilizadores (não é necessário que eles se registem por si próprios). Eles farão o login com as credenciais provisórias e poderão alterá-las futuramente.
2. **Upload de Documentos**: Fazer o upload de um ficheiro (ex: um documento de texto ou PDF) no menu correspondente. A aplicação enviará o ficheiro para o n8n (`/upload`), que fará a extração de texto, chunking, geração de embeddings na Cohere e gravação na tabela `chunks` do Supabase.
3. **Chat Inteligente**: Enviar uma pergunta no Chat. A aplicação chamará a rota do Next.js que envia o pedido ao n8n (`/query`). O n8n gerará o embedding da pergunta, procurará os trechos mais semelhantes no Supabase através do RPC `match_chunks` e enviará a resposta final produzida pela Cohere.
