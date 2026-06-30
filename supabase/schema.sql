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
    department_id UUID REFERENCES public.departments(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    source_type TEXT,
    metadata JSONB
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

-- 3. Create Search Function (match_chunks)
CREATE OR REPLACE FUNCTION public.match_chunks(p_embedding vector, p_threshold double precision, p_count integer)
 RETURNS SETOF text
 LANGUAGE plpgsql
AS $function$
begin
  return query
  select
    chunks.content
  from chunks
  where 1 - (chunks.embedding <=> p_embedding) > p_threshold
  order by (1 - (chunks.embedding <=> p_embedding)) desc
  limit p_count;
end;
$function$;

-- 4. Semear as permissões globais do sistema
INSERT INTO public.permissions (code, description) VALUES 
('doc:view', 'Visualizar documentos'),
('doc:upload', 'Fazer upload de documentos'),
('doc:delete', 'Eliminar documentos'),
('doc:manage_perms', 'Gerir acessos a documentos'),
('wiki:view', 'Visualizar base de conhecimento (Wiki)'),
('wiki:generate', 'Gerar conteúdos na Wiki'),
('integrations:manage', 'Gerir integrações'),
('users:manage', 'Gerir utilizadores da empresa')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;
