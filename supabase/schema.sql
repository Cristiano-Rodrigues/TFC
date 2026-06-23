-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
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
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role_id UUID REFERENCES public.roles(id),
    department_id UUID REFERENCES public.departments(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
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

-- 4. Seed Seed-Data (roles, permissions, departments)
INSERT INTO public.roles (id, name, description) VALUES
  ('c01a2079-12e5-409c-8675-90bf04eb10a1', 'admin', 'Acesso total ao sistema'),
  ('5f65ff3f-cfb8-4b5a-9314-eeb2cc4b19b2', 'manager', 'Gestão de documentos e wiki'),
  ('9a8ed43a-141c-4996-8d79-5777ae3872d4', 'user', 'Acesso de leitura e pesquisa')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.permissions (id, code, description) VALUES
  ('eeb00226-1d62-440e-a59d-8a19926cf20e', 'document.upload', 'Pode fazer upload de documentos'),
  ('32f0bc2a-8776-4c36-91ab-a840cf1620ab', 'document.view', 'Pode visualizar documentos'),
  ('5340f298-1bc8-49a0-9c8c-58a1c26393e5', 'document.delete', 'Pode eliminar documentos'),
  ('4e124a9d-bad2-4050-9654-d6ebf9d81097', 'document.manage', 'Pode gerir documentos'),
  ('75f85d68-8809-4a8a-a975-057fb61fc00b', 'user.manage', 'Pode gerir utilizadores'),
  ('53c4a64d-db14-4fcb-9fc4-125a459662ee', 'integration.manage', 'Pode gerir integrações'),
  ('9dc06505-9dcd-471c-88ff-00b866b859ab', 'wiki.manage', 'Pode gerir wiki')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.departments (id, name, description) VALUES
  ('fae45b14-e2a1-4764-855d-76cbbff37cba', 'RH', 'Recursos Humanos'),
  ('54ce356d-7f18-4992-89bb-473b524197ae', 'Financeiro', 'Departamento financeiro'),
  ('5d2b1bbb-4709-41ce-80ab-1b8c6f10b2df', 'Comercial', 'Área comercial'),
  ('a4e2256e-f89d-43b8-9216-2ca95014125f', 'Jurídico', 'Assuntos legais'),
  ('eca96846-b376-48b5-9386-8342c3515bcd', 'TI', 'Tecnologia da informação')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;
