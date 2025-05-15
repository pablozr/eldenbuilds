'use server';

import { auth } from "@clerk/nextjs/server";
import { ensureBucketExists, SHARED_BUCKET } from "@/lib/supabase";

/**
 * Inicializa o bucket de armazenamento
 * @returns Objeto com informações sobre o status da inicialização
 */
export async function initializeStorage() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verificar e criar o bucket se necessário
    const bucketReady = await ensureBucketExists();

    if (!bucketReady) {
      throw new Error("Failed to initialize storage bucket");
    }

    return {
      success: true,
      message: `Storage bucket '${SHARED_BUCKET}' initialized successfully`,
    };
  } catch (error) {
    console.error("Error initializing storage bucket:", error);
    throw error;
  }
}

/**
 * Verifica o status do bucket de armazenamento
 * @returns Objeto com informações sobre o status do bucket
 */
export async function checkStorageStatus() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Verificar se o bucket existe
    const bucketReady = await ensureBucketExists();

    return {
      success: bucketReady,
      bucketName: SHARED_BUCKET,
      status: bucketReady ? "ready" : "not_initialized",
    };
  } catch (error) {
    console.error("Error checking storage bucket status:", error);
    throw error;
  }
}
