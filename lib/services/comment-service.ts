import { prisma } from '@/lib/prisma';
import { CommentFormValues } from '@/lib/validations/build';
import { sanitizeInput } from '@/lib/utils/sanitize';

/**
 * Serviço para gerenciar comentários
 */
export const commentService = {
  /**
   * Busca comentários de uma build específica
   */
  async getCommentsByBuildId(buildId: string) {
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

    // Sanitize comment content to prevent XSS when displaying
    return comments.map(comment => ({
      ...comment,
      content: sanitizeInput(comment.content)
    }));
  },

  /**
   * Cria um novo comentário
   */
  async createComment(data: CommentFormValues, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verifica se a build existe
    const build = await prisma.build.findUnique({
      where: { id: data.buildId },
    });

    if (!build) {
      throw new Error('Build not found');
    }

    // Sanitize the comment content to prevent XSS
    const sanitizedContent = sanitizeInput(data.content);

    // Cria o comentário com conteúdo sanitizado
    return prisma.comment.create({
      data: {
        content: sanitizedContent,
        buildId: data.buildId,
        userId: user.id,
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
    });
  },

  /**
   * Atualiza um comentário existente
   */
  async updateComment(id: string, content: string, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Busca o comentário
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Verifica se o usuário é o dono do comentário
    if (comment.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    // Sanitize the comment content to prevent XSS
    const sanitizedContent = sanitizeInput(content);

    // Atualiza o comentário com conteúdo sanitizado
    return prisma.comment.update({
      where: { id },
      data: {
        content: sanitizedContent,
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
    });
  },

  /**
   * Exclui um comentário
   */
  async deleteComment(id: string, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Busca o comentário
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Verifica se o usuário é o dono do comentário
    if (comment.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    // Exclui o comentário
    return prisma.comment.delete({
      where: { id },
    });
  },
};
