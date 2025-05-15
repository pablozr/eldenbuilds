'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { buildFormSchema } from "@/lib/validations/build";
import { sanitizeObject } from "@/lib/utils/sanitize";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * Server action para atualizar uma build existente
 * Substitui a rota de API PUT /api/builds/[id]
 */
export async function updateBuild(buildId: string, formData: z.infer<typeof buildFormSchema>) {
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
    
    // Busca a build para verificar se o usuário é o dono
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });
    
    if (!build) {
      return {
        success: false,
        error: "Build not found",
      };
    }
    
    // Verifica se o usuário é o dono da build
    if (build.userId !== dbUser.id) {
      return {
        success: false,
        error: "Unauthorized: You can only edit your own builds",
      };
    }
    
    // Sanitiza os dados para prevenir XSS
    const sanitizedData = sanitizeObject(validatedData);
    
    // Atualiza a build
    const updatedBuild = await prisma.build.update({
      where: { id: buildId },
      data: sanitizedData,
    });
    
    // Revalida as páginas para atualizar os dados
    revalidatePath(`/builds/${buildId}`);
    revalidatePath('/builds');
    revalidatePath(`/profile`);
    
    // Redireciona para a página da build atualizada
    redirect(`/builds/${buildId}`);
  } catch (error) {
    console.error("Error updating build:", error);
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
      error: "Failed to update build",
    };
  }
}
