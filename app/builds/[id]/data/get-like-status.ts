import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Função para verificar se um usuário curtiu uma build específica
 * Usada diretamente em server components
 */
export async function getLikeStatus(buildId: string) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { liked: false };
    }
    
    // Busca o usuário no banco de dados
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (!dbUser) {
      return { liked: false };
    }
    
    // Verifica se o usuário já curtiu a build
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_buildId: {
          userId: dbUser.id,
          buildId,
        },
      },
    });
    
    return { liked: !!existingLike };
  } catch (error) {
    console.error("Error checking like status:", error);
    return { liked: false };
  }
}

/**
 * Função para contar o número de likes de uma build
 * Usada diretamente em server components
 */
export async function getLikeCount(buildId: string) {
  try {
    const count = await prisma.like.count({
      where: { buildId },
    });
    
    return { count };
  } catch (error) {
    console.error("Error counting likes:", error);
    return { count: 0 };
  }
}
