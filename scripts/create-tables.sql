-- Criar tabela User
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "clerkId" TEXT UNIQUE NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela Build
CREATE TABLE IF NOT EXISTS "Build" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "level" INTEGER NOT NULL,
  "buildType" TEXT,
  "vigor" INTEGER NOT NULL,
  "mind" INTEGER NOT NULL,
  "endurance" INTEGER NOT NULL,
  "strength" INTEGER NOT NULL,
  "dexterity" INTEGER NOT NULL,
  "intelligence" INTEGER NOT NULL,
  "faith" INTEGER NOT NULL,
  "arcane" INTEGER NOT NULL,
  "weapons" TEXT[] NOT NULL,
  "armor" TEXT[] NOT NULL,
  "talismans" TEXT[] NOT NULL,
  "spells" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "isPublished" BOOLEAN DEFAULT TRUE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);

-- Criar índices para Build
CREATE INDEX IF NOT EXISTS "Build_userId_idx" ON "Build"("userId");
CREATE INDEX IF NOT EXISTS "Build_buildType_idx" ON "Build"("buildType");

-- Criar tabela Comment
CREATE TABLE IF NOT EXISTS "Comment" (
  "id" TEXT PRIMARY KEY,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "buildId" TEXT NOT NULL REFERENCES "Build"("id") ON DELETE CASCADE
);

-- Criar índices para Comment
CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX IF NOT EXISTS "Comment_buildId_idx" ON "Comment"("buildId");

-- Criar tabela Like
CREATE TABLE IF NOT EXISTS "Like" (
  "id" TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "buildId" TEXT NOT NULL REFERENCES "Build"("id") ON DELETE CASCADE,
  UNIQUE("userId", "buildId")
);

-- Criar índices para Like
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "Like"("userId");
CREATE INDEX IF NOT EXISTS "Like_buildId_idx" ON "Like"("buildId");

-- Criar função para atualizar o campo updatedAt
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar o campo updatedAt
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_build_updated_at
BEFORE UPDATE ON "Build"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comment_updated_at
BEFORE UPDATE ON "Comment"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
