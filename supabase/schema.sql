-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name, company_id)
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name, company_id)
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role_id UUID REFERENCES public.roles(id),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT,
    mime_type TEXT,
    n8n_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    source_type TEXT,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.document_departments (
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, department_id)
);

CREATE TABLE IF NOT EXISTS public.document_permissions (
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT,
    embedding vector(1024)
);

CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,
    is_error BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create Search Function (match_chunks)
DROP FUNCTION IF EXISTS public.match_chunks(vector, double precision, integer, uuid, uuid, uuid, uuid);

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
  -- Imposição rigorosa de isolamento por Empresa (Tenant) através do dono do documento ou das suas permissões
  and (
    exists(select 1 from users u where u.id = documents.uploaded_by and u.company_id = p_company_id)
    OR
    exists(select 1 from document_departments dd join departments d on d.id = dd.department_id where dd.document_id = documents.id and d.company_id = p_company_id)
    OR
    exists(select 1 from document_permissions dp join roles r on r.id = dp.role_id where dp.document_id = documents.id and r.company_id = p_company_id)
  )
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
    (
      CASE 
        WHEN COALESCE(documents.metadata->>'access_logic', 'AND') = 'OR' THEN
          (
            exists(select 1 from document_departments dd where dd.document_id = documents.id and dd.department_id = p_department_id) 
            OR 
            exists(select 1 from document_permissions dp where dp.document_id = documents.id and dp.role_id = p_role_id)
          )
        ELSE
          (
            (
              not exists(select 1 from document_departments dd where dd.document_id = documents.id)
              OR
              exists(select 1 from document_departments dd where dd.document_id = documents.id and dd.department_id = p_department_id)
            )
            AND 
            (
              not exists(select 1 from document_permissions dp where dp.document_id = documents.id)
              OR 
              exists(select 1 from document_permissions dp where dp.document_id = documents.id and dp.role_id = p_role_id)
            )
          )
      END
    )
  )
  order by (1 - (chunks.embedding <=> p_embedding)) desc
  limit p_count;
end;
$function$;

-- 4. Semear as permissões globais do sistema
INSERT INTO public.permissions (code, description) VALUES 
('documents:view', 'Visualizar documentos permitidos'),
('documents:create', 'Fazer upload de novos documentos'),
('documents:delete', 'Eliminar documentos'),
('documents:manage_permissions', 'Gerir acessos/RBAC de documentos'),
('documents:view_all', 'Acesso global a todos os documentos (bypass RBAC)'),
('wiki:view', 'Ler conteúdos da Wiki'),
('wiki:view_all', 'Acesso global a todos os conteúdos da Wiki (bypass RBAC)'),
('wiki:create', 'Criar novos conteúdos na Wiki'),
('wiki:edit', 'Editar conteúdos da Wiki'),
('wiki:delete', 'Eliminar conteúdos da Wiki'),
('integrations:manage', 'Gerir ligações e chaves API (n8n, etc)'),
('users:manage', 'Gerir utilizadores da empresa'),
('departments:manage', 'Gerir departamentos da empresa'),
('roles:manage', 'Gerir cargos e permissões da empresa')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;
