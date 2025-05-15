import { prisma } from '@/lib/prisma';
import { supabase, uploadImage, deleteImage } from '@/lib/supabase';

/**
 * Serviço para gerenciar usuários
 */
export const userService = {
  /**
   * Busca um usuário pelo ID do Clerk
   */
  async getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  },

  /**
   * Busca um usuário pelo ID do banco de dados
   */
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            builds: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
  },

  /**
   * Busca um usuário pelo ID com estatísticas detalhadas
   */
  async getUserWithStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // Contagem de builds
    const buildCount = await prisma.build.count({
      where: { userId: user.id },
    });

    // Contagem de builds publicadas
    const publishedBuildCount = await prisma.build.count({
      where: {
        userId: user.id,
        isPublished: true,
      },
    });

    // Total de curtidas recebidas
    const likesReceived = await prisma.like.count({
      where: {
        build: {
          userId: user.id,
        },
      },
    });

    // Total de comentários recebidos
    const commentsReceived = await prisma.comment.count({
      where: {
        build: {
          userId: user.id,
        },
      },
    });

    // Build mais popular
    const mostPopularBuild = await prisma.build.findFirst({
      where: {
        userId: user.id,
        isPublished: true,
      },
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      ...user,
      stats: {
        buildCount,
        publishedBuildCount,
        likesReceived,
        commentsReceived,
        mostPopularBuild: mostPopularBuild ? {
          id: mostPopularBuild.id,
          title: mostPopularBuild.title,
          likeCount: mostPopularBuild._count.likes,
        } : null,
      },
    };
  },

  /**
   * Busca um usuário pelo nome de usuário
   */
  async getUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            builds: true,
            comments: true,
            likes: true,
          },
        },
      },
    });
  },

  /**
   * Cria um novo usuário
   */
  async createUser(data: {
    clerkId: string;
    email: string;
    username: string;
    name?: string;
    imageUrl?: string;
  }) {
    return prisma.user.create({
      data,
    });
  },

  /**
   * Atualiza um usuário existente
   */
  async updateUser(
    clerkId: string,
    data: {
      username?: string;
      name?: string;
      imageUrl?: string;
    }
  ) {
    return prisma.user.update({
      where: { clerkId },
      data,
    });
  },

  /**
   * Atualiza o perfil de um usuário
   */
  async updateUserProfile(
    userId: string,
    data: {
      bio?: string;
      favoriteClass?: string;
      favoriteWeapon?: string;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  /**
   * Exclui um usuário
   */
  async deleteUser(clerkId: string) {
    return prisma.user.delete({
      where: { clerkId },
    });
  },

  /**
   * Faz upload de uma imagem de perfil para o Supabase Storage
   */
  async uploadProfileImage(file: File, userId: string) {
    const path = `profiles/${userId}`;
    return uploadImage(file, 'avatars', path);
  },

  /**
   * Busca as builds de um usuário
   */
  async getUserBuilds(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const builds = await prisma.build.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
    });

    const totalBuilds = await prisma.build.count({
      where: {
        userId,
      },
    });

    return {
      builds,
      totalPages: Math.ceil(totalBuilds / limit),
      currentPage: page,
      totalBuilds,
    };
  },
};
