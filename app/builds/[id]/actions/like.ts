'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerAction } from "@/lib/server/createServerAction";

// Schema para o ID da build
const buildIdSchema = z.object({
  buildId: z.string(),
});

// Schema para a resposta de like
const likeResponseSchema = z.object({
  liked: z.boolean(),
});

/**
 * Server action para alternar o like em uma build
 * Substitui a rota de API /api/builds/[id]/like
 */
export const toggleLike = createServerAction({
  input: buildIdSchema,
  output: likeResponseSchema,
  handler: async ({ buildId }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Busca o usuário no banco de dados
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    // Verifica se a build existe
    const build = await prisma.build.findUnique({
      where: { id: buildId },
    });

    if (!build) {
      throw new Error("Build not found");
    }

    // Verifica se o usuário já curtiu a build
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_buildId: {
          userId: dbUser.id,
          buildId,
        },
      },
    });

    // Se o usuário já curtiu a build, remove o like
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      // Revalida a página para atualizar os dados
      revalidatePath(`/builds/${buildId}`);
      return { liked: false };
    }

    // Caso contrário, cria um novo like
    await prisma.like.create({
      data: {
        userId: dbUser.id,
        buildId,
      },
    });

    // Revalida a página para atualizar os dados
    revalidatePath(`/builds/${buildId}`);
    return { liked: true };
  },
});

/**
 * Server action para verificar se um usuário curtiu uma build
 * Substitui a rota de API GET /api/builds/[id]/like
 */
export const checkLikeStatus = createServerAction({
  input: buildIdSchema,
  output: likeResponseSchema,
  handler: async ({ buildId }) => {
    const { userId } = await auth();

    if (!userId) {
      return { liked: false };
    }

    // Busca o usuário no banco de dados
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { liked: false };
    }

    // Verifica se o usuário já curtiu a build
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_buildId: {
          userId: dbUser.id,
          buildId,
        },
      },
    });

    return { liked: !!existingLike };
  },
});
