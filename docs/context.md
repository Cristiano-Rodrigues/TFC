# Contexto Completo do TFC

> **Título:** Sistema de Gestão da Informação Organizacional Baseado em Agentes de Inteligência Artificial para Organizações Angolanas
>
> **Autor:** Cristiano Rodrigues
>
> **Instituição:** ISAF (Instituto Superior de Administração e Finanças)
>
> **Tipo:** Trabalho Final de Curso (TFC) — componente teórica + componente prática (protótipo funcional)
>
> **Data de última actualização deste ficheiro:** 2026-07-14

---

## 1. Visão Geral do Projecto

Este TFC é composto por duas vertentes:

1. **Vertente Teórica** — Monografia académica que fundamenta o problema, revisa a literatura, descreve a metodologia e apresenta os resultados.
2. **Vertente Prática** — Protótipo funcional de uma plataforma SaaS Multi-Tenant para gestão inteligente de documentos com Inteligência Artificial (RAG — Retrieval-Augmented Generation).

O projecto demonstra como organizações angolanas podem centralizar, classificar e recuperar informação organizacional dispersa através de agentes de IA, combinando tecnologias modernas de desenvolvimento web com pipelines de processamento de linguagem natural.

---

## 2. Problema de Investigação

**Pergunta central:** Como desenvolver um sistema de gestão da informação organizacional, baseado em agentes de inteligência artificial, capaz de centralizar, classificar e facilitar a recuperação inteligente da informação em organizações angolanas?

### Contexto do Problema
- Nas organizações angolanas, a informação encontra-se dispersa em silos (documentos, emails, plataformas isoladas).
- Processos manuais ou sistemas legados dificultam a recuperação de dados críticos.
- A digitalização em Angola tem priorizado hardware, negligenciando a camada de inteligência aplicacional.
- A IA ainda é vista como ferramenta de futuro, não como necessidade operacional imediata.

### Objectivos
**Geral:** Desenvolver um sistema baseado em agentes de IA para apoiar a centralização, classificação e recuperação inteligente da informação.

**Específicos:**
1. Identificar os principais desafios na gestão da informação no contexto angolano.
2. Analisar soluções existentes de gestão da informação e sistemas inteligentes.
3. Modelar a arquitectura de um sistema baseado em agentes de IA.
4. Implementar um protótipo funcional do sistema.
5. Avaliar o desempenho quanto à eficiência na recuperação da informação.

---

## 3. Estado Actual da Monografia Teórica

A monografia encontra-se **integralmente redigida** em ficheiros Markdown na pasta `docs/chapters/`, substituindo o rascunho inicial em formato `.docx`. Todos os 5 capítulos exigidos pelo modelo do ISAF foram concluídos, revistos e integrados no pipeline de compilação automática para PDF.

### Capítulos Concluídos
1. `01-introducao.md` — Problema, objectivos, justificativa e limitações.
2. `02-fundamentacao-teorica.md` — Revisão de literatura, RAG, agentes de IA, e controlo de acessos multi-tenant.
3. `03-procedimentos-metodologicos.md` — Desenho da pesquisa, instrumentos de recolha e protocolo de avaliação.
4. `04-resultados.md` — Apresentação do protótipo, diagramas UML e Entidade-Relacional, e testes de desempenho/segurança.
5. `05-consideracoes-finais.md` — Conclusões, resposta à problemática e sugestões para trabalhos futuros.

---

## 4. Estrutura Consolidada da Monografia (Modelo IGF)

Com base no modelo de referência (`Modelo_TFC_IGF.pdf`), a estrutura final desenvolvida é:

