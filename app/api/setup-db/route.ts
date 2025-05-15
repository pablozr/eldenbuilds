import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST - Configurar o banco de dados
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é administrador
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Criar a tabela UserProfile usando SQL bruto
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."UserProfile" (
        "id" TEXT NOT NULL,
        "bio" TEXT,
        "bannerUrl" TEXT,
        "favoriteClass" TEXT,
        "favoriteWeapon" TEXT,
        "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "UserProfile_userId_key" UNIQUE ("userId"),
        CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      );
    `;

    // Criar índice para userId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "UserProfile_userId_idx" ON "public"."UserProfile"("userId");
    `;

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
    });
  } catch (error) {
    console.error("Error setting up database:", error);
    return NextResponse.json(
      { error: "Failed to setup database" },
      { status: 500 }
    );
  }
}
