import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/utils/sanitize";

/**
 * Função para buscar comentários de uma build específica
 * Usada diretamente em server components
 */
export async function getComments(buildId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        buildId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Sanitiza o conteúdo dos comentários para prevenir XSS
    return comments.map(comment => ({
      ...comment,
      content: sanitizeInput(comment.content),
      createdAt: comment.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}
