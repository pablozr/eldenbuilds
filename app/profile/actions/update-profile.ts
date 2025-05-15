'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sanitizeInput } from "@/lib/utils/sanitize";

// Schema de validação para o perfil
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
  favoriteClass: z.string().max(50, "Favorite class must be at most 50 characters").optional().nullable(),
  favoriteWeapon: z.string().max(50, "Favorite weapon must be at most 50 characters").optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Server action para atualizar o perfil do usuário
 * Substitui a rota de API PUT /api/users/profile
 */
export async function updateProfile(formData: ProfileFormData) {
  try {
    // Validar os dados do formulário
    const validatedData = profileSchema.parse(formData);
    
    const { userId } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Busca o usuário no banco de dados
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (!dbUser) {
      return {
        success: false,
        error: "User not found",
      };
    }
    
    // Sanitiza os dados para prevenir XSS
    const sanitizedData = {
      username: sanitizeInput(validatedData.username),
      bio: validatedData.bio ? sanitizeInput(validatedData.bio) : null,
      favoriteClass: validatedData.favoriteClass ? sanitizeInput(validatedData.favoriteClass) : null,
      favoriteWeapon: validatedData.favoriteWeapon ? sanitizeInput(validatedData.favoriteWeapon) : null,
    };
    
    // Verifica se o nome de usuário já está em uso
    if (sanitizedData.username !== dbUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: sanitizedData.username },
      });
      
      if (existingUser) {
        return {
          success: false,
          error: "Username is already taken",
        };
      }
    }
    
    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        username: sanitizedData.username,
      },
    });
    
    // Verifica se o perfil já existe
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: dbUser.id },
    });
    
    if (existingProfile) {
      // Atualiza o perfil existente
      await prisma.userProfile.update({
        where: { userId: dbUser.id },
        data: {
          bio: sanitizedData.bio,
          favoriteClass: sanitizedData.favoriteClass,
          favoriteWeapon: sanitizedData.favoriteWeapon,
        },
      });
    } else {
      // Cria um novo perfil
      await prisma.userProfile.create({
        data: {
          userId: dbUser.id,
          bio: sanitizedData.bio,
          favoriteClass: sanitizedData.favoriteClass,
          favoriteWeapon: sanitizedData.favoriteWeapon,
        },
      });
    }
    
    // Revalida as páginas para atualizar os dados
    revalidatePath('/profile');
    revalidatePath(`/profile/${sanitizedData.username}`);
    
    return {
      success: true,
      user: {
        ...updatedUser,
        bio: sanitizedData.bio,
        favoriteClass: sanitizedData.favoriteClass,
        favoriteWeapon: sanitizedData.favoriteWeapon,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation error",
        details: error.errors,
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}
