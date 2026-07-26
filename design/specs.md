# Document Management System — UI & Design Specifications

Documento de especificação visual e tokens de design. Este ficheiro serve como a **Fonte de Verdade Visuais (UI Spec)** para a uniformização de todos os módulos da aplicação (`src/components/` e `src/components/views/*`).

---

## 1. Sistema de Tokens & Variáveis CSS (`globals.css`)

A aplicação utiliza **Tailwind CSS v4** com um tema neutro, denso e corporativo (Enterprise SaaS). 

### 1.1 Paleta de Cores Nativa

```css
:root {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-size: 14px; /* Base 14px para densidade empresarial */

  /* Cores Base */
  --background: #ffffff;
  --foreground: oklch(0.145 0 0); /* #111827 / slate-900 */
  
  /* Cartões & Superfícies */
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  
  /* Elementos Primários (Obsidian Dark Navy) */
  --primary: #030213;
  --primary-foreground: #ffffff;
  
  /* Elementos Secundários & Muted */
  --secondary: oklch(0.95 0.0058 264.53); /* #f3f4f6 */
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182; /* slate-500 */
  
  /* Interações & Accents */
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  
  /* Bordas & Inputs */
  --border: rgba(0, 0, 0, 0.1); /* border-slate-200 */
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --ring: oklch(0.708 0 0);
  
  /* Arredondamento */
  --radius: 0.625rem; /* 10px / rounded-xl */
  
  /* Sidebar */
  --sidebar: #fafafa; /* oklch(0.985 0 0) */
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f3f4f6;
  --sidebar-border: #e2e8f0;
}
```

---

## 2. Layout Mestre (`Master Shell / Main Layout`)

### 2.1 Sidebar Lateral (`<aside>`)
*   **Largura:** `w-64` (256px), fixa no desktop, oculta no mobile (com gaveta drawer `fixed`).
*   **Fundo & Borda:** `bg-[#fafafa]` com `border-r border-slate-200`.
*   **Logótipo / Header da Sidebar:**
    *   Contentor `p-5 flex items-center gap-3 border-b border-slate-200/80`.
    *   Ícone do App: Badge de cor primária `w-7 h-7 bg-[#030213] text-white rounded-md flex items-center justify-center font-bold text-xs`.
    *   Título: `text-xs font-bold uppercase tracking-wider text-slate-900`.
    *   Subtítulo: `text-[10px] text-slate-400 font-medium tracking-wider uppercase`.
*   **Itens de Navegação (`SidebarLink`):**
    *   Normal: `w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer`.
    *   Activo: `bg-slate-900 text-white font-semibold shadow-xs` (ou `bg-blue-50 text-blue-700` com destaque de acento).
    *   Ícone do Item: `h-4 w-4` centralizado.
    *   Badges: `text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider` (`bg-blue-100 text-blue-700` para IA/Auto).

### 2.2 Header Superior (`<header>`)
*   **Altura:** `h-14` (56px) sticky no topo com `z-30`.
*   **Fundo & Borda:** `bg-white border-b border-slate-200 px-6 flex items-center justify-between`.
*   **Badges de Contexto:** `bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-xs font-medium text-slate-600 flex items-center gap-2`.
*   **Perfil do Utilizador:** Avatar com iniciais em `bg-[#030213] text-white h-7 w-7 rounded-md font-bold text-xs flex items-center justify-center`.

---

## 3. Padrões de Componentes Reutilizáveis

### 3.1 Cartões & Métricas (`<Card>`, `<StatCard>`)
*   **Estrutura:** `bg-white border border-slate-200 rounded-xl shadow-2xs transition-all hover:border-slate-300`.
*   **Cabeçalho do Cartão (`CardHeader`):** `p-5 pb-3 flex items-center justify-between border-b border-slate-100`.
    *   Título: `text-sm font-semibold text-slate-900 flex items-center gap-2`.
    *   Subtítulo / Descrição: `text-xs text-slate-500 font-normal`.
