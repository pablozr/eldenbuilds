import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Função para buscar o perfil do usuário atual
 * Usada diretamente em server components
 */
export async function getCurrentUserProfile() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      redirect('/sign-in');
    }
    
    // Busca o usuário no banco de dados
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (!dbUser) {
      redirect('/sign-in');
    }
    
    // Busca o perfil do usuário
    const profile = await prisma.userProfile.findUnique({
      where: { userId: dbUser.id },
    });
    
    // Busca estatísticas do usuário
    const buildCount = await prisma.build.count({
      where: { userId: dbUser.id },
    });
    
    const publishedBuildCount = await prisma.build.count({
      where: {
        userId: dbUser.id,
        isPublished: true,
      },
    });
    
    const likesReceived = await prisma.like.count({
      where: {
        build: {
          userId: dbUser.id,
        },
      },
    });
    
    const commentsReceived = await prisma.comment.count({
      where: {
        build: {
          userId: dbUser.id,
        },
      },
    });
    
    // Build mais popular
    const mostPopularBuild = await prisma.build.findFirst({
      where: {
        userId: dbUser.id,
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
      ...dbUser,
      bio: profile?.bio || null,
      bannerUrl: profile?.bannerUrl || null,
      favoriteClass: profile?.favoriteClass || null,
      favoriteWeapon: profile?.favoriteWeapon || null,
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
  } catch (error) {
    console.error("Error fetching user profile:", error);
    redirect('/sign-in');
  }
}

/**
 * Função para buscar o perfil de um usuário pelo nome de usuário
 * Usada diretamente em server components
 */
export async function getUserProfileByUsername(username: string) {
  try {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
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
    
    if (!user) {
      return null;
    }
    
    // Busca o perfil do usuário
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    
    // Busca estatísticas do usuário
    const buildCount = await prisma.build.count({
      where: { userId: user.id },
    });
    
    const publishedBuildCount = await prisma.build.count({
      where: {
        userId: user.id,
        isPublished: true,
      },
    });
    
    const likesReceived = await prisma.like.count({
      where: {
        build: {
          userId: user.id,
        },
      },
    });
    
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
      bio: profile?.bio || null,
      bannerUrl: profile?.bannerUrl || null,
      favoriteClass: profile?.favoriteClass || null,
      favoriteWeapon: profile?.favoriteWeapon || null,
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
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
