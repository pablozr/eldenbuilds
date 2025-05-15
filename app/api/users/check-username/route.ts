import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação para verificação de nome de usuário
const usernameCheckSchema = z.object({
  username: z.string().min(3).max(30),
});

// GET - Verificar se um nome de usuário já está em uso
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Obter o nome de usuário da query string
    const username = req.nextUrl.searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Validar o nome de usuário
    try {
      usernameCheckSchema.parse({ username });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid username", details: error.errors },
          { status: 400 }
        );
      }
    }

    // Buscar o usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { username: true }
    });

    // Se o nome de usuário for o mesmo do usuário atual, está disponível
    if (currentUser && currentUser.username === username) {
      return NextResponse.json({ available: true });
    }

    // Verificar se o nome de usuário já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}