*   **Corpo do Cartão (`CardContent`):** `p-5`.
*   **Cartões de Estatística (KPIs):**
    *   Layout: Grelha de 3 ou 4 colunas (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`).
    *   Valor numérico: `text-2xl font-bold text-slate-900 tracking-tight`.
    *   Etiqueta: `text-xs font-medium text-slate-500 uppercase tracking-wider`.
    *   Indicador de Tendência/Ícone: Cantão superior direito com ícone suave `h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600`.

### 3.2 Tabelas de Dados (`<Table>`)
*   **Contentor da Tabela:** `w-full overflow-x-auto rounded-xl border border-slate-200 bg-white`.
*   **Cabeçalho (`<thead>`):**
    *   Linha: `bg-slate-50/80 border-b border-slate-200`.
    *   Células (`<th>`): `px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500`.
*   **Corpo (`<tbody>`):**
    *   Linhas (`<tr>`): `border-b border-slate-100 hover:bg-slate-50/60 transition-colors h-12 text-xs text-slate-700`.
    *   Célula Principal / Nome: `font-semibold text-slate-900 flex items-center gap-2.5`.
*   **Botões de Acção na Tabela:**
    *   Contentor flex com `gap-1.5`.
    *   Botão de acção individual: `h-7 w-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center text-slate-500 transition-all cursor-pointer`.

### 3.3 Botões (`<Button>`)
*   **Base:** `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all disabled:opacity-50 cursor-pointer`.
*   **Primário (`variant="default"`):** `bg-[#030213] text-white hover:bg-[#030213]/90 shadow-2xs h-9 px-4 py-2`.
*   **Secundário (`variant="secondary"`):** `bg-slate-100 text-slate-900 hover:bg-slate-200 h-9 px-4 py-2`.
*   **Contorno (`variant="outline"`):** `border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 h-9 px-4 py-2`.
*   **Destrutivo (`variant="destructive"`):** `bg-red-600 text-white hover:bg-red-700 h-9 px-4 py-2`.
*   **Fantasma (`variant="ghost"`):** `hover:bg-slate-100 text-slate-600 hover:text-slate-900 h-9 px-3`.

### 3.4 Formulários e Inputs
*   **Input de Texto / Select:** `w-full h-9 px-3 bg-[#f3f3f5] border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all`.
*   **Labels:** `block text-xs font-semibold text-slate-700 mb-1.5`.
*   **Mensagens de Ajuda / Erro:** `text-[11px] text-slate-500 mt-1` / `text-[11px] text-red-600 mt-1 font-medium`.

### 3.5 Badges & Status Pills
*   **Estilo Pill Comum:** `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider w-fit border`.
*   **Sucesso / Activo:** `bg-emerald-50 text-emerald-700 border-emerald-200`.
*   **Pendente / Rascunho:** `bg-amber-50 text-amber-700 border-amber-200`.
*   **Erro / Inactivo:** `bg-red-50 text-red-700 border-red-200`.
*   **IA / Automático:** `bg-blue-50 text-blue-700 border-blue-200`.
*   **Neutro / Padrão:** `bg-slate-100 text-slate-600 border-slate-200`.

---

## 4. Diretrizes de Layout por Página/Vista

### 4.1 Dashboard (`DashboardView.tsx`)
1.  **Cabeçalho da Página:** Título `text-xl font-bold text-slate-900` com descrição concisa em `text-xs text-slate-500`.
2.  **Linha Superior (KPI Cards):** Grelha de 4 cartões com totais de documentos, pesquisas IA, departamentos e utilizadores activos.
3.  **Área Principal (2 Colunas):**
    *   **Coluna Esquerda (2/3):** Atividade recente / documentos carregados recentemente numa tabela limpa ou lista compacta com badges.
    *   **Coluna Direita (1/3):** Ações rápidas (Upload, Nova Pesquisa IA, Gerar Wiki) e Estado do Sistema RAG.

### 4.2 Pesquisa Inteligente RAG (`IntelligentSearchView.tsx`)
1.  **Layout de Conversa:**
    *   Painel Lateral de Sessões (se visível): `w-64 border-r border-slate-200 bg-slate-50/50 p-4`.
    *   Área Central do Chat: `flex-1 flex flex-col h-[calc(100vh-7rem)] bg-white rounded-xl border border-slate-200 overflow-hidden`.
2.  **Balões de Mensagem:**
    *   **Utilizador:** `self-end bg-[#030213] text-white rounded-2xl rounded-tr-xs px-4 py-3 text-xs max-w-[80%] shadow-2xs`.
    *   **Assistente IA:** `self-start bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl rounded-tl-xs p-4 text-xs max-w-[85%] space-y-3`.
3.  **Secção de Fontes RAG:**
    *   Card retrátil / lista na base da resposta da IA: `mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-600 flex flex-wrap gap-2`.
    *   Badge de Ficheiro Fonte: `bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-1.5 text-slate-700 font-medium hover:border-slate-300`.

### 4.3 Gestão de Documentos (`DocumentsView.tsx`)
1.  **Barra de Ferramentas / Filtros:**
    *   Input de pesquisa rápida à esquerda (`w-72 relative`), selector de departamento e botão de carregamento à direita.
2.  **Tabela da Base Documental:**
    *   Colunas: Nome do Ficheiro (com ícone por extensão PDF/DOCX/TXT), Tamanho, Departamento, Permissões RBAC, Estado de Ingestão n8n, Ações.
3.  **Modal de Permissões de Documento:**
    *   Design limpo em `max-w-md bg-white p-6 rounded-xl border border-slate-200 shadow-xl`.

### 4.4 Carregar Arquivos (`UploadView.tsx`)
1.  **Dropzone de Upload:**
    *   `border-2 border-dashed border-slate-300 hover:border-slate-900 bg-slate-50/50 hover:bg-slate-50 p-8 rounded-xl text-center cursor-pointer transition-all`.
    *   Ícone central: `h-10 w-10 text-slate-400 mx-auto mb-3`.
2.  **Configuração de Acesso (RBAC + Departamentos):**
    *   Formulário estruturado em cartões claros com selecção multi-select ou checkboxes estilizados.

### 4.5 Painel de Administração / Departamentos / Cargos (`AdminView.tsx`, `DepartmentsPanel.tsx`, `RolesPanel.tsx`)
1.  **Navegação por Abas (Tabs):**
    *   `flex items-center gap-2 border-b border-slate-200 mb-6 pb-2`.
    *   Aba Activa: `border-b-2 border-slate-900 text-slate-900 font-semibold text-xs pb-2 px-1`.
    *   Aba Inactiva: `text-slate-500 hover:text-slate-800 text-xs pb-2 px-1 cursor-pointer`.
2.  **Tabelas de Utilizadores e Cargos:**
    *   Seguir estritamente a especificação de tabelas (Seção 3.2).

### 4.6 Wiki Corporativa & Integrações (`WikiView.tsx`, `IntegrationsView.tsx`)
1.  **Cartões de Sincronização / Conetores:**
    *   Grelha de cartões `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`.
    *   Header do Conetor: Ícone do serviço (Supabase, n8n, Cohere, Gmail, Google Drive), título, estado (Conectado / Desconectado).
    *   Footer do Cartão: Botão de configuração secundário ou modal de credenciais.

---

## 5. Regras de Aplicação & Consistência

1.  **Não usar cores primárias aleatórias** (ex: azuis vibrantes e sem padrão). Usar primariamente o tom escuro obsidian `#030213` para botões/destaques e neutros de `slate-50` a `slate-900` para superfícies e textos.
2.  **Espaçamento Uniforme:** Usar múltiplos de 4px (Tailwind `p-1`, `p-2`, `p-3`, `p-4`, `p-6`).
3.  **Tamanhos de Ícone:** Padrão inline `h-4 w-4`, cabeçalhos `h-5 w-5`, destaques/hero `h-8 w-8`.
4.  **Bordas Suaves:** Todas as superfícies interativas e contentores devem utilizar a borda padrão `border border-slate-200`.
5.  **Responsividade:** Garantir que sidebars se transformam em drawer no mobile (`lg:hidden`) e as grelhas adaptam-se de `grid-cols-1` para `md:grid-cols-2`/`lg:grid-cols-3` ou `lg:grid-cols-4`.