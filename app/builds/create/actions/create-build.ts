'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { buildFormSchema } from "@/lib/validations/build";
import { sanitizeObject } from "@/lib/utils/sanitize";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * Server action para criar uma nova build
 * Substitui a rota de API POST /api/builds
 */
export async function createBuild(formData: z.infer<typeof buildFormSchema>) {
  try {
    // Validar os dados do formulário
    const validatedData = buildFormSchema.parse(formData);
    
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
    const sanitizedData = sanitizeObject(validatedData);
    
    // Cria a build
    const build = await prisma.build.create({
      data: {
        ...sanitizedData,
        userId: dbUser.id,
      },
    });
    
    // Revalida a página de builds para atualizar os dados
    revalidatePath('/builds');
    
    // Redireciona para a página da build criada
    redirect(`/builds/${build.id}`);
  } catch (error) {
    console.error("Error creating build:", error);
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
      error: "Failed to create build",
    };
  }
}
