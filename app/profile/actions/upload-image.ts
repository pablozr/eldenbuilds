'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/supabase";

/**
 * Server action para fazer upload de uma imagem de perfil
 * Substitui a rota de API POST /api/users/profile/image
 */
export async function uploadProfileImage(formData: FormData) {
  try {
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
    
    // Obtém o arquivo do FormData
    const file = formData.get('image') as File;
    
    if (!file) {
      return {
        success: false,
        error: "No image provided",
      };
    }
    
    // Verifica o tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: "File must be an image",
      };
    }
    
    // Verifica o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Image size must be less than 5MB",
      };
    }
    
    // Faz upload da imagem para o Supabase
    const path = `profiles/${dbUser.id}`;
    const result = await uploadImage(file, 'avatars', path);
    
    if (!result.url) {
      return {
        success: false,
        error: "Failed to upload image",
      };
    }
    
    // Atualiza o usuário com a nova URL da imagem
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        imageUrl: result.url,
      },
    });
    
    // Revalida as páginas para atualizar os dados
    revalidatePath('/profile');
    revalidatePath(`/profile/${updatedUser.username}`);
    
    return {
      success: true,
      imageUrl: result.url,
    };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: "Failed to upload profile image",
    };
  }
}
