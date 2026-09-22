-- ============================================================================
-- TABELA DE USUÁRIOS E APROVAÇÃO DE LOGINS - SISTEMA PIT/RIT (IAD / UFJF)
-- ============================================================================
-- Execute este script no SQL Editor do seu painel Supabase (https://supabase.com)
-- Projeto: qidnxbbaryjcexdqiitu
-- ============================================================================

-- 1. Criação da tabela de usuários do sistema PIT/RIT
CREATE TABLE IF NOT EXISTS public.pit_rit_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    siape TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    regime TEXT DEFAULT '40_DE',
    unidade TEXT DEFAULT 'Instituto de Artes e Design (IAD)',
    cargo TEXT DEFAULT 'Docente',
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado'
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Criação de índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_pit_rit_usuarios_email ON public.pit_rit_usuarios (email);
CREATE INDEX IF NOT EXISTS idx_pit_rit_usuarios_siape ON public.pit_rit_usuarios (siape);
CREATE INDEX IF NOT EXISTS idx_pit_rit_usuarios_status ON public.pit_rit_usuarios (status);

-- 3. Habilita Row Level Security (RLS)
ALTER TABLE public.pit_rit_usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Criação de políticas RLS para permitir leitura, cadastro e atualização com a chave pública/anon
DROP POLICY IF EXISTS "Permitir leitura publica de usuarios" ON public.pit_rit_usuarios;
CREATE POLICY "Permitir leitura publica de usuarios"
ON public.pit_rit_usuarios
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Permitir cadastro de novos usuarios" ON public.pit_rit_usuarios;
CREATE POLICY "Permitir cadastro de novos usuarios"
ON public.pit_rit_usuarios
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualizacao de usuarios" ON public.pit_rit_usuarios;
CREATE POLICY "Permitir atualizacao de usuarios"
ON public.pit_rit_usuarios
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusao de usuarios" ON public.pit_rit_usuarios;
CREATE POLICY "Permitir exclusao de usuarios"
ON public.pit_rit_usuarios
FOR DELETE
USING (true);

-- 5. Usuário Administrador Padrão da Secretaria do IAD
-- Email: admin@iad.ufjf.br
-- Senha inicial: admin123 (hash SHA-256: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9)
INSERT INTO public.pit_rit_usuarios (nome, email, siape, senha_hash, regime, status, is_admin)
VALUES (
    'Administrador - Secretaria IAD',
    'admin@iad.ufjf.br',
    'ADMIN01',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    '40_DE',
    'aprovado',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Confirmação
SELECT id, nome, email, siape, status, is_admin, created_at FROM public.pit_rit_usuarios;
