import { prisma } from '@/lib/prisma';

/**
 * Serviço para gerenciar likes
 */
export const likeService = {
  /**
   * Verifica se um usuário deu like em uma build
   */
  async hasLiked(buildId: string, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verifica se o like existe
    const like = await prisma.like.findFirst({
      where: {
        buildId,
        userId: user.id,
      },
    });

    return !!like;
  },

  /**
   * Alterna o like de um usuário em uma build (adiciona ou remove)
   */
  async toggleLike(buildId: string, userId: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verifica se a build existe
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });

    if (!build) {
      throw new Error('Build not found');
    }

    // Verifica se o like já existe
    const existingLike = await prisma.like.findFirst({
      where: {
        buildId,
        userId: user.id,
      },
    });

    // Se o like já existe, remove-o
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    }

    // Se o like não existe, adiciona-o
    await prisma.like.create({
      data: {
        buildId,
        userId: user.id,
      },
    });

    return { liked: true };
  },

  /**
   * Conta o número de likes de uma build
   */
  async countLikes(buildId: string) {
    return prisma.like.count({
      where: { buildId },
    });
  },
};