```
ÍNDICE GERAL
1. INTRODUÇÃO
   1.2. Problemática da pesquisa
   1.3. Objectivo da pesquisa
   1.4. Justificativa
   1.5. Organização do Trabalho

2. FUNDAMENTAÇÃO TEÓRICA
   2.1. [Subcapítulos adaptados ao tema — ver proposta abaixo]
   ...

3. PROCEDIMENTOS METODOLÓGICOS
   3.1. Tipo de pesquisa
   3.2. Pesquisa bibliográfica
   3.3. População, amostra e amostragem
   3.4. Técnicas e instrumentos de recolha de dados

4. RESULTADOS DA PESQUISA
   4.1. Apresentação e análise dos resultados
     4.1.1. Metodologia do desenvolvimento
     4.1.2. Requisitos (Funcionais e Não Funcionais)
     4.1.3. Modelagem do Sistema
       - Diagrama de Contexto
       - Diagrama de Casos de Usos
       - Especificação dos casos de usos
       - Diagrama de Classes
       - Diagrama Entidade Relacional
     4.1.4. Qualidade do Software
     4.1.5. Desenho do Sistema
       - Escopo do Sistema
       - Descrição dos Módulos
       - Arquitectura Física e Lógica
       - Ferramentas e Tecnologias Utilizadas
       - Testes Realizados
       - Protótipo das Telas
       - Codificação
       - Segurança aplicada no sistema

5. CONSIDERAÇÕES FINAIS
   5.1. Conclusões
   5.2. Sugestões e Recomendações

BIBLIOGRAFIA
```

### Proposta de Subcapítulos para a Fundamentação Teórica (adaptada ao tema)
```
2. FUNDAMENTAÇÃO TEÓRICA
   2.1. Gestão da Informação Organizacional
     2.1.1. Conceito e importância da informação nas organizações
     2.1.2. Ciclo de vida da informação (Modelo de Choo)
     2.1.3. Desafios da gestão da informação no contexto angolano
   2.2. Inteligência Artificial
     2.2.1. Conceitos fundamentais de IA
     2.2.2. Processamento de Linguagem Natural (NLP)
     2.2.3. Modelos de Linguagem de Grande Escala (LLMs)
     2.2.4. Embeddings e representação vectorial de texto
   2.3. Retrieval-Augmented Generation (RAG)
     2.3.1. Conceito e arquitectura RAG
     2.3.2. Processo de chunking e indexação
     2.3.3. Busca semântica vs busca por palavras-chave
     2.3.4. Vantagens do RAG sobre abordagens tradicionais
   2.4. Sistemas Multiagentes (SMA)
     2.4.1. Definição de agentes de software
     2.4.2. Arquitecturas multiagentes
     2.4.3. Aplicações em gestão de informação
   2.5. Tecnologias de Desenvolvimento Web
     2.5.1. Arquitectura SaaS Multi-Tenant
     2.5.2. Frameworks e ferramentas modernas (React, Next.js)
     2.5.3. Bases de dados vectoriais (pgvector)
     2.5.4. Plataformas de automação e orquestração (n8n)
   2.6. Controlo de Acessos Baseado em Papéis (RBAC)
     2.6.1. Conceitos de RBAC
     2.6.2. Aplicação em ambientes multi-tenant
   2.7. Estado da Arte
     2.7.1. Soluções existentes de gestão documental inteligente
     2.7.2. Comparação com a solução proposta
```

---

## 5. Arquitectura Técnica do Protótipo (Componente Prática)

### 5.1. Stack Tecnológica

| Camada | Tecnologia | Papel |
|--------|-----------|-------|
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS 4 | Interface do utilizador SPA |
| **Backend/API** | Next.js API Routes (App Router) | Lógica de negócio, autenticação, proxy para n8n |
| **Base de Dados** | Supabase (PostgreSQL) | Dados relacionais, metadados, autenticação |
| **Vector Store** | pgvector (extensão PostgreSQL) | Armazenamento de embeddings para busca semântica |
| **Storage** | Supabase Storage (bucket `rag_documents`) | Ficheiros originais uploaded |
| **Pipeline IA** | n8n (workflow automation) | Orquestração do pipeline RAG |
| **Embeddings** | Cohere (API) | Geração de embeddings vectoriais (1024 dimensões) |
| **LLM** | Cohere (Chat) | Geração de respostas baseadas em contexto |
| **Animações** | Framer Motion | Micro-animações e transições da UI |
| **Ícones** | Lucide React | Iconografia consistente |
| **Formulários** | React Hook Form + Zod | Validação de formulários |

