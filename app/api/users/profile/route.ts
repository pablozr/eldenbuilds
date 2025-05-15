import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { profileService } from "@/lib/services/profile-service";
import { z } from "zod";

// Schema de validação para atualização de perfil
const profileUpdateSchema = z.object({
  bio: z.string().optional(),
  favoriteClass: z.string().optional(),
  favoriteWeapon: z.string().optional(),
  imageUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

// GET - Obter perfil do usuário atual
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Buscar o perfil do usuário
    const userProfile = await profileService.getUserProfile(user.id);

    // Buscar estatísticas do usuário
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

    // Buscar build mais popular
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

    // Retornar o perfil com estatísticas
    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      imageUrl: user.imageUrl,
      bannerUrl: userProfile?.bannerUrl,
      bio: userProfile?.bio,
      favoriteClass: userProfile?.favoriteClass,
      favoriteWeapon: userProfile?.favoriteWeapon,
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
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar perfil do usuário
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validar os dados da requisição
    const body = await req.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Atualizar o perfil do usuário
    const updatedProfile = await profileService.updateUserProfile(user.id, validatedData);

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      imageUrl: user.imageUrl,
      bannerUrl: updatedProfile.bannerUrl,
      bio: updatedProfile.bio,
      favoriteClass: updatedProfile.favoriteClass,
      favoriteWeapon: updatedProfile.favoriteWeapon,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
