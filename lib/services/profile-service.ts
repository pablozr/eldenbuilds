import { prisma } from '@/lib/prisma';

export const profileService = {
  /**
   * Obter o perfil de um usuário
   */
  async getUserProfile(userId: string) {
    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // Buscar o perfil do usuário no banco de dados usando Prisma em vez de SQL raw
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // Se o perfil não existir, retornar apenas os dados do usuário
    if (!profile) {
      return {
        ...user,
        bio: null,
        bannerUrl: null,
        favoriteClass: null,
        favoriteWeapon: null,
      };
    }

    // Retornar o usuário com os dados do perfil
    return {
      ...user,
      bio: profile.bio,
      bannerUrl: profile.bannerUrl,
      favoriteClass: profile.favoriteClass,
      favoriteWeapon: profile.favoriteWeapon,
    };
  },

  /**
   * Atualizar o perfil de um usuário
   */
  async updateUserProfile(userId: string, data: {
    username?: string;
    bio?: string;
    bannerUrl?: string;
    favoriteClass?: string;
    favoriteWeapon?: string;
    imageUrl?: string;
  }) {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    try {
      // Se tiver imageUrl ou username, atualizar na tabela User
      if (data.imageUrl !== undefined || data.username !== undefined) {
        const updateData: any = {
          updatedAt: new Date()
        };

        if (data.imageUrl !== undefined) {
          updateData.imageUrl = data.imageUrl;
        }

        if (data.username !== undefined) {
          updateData.username = data.username;
        }

        await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });

        if (data.imageUrl !== undefined) {
          console.log(`Updated User.imageUrl to ${data.imageUrl} for user ${userId}`);
        }

        if (data.username !== undefined) {
          console.log(`Updated User.username to ${data.username} for user ${userId}`);
        }
      }

      // Verificar se o perfil já existe
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId }
      });

      if (existingProfile) {
        // Atualizar o perfil existente
        const updatedProfile = await prisma.userProfile.update({
          where: { userId },
          data: {
            bio: data.bio !== undefined ? data.bio : existingProfile.bio,
            bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : existingProfile.bannerUrl,
            favoriteClass: data.favoriteClass !== undefined ? data.favoriteClass : existingProfile.favoriteClass,
            favoriteWeapon: data.favoriteWeapon !== undefined ? data.favoriteWeapon : existingProfile.favoriteWeapon,
            updatedAt: new Date()
          }
        });

        // Buscar o usuário atualizado (para obter o imageUrl mais recente)
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        return {
          ...updatedUser,
          bio: updatedProfile.bio,
          bannerUrl: updatedProfile.bannerUrl,
          favoriteClass: updatedProfile.favoriteClass,
          favoriteWeapon: updatedProfile.favoriteWeapon,
        };
      } else {
        // Criar um novo perfil usando Prisma em vez de SQL raw
        const newProfile = await prisma.userProfile.create({
          data: {
            bio: data.bio || null,
            bannerUrl: data.bannerUrl || null,
            favoriteClass: data.favoriteClass || null,
            favoriteWeapon: data.favoriteWeapon || null,
            userId: userId
          }
        });

        // Buscar o usuário atualizado
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        return {
          ...updatedUser,
          bio: newProfile.bio,
          bannerUrl: newProfile.bannerUrl,
          favoriteClass: newProfile.favoriteClass,
          favoriteWeapon: newProfile.favoriteWeapon,
        };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};
