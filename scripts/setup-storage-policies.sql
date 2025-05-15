-- Script para configurar políticas RLS para o bucket de armazenamento do Supabase
-- Este script deve ser executado no SQL Editor do Supabase

-- Verificar se o bucket existe e criar se necessário
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'user-uploads'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    -- Criar o bucket com acesso público
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'user-uploads',
      'user-uploads',
      true, -- public access
      5242880, -- 5MB limit
      '{image/png,image/jpeg,image/jpg,image/gif,image/webp}' -- allowed mime types
    );
  ELSE
    -- Atualizar o bucket existente para garantir que seja público
    UPDATE storage.buckets
    SET
      public = true,
      file_size_limit = 5242880,
      allowed_mime_types = '{image/png,image/jpeg,image/jpg,image/gif,image/webp}'
    WHERE name = 'user-uploads';
  END IF;
END $$;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Public Read Policy" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated User Write Policy" ON storage.objects;

-- Criar política para permitir leitura pública
CREATE POLICY "Public Read Policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-uploads');

-- Criar política para permitir que usuários autenticados façam upload em suas próprias pastas
-- Esta política usa o ID do usuário do JWT como parte do caminho
CREATE POLICY "Authenticated User Write Policy"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads'
  AND auth.uid()::text IS NOT NULL
  AND (
    -- Verificar se o primeiro segmento do caminho corresponde ao ID do usuário do JWT (sub)
    (storage.foldername(name))[1] = auth.uid()::text
    -- OU verificar se o primeiro segmento corresponde ao ID do usuário do JWT (user_id)
    OR (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')::text
  )
);

-- Criar política para permitir que usuários autenticados atualizem seus próprios arquivos
CREATE POLICY "Authenticated User Update Policy"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text IS NOT NULL
  AND (
    -- Verificar se o primeiro segmento do caminho corresponde ao ID do usuário do JWT (sub)
    (storage.foldername(name))[1] = auth.uid()::text
    -- OU verificar se o primeiro segmento corresponde ao ID do usuário do JWT (user_id)
    OR (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')::text
  )
);

-- Criar política para permitir que usuários autenticados excluam seus próprios arquivos
CREATE POLICY "Authenticated User Delete Policy"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text IS NOT NULL
  AND (
    -- Verificar se o primeiro segmento do caminho corresponde ao ID do usuário do JWT (sub)
    (storage.foldername(name))[1] = auth.uid()::text
    -- OU verificar se o primeiro segmento corresponde ao ID do usuário do JWT (user_id)
    OR (storage.foldername(name))[1] = (auth.jwt() ->> 'user_id')::text
  )
);

-- Verificar as políticas criadas
SELECT
  p.policyname,
  p.tablename,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual,
  p.with_check
FROM
  pg_policies p
WHERE
  p.tablename = 'objects'
  AND p.schemaname = 'storage';
