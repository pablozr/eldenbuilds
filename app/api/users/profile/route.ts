import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { profileService } from "@/lib/services/profile-service";
import { z } from "zod";
import { withCsrf } from "@/lib/middlewares/with-csrf";
import { withRateLimit } from "@/lib/middlewares/with-rate-limit";
import { sanitizeObject } from "@/lib/utils/sanitize";

// Schema de validação para atualização de perfil
const profileUpdateSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  bio: z.string()
    .max(500, "Bio must be 500 characters or less")
    .transform(val => val?.trim())
    .optional(),
  favoriteClass: z.string()
    .max(50, "Class name must be 50 characters or less")
    .transform(val => val?.trim())
    .optional(),
  favoriteWeapon: z.string()
    .max(50, "Weapon name must be 50 characters or less")
    .transform(val => val?.trim())
    .optional(),
  imageUrl: z.string()
    .url("Image URL must be a valid URL")
    .refine(url => url.startsWith('https://'), {
      message: "Image URL must use HTTPS for security"
    })
    .optional(),
  bannerUrl: z.string()
    .url("Banner URL must be a valid URL")
    .refine(url => url.startsWith('https://'), {
      message: "Banner URL must use HTTPS for security"
    })
    .optional(),
});

// GET - Obter perfil do usuário atual
export const GET = withRateLimit(async (req: NextRequest) => {
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
}, {
  maxRequests: 15,  // 15 profile requests per minute
  windowMs: 60 * 1000  // 1 minute
});

// PATCH - Atualizar perfil do usuário
export const PATCH = withRateLimit(withCsrf(async (req: NextRequest) => {
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

    // Sanitize user input to prevent XSS
    const sanitizedData = sanitizeObject(validatedData);

    // Se o usuário está tentando atualizar o nome de usuário, verificar se está disponível
    if (sanitizedData.username && sanitizedData.username !== user.username) {
      // Verificar se o nome de usuário já está em uso
      const existingUser = await prisma.user.findUnique({
        where: { username: sanitizedData.username },
        select: { id: true }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Atualizar o perfil do usuário com dados sanitizados
    const updatedProfile = await profileService.updateUserProfile(user.id, sanitizedData);

    // Buscar o usuário atualizado para obter o nome de usuário mais recente
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true }
    });

    return NextResponse.json({
      id: user.id,
      username: updatedUser?.username || user.username,
      name: user.name,
      imageUrl: updatedProfile.imageUrl || user.imageUrl,
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
}), {
  maxRequests: 5,  // 5 profile updates per minute
  windowMs: 60 * 1000  // 1 minute
});