### 5.2. Arquitectura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILIZADOR                              │
│                     (Browser / Next.js)                         │
└──────────────┬────────────────────────────┬─────────────────────┘
               │                            │
               ▼                            ▼
┌──────────────────────┐      ┌──────────────────────────┐
│   Next.js API Routes │      │    Supabase (PostgreSQL)  │
│   /api/auth/*        │      │    ┌──────────────────┐   │
│   /api/documents/*   │◄────►│    │ companies        │   │
│   /api/users/*       │      │    │ users            │   │
│   /api/departments/* │      │    │ roles            │   │
│   /api/roles/*       │      │    │ permissions      │   │
│   /api/chat/*        │      │    │ documents        │   │
│   /api/upload/*      │      │    │ chunks (vector)  │   │
│   /api/wiki/*        │      │    │ ai_chat_sessions │   │
│   /api/dashboard/*   │      │    │ ai_chat_messages │   │
└──────────┬───────────┘      │    │ departments      │   │
           │                  │    │ role_permissions  │   │
           ▼                  │    │ document_depts   │   │
┌──────────────────────┐      │    │ document_perms   │   │
│    n8n Workflows     │      │    └──────────────────┘   │
│                      │      │                           │
│  ┌─── /upload ────┐  │      │    ┌──────────────────┐   │
│  │ Extract Text   │  │      │    │ Supabase Storage  │   │
│  │ Chunk Text     │  │      │    │ (rag_documents)   │   │
│  │ Embed (Cohere) │  │◄────►│    └──────────────────┘   │
│  │ Store Vectors  │  │      │                           │
│  └────────────────┘  │      │    ┌──────────────────┐   │
│                      │      │    │ pgvector          │   │
│  ┌─── /query ─────┐  │      │    │ (embeddings)      │   │
│  │ Embed Question │  │      │    └──────────────────┘   │
│  │ match_chunks() │  │◄────►│                           │
│  │ LLM Response   │  │      └───────────────────────────┘
│  └────────────────┘  │
└──────────────────────┘
```

### 5.3. Modelo de Dados (Schema SQL)

O schema da base de dados inclui:

- **`companies`** — Tabela de empresas (tenants). Cada empresa é um espaço isolado.
- **`departments`** — Departamentos organizacionais, ligados a uma empresa.
- **`roles`** — Cargos/papéis dentro da empresa (ex: admin, gestor, operador).
- **`permissions`** — Permissões globais do sistema (ex: `doc:view`, `doc:upload`, `users:manage`).
- **`role_permissions`** — Associação N:N entre cargos e permissões.
- **`users`** — Utilizadores, cada um associado a uma empresa, um cargo e um departamento.
- **`documents`** — Registo de documentos uploaded (metadados, estado n8n, referência ao storage).
- **`document_departments`** — Controlo de acesso por departamento.
- **`document_permissions`** — Controlo de acesso por cargo.
- **`chunks`** — Trechos de texto extraídos dos documentos com os seus embeddings vectoriais.
- **`ai_chat_sessions`** — Sessões de conversa com a IA.
- **`ai_chat_messages`** — Mensagens individuais (user/assistant) dentro de cada sessão.

**Função crítica:** `match_chunks()` — Função PL/pgSQL que realiza busca semântica por similaridade vectorial, respeitando as permissões de acesso (RBAC + departamentos) com lógica AND/OR configurável por documento.

### 5.4. Permissões Globais Seed

```
doc:view, doc:upload, doc:delete, doc:manage_perms,
wiki:view, wiki:generate,
integrations:manage, users:manage
```

---

## 6. Funcionalidades Implementadas (Estado Actual)

### 6.1. Módulos da Aplicação

| Módulo | Ficheiro Principal | Descrição |
|--------|-------------------|-----------|
| **Login/Registo** | `Login.tsx` | Autenticação com registo de empresa (tenant) |
| **Dashboard** | `DashboardView.tsx` | Visão geral com estatísticas |
| **Documentos** | `DocumentsView.tsx` | Listagem e gestão de documentos |
| **Upload** | `UploadView.tsx` | Upload de ficheiros com controlo de acesso multi-departamental |
| **Chat IA** | `IntelligentSearchView.tsx` | Interface de chat RAG com busca semântica |
| **Wiki** | `WikiView.tsx` | Base de conhecimento gerada por IA (Só a interface ainda) |
| **Integrações** | `IntegrationsView.tsx` | Gestão de integrações externas (Só a interface ainda) |
| **Perfil** | `ProfileView.tsx` | Perfil do utilizador |
| **Administração** | `AdminView.tsx` | Painel RBAC (gestão de utilizadores) |
| **Departamentos** | `DepartmentsPanel.tsx` | CRUD de departamentos |
| **Cargos** | `RolesPanel.tsx` | CRUD de cargos com permissões granulares |

### 6.2. API Routes (Backend)

| Endpoint | Funcionalidade |
|----------|---------------|
| `/api/auth/*` | Autenticação (login, registo, sessão) |
| `/api/chat/*` | Gestão de sessões e mensagens de chat IA |
| `/api/dashboard/*` | Dados para o dashboard |
| `/api/documents/*` | CRUD de documentos |
| `/api/departments/*` | CRUD de departamentos |
| `/api/roles/*` | CRUD de cargos |
| `/api/permissions/*` | Gestão de permissões |
| `/api/users/*` | Gestão de utilizadores |
| `/api/upload/*` | Proxy de upload para n8n |
| `/api/wiki/*` | Geração de conteúdos Wiki |
| `/api/debug-rag/*` | Debugging do pipeline RAG |

### 6.3. Pipeline RAG (n8n)

O pipeline `minimal_ai_ingestion_pipeline.json` implementa dois fluxos:

**Fluxo de Upload (`/upload`):**
1. Recebe ficheiro via webhook
2. Extrai texto do documento
3. Divide em chunks
4. Gera embeddings com Cohere (modelo embed-multilingual-v3.0, 1024 dimensões)
5. Armazena chunks + embeddings na tabela `chunks` via Supabase

**Fluxo de Query (`/query`):**
1. Recebe pergunta via webhook
2. Gera embedding da pergunta com Cohere
3. Executa `match_chunks()` via RPC do Supabase (com filtros RBAC)
4. Envia contexto + pergunta ao LLM (Cohere Chat)
5. Retorna resposta com referências aos documentos fonte

---

## 7. Infraestrutura do Repositório

```
TFC/
├── .agents/                    # Configurações de agentes AI (skills)
├── .gemini/                    # Configurações Gemini
├── .git/                       # Controlo de versão
├── design/
│   └── specs.md                # Especificações de design
├── dist/                       # Output compilado (PDF da monografia, builds)
├── docs/
│   ├── chapters/               # Capítulos da monografia em Markdown
│   │   └── 01-test.md          # Capítulo de teste (placeholder)
│   ├── context.md              # ← ESTE FICHEIRO
│   ├── dot docx/               # Ficheiros .docx (gitignored)
│   │   ├── Trabalho oficial.docx
│   │   └── references/         # PDFs de referência (modelo IGF, TFCs exemplo)
│   ├── references.bib          # Bibliografia em BibTeX
│   ├── structure.txt           # Ordem dos capítulos para compilação
│   └── styles/
│       └── apa.csl             # Estilo de citação APA
├── n8n/
│   └── minimal_ai_ingestion_pipeline.json  # Workflow n8n exportado
├── scripts/
│   └── build-doc.sh            # Script Pandoc para compilar monografia (MD → PDF)
├── src/                        # Código-fonte da aplicação Next.js
│   ├── app/                    # App Router (pages + API routes)
│   ├── assets/                 # Assets estáticos
│   ├── components/             # Componentes React
│   │   ├── Login.tsx
│   │   └── views/              # Módulos/vistas da aplicação
│   │       ├── admin/          # Painéis administrativos
│   │       ├── AdminView.tsx
│   │       ├── DashboardView.tsx
│   │       ├── DocumentsView.tsx
│   │       ├── IntelligentSearchView.tsx
│   │       ├── IntegrationsView.tsx
│   │       ├── ProfileView.tsx
│   │       ├── UploadView.tsx
│   │       └── WikiView.tsx
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utilitários e contextos
│       ├── auth-context.tsx    # Contexto de autenticação
│       ├── supabase.ts         # Cliente Supabase
│       ├── gemini.ts           # Integração Gemini
│       ├── jwt.ts              # Utilidades JWT
│       └── hash.ts             # Funções de hash
├── supabase/
│   └── schema.sql              # Schema completo da base de dados
├── package.json                # Dependências raiz (Pandoc doc tools)
├── README.md                   # Guia de configuração e setup
└── .gitignore
```

---

## 8. Pipeline de Compilação da Monografia

O projecto inclui um pipeline robusto para compilar a monografia final directamente do código-fonte Markdown para PDF:

- **Ferramenta:** Pandoc com motor `xelatex`.
- **Filtros e Pacotes:** Utiliza o `mermaid-filter` para renderizar automaticamente diagramas UML/ER, e o pacote LaTeX `listings` para quebras de página fluídas em blocos de código longo.
- **Script:** `scripts/build-doc.sh`
- **Processo:** Lê `docs/structure.txt` → concatena os 5 capítulos → aplica a bibliografia (`docs/references.bib`) → formata no estilo APA (`docs/styles/apa.csl`) → aplica metadados e configuração de página (`docs/metadata.yaml`) → gera o documento formatado em `dist/output.pdf`.
- **Estado actual:** Totalmente operacional. O PDF compila com sucesso, cumprindo os rigorosos requisitos visuais e tipográficos académicos.

---

## 9. Referências Bibliográficas Existentes

### No documento teórico:
1. Choo, C. W. (2003). *The Knowing Organization*. Oxford University Press.
2. Russell, S., & Norvig, P. (2021). *Artificial Intelligence: A Modern Approach*. Pearson.
3. Lopes, R. (2020). *Estratégias de Transformação Digital em Países da SADC: O Caso de Angola*. Revista Angolana de Computação.

### No ficheiro BibTeX (`references.bib`):
1. Haverbeke, M. (2024). *Eloquent Javascript*. 4th Edition.

### TFCs de Referência (na pasta `references/`):
- `TFC_ANTONIOJANUARIO.pdf`
- `TFC_CAROLINA MENDES- versão final.pdf`

---

## 10. Metodologia de Investigação

**Natureza:** Pesquisa aplicada
**Objectivos:** Exploratória e descritiva
**Abordagem:** Predominantemente qualitativa com apoio quantitativo

**Procedimentos:**
- Pesquisa bibliográfica
- Desenvolvimento tecnológico (prototipagem)

**Técnicas de recolha:**
- Revisão bibliográfica
- Modelagem de requisitos
- Testes funcionais e de desempenho
- Simulação com dados estruturados

---

## 11. Decisões Técnicas Relevantes

- **Supabase vs Firebase:** Escolha do Supabase por ser PostgreSQL nativo, suportar pgvector, e ser open-source.
- **n8n vs código custom:** Uso de n8n para orquestração visual do pipeline RAG, facilitando iteração rápida.
- **Cohere vs OpenAI:** Uso do Cohere para embeddings multilíngues (suporte a português) e custo mais acessível.
- **Next.js App Router:** Escolha do App Router para API routes server-side e SSR.
- **RBAC granular:** Sistema de permissões com lógica AND/OR entre departamentos e cargos para máxima flexibilidade.
- **Multi-Tenant:** Isolamento de dados por `company_id` em todas as tabelas.
- **Pandoc para monografia:** Permite escrever em Markdown com citações BibTeX e gerar PDF formatado.

---

## 12. Próximos Passos

O desenvolvimento do protótipo e a redação da monografia encontram-se **concluídos**. O sistema foi totalmente implementado, testado e documentado com rigor académico. O código-fonte está versionado e o protótipo encontra-se funcional e acessível num ambiente de produção (Vercel).

### Passos Finais
- Leitura final de revisão para detetar pequenos erros tipográficos no PDF final (`dist/output.pdf`).
- Impressão e submissão formal do Trabalho Final de Curso (TFC) ao ISAF.
- Preparação da apresentação de Defesa da Tese (criação de diapositivos resumindo o problema de pesquisa, a arquitectura metodológica/técnica construída e as conclusões).
