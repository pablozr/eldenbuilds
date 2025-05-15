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

    // Buscar o perfil do usuário no banco de dados
    const profile = await prisma.$queryRaw<any[]>`
      SELECT * FROM "public"."UserProfile" WHERE "userId" = ${userId} LIMIT 1
    `;

    // Se o perfil não existir, retornar apenas os dados do usuário
    if (!profile || profile.length === 0) {
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
      bio: profile[0].bio,
      bannerUrl: profile[0].bannerUrl,
      favoriteClass: profile[0].favoriteClass,
      favoriteWeapon: profile[0].favoriteWeapon,
    };
  },

  /**
   * Atualizar o perfil de um usuário
   */
  async updateUserProfile(userId: string, data: {
    bio?: string;
    bannerUrl?: string;
    favoriteClass?: string;
    favoriteWeapon?: string;
  }) {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    try {
      // Verificar se o perfil já existe
      const existingProfile = await prisma.$queryRaw<any[]>`
        SELECT * FROM "public"."UserProfile" WHERE "userId" = ${userId} LIMIT 1
      `;

      if (existingProfile && existingProfile.length > 0) {
        // Atualizar o perfil existente
        await prisma.$executeRaw`
          UPDATE "public"."UserProfile"
          SET
            "bio" = ${data.bio !== undefined ? data.bio : existingProfile[0].bio},
            "bannerUrl" = ${data.bannerUrl !== undefined ? data.bannerUrl : existingProfile[0].bannerUrl},
            "favoriteClass" = ${data.favoriteClass !== undefined ? data.favoriteClass : existingProfile[0].favoriteClass},
            "favoriteWeapon" = ${data.favoriteWeapon !== undefined ? data.favoriteWeapon : existingProfile[0].favoriteWeapon},
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE "userId" = ${userId}
        `;

        // Buscar o perfil atualizado
        const updatedProfile = await prisma.$queryRaw<any[]>`
          SELECT * FROM "public"."UserProfile" WHERE "userId" = ${userId} LIMIT 1
        `;

        return {
          ...user,
          bio: updatedProfile[0].bio,
          bannerUrl: updatedProfile[0].bannerUrl,
          favoriteClass: updatedProfile[0].favoriteClass,
          favoriteWeapon: updatedProfile[0].favoriteWeapon,
        };
      } else {
        // Criar um novo perfil
        const profileId = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        await prisma.$executeRaw`
          INSERT INTO "public"."UserProfile" (
            "id", "bio", "bannerUrl", "favoriteClass", "favoriteWeapon", "userId"
          ) VALUES (
            ${profileId}, ${data.bio || null}, ${data.bannerUrl || null},
            ${data.favoriteClass || null}, ${data.favoriteWeapon || null}, ${userId}
          )
        `;

        return {
          ...user,
          bio: data.bio || null,
          bannerUrl: data.bannerUrl || null,
          favoriteClass: data.favoriteClass || null,
          favoriteWeapon: data.favoriteWeapon || null,
        };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};
