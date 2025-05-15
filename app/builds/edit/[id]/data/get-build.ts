import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

/**
 * Função para buscar uma build para edição
 * Usada diretamente em server components
 */
export async function getBuildForEdit(buildId: string) {
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
    
    // Busca a build
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });
    
    if (!build) {
      notFound();
    }
    
    // Verifica se o usuário é o dono da build
    if (build.userId !== dbUser.id) {
      redirect('/builds');
    }
    
    return build;
  } catch (error) {
    console.error("Error fetching build for edit:", error);
    notFound();
  }
}
