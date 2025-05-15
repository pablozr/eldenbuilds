'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeInput } from "@/lib/utils/sanitize";
import { z } from "zod";
import { createServerAction } from "@/lib/server/createServerAction";

// Schema de validação para comentários
const commentInputSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  buildId: z.string(),
});

// Schema de validação para a resposta
const commentOutputSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    imageUrl: z.string().nullable(),
  }),
});

/**
 * Server action para adicionar um comentário a uma build
 * Substitui a rota de API POST /api/comments
 */
export const addComment = createServerAction({
  input: commentInputSchema,
  output: commentOutputSchema,
  handler: async (validatedData) => {
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
      where: { id: validatedData.buildId },
    });

    if (!build) {
      throw new Error("Build not found");
    }

    // Sanitiza o conteúdo do comentário para prevenir XSS
    const sanitizedContent = sanitizeInput(validatedData.content);

    // Cria o comentário
    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        buildId: validatedData.buildId,
        userId: dbUser.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
    });

    // Revalida a página para atualizar os dados
    revalidatePath(`/builds/${validatedData.buildId}`);

    // Retorna o comentário formatado
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        username: comment.user.username,
        imageUrl: comment.user.imageUrl,
      },
    };
  },
});

// Schema para o ID do comentário
const commentIdSchema = z.object({
  commentId: z.string(),
});

// Schema para a resposta de exclusão
const deleteCommentOutputSchema = z.object({
  success: z.boolean(),
});

// Schema para edição de comentário
const editCommentInputSchema = z.object({
  commentId: z.string(),
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
});

/**
 * Server action para excluir um comentário
 * Substitui a rota de API DELETE /api/comments/[id]
 */
export const deleteComment = createServerAction({
  input: commentIdSchema,
  output: deleteCommentOutputSchema,
  handler: async ({ commentId }) => {
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

    // Busca o comentário
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        build: true,
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Verifica se o usuário é o dono do comentário
    if (comment.userId !== dbUser.id) {
      throw new Error("Unauthorized");
    }

    // Exclui o comentário
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Revalida a página para atualizar os dados
    revalidatePath(`/builds/${comment.buildId}`);

    return {
      success: true,
    };
  },
});

/**
 * Server action para editar um comentário
 * Substitui a rota de API PUT /api/comments/[id]
 */
export const editComment = createServerAction({
  input: editCommentInputSchema,
  output: commentOutputSchema,
  handler: async ({ commentId, content }) => {
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

    // Busca o comentário
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        build: true,
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Verifica se o usuário é o dono do comentário
    if (comment.userId !== dbUser.id) {
      throw new Error("Unauthorized");
    }

    // Sanitiza o conteúdo do comentário para prevenir XSS
    const sanitizedContent = sanitizeInput(content);

    // Atualiza o comentário
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: sanitizedContent,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
    });

    // Revalida a página para atualizar os dados
    revalidatePath(`/builds/${comment.buildId}`);

    // Retorna o comentário atualizado
    return {
      id: updatedComment.id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt.toISOString(),
      user: {
        id: updatedComment.user.id,
        username: updatedComment.user.username,
        imageUrl: updatedComment.user.imageUrl,
      },
    };
  },
});
