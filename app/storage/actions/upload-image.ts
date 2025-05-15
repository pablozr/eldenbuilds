'use server';

import { uploadImage } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { initializeStorage } from "@/lib/utils/storage-init";

/**
 * Faz upload de uma imagem para o Supabase Storage
 * @param formData FormData contendo o arquivo a ser enviado
 * @returns URL da imagem enviada
 */
export async function uploadImageAction(formData: FormData) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "profile"; // Tipo de imagem: profile ou banner

    if (!file) {
      throw new Error("File is required");
    }

    // Verificar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("File size exceeds 2MB limit");
    }

    // Upload da imagem usando a função do serviço
    const imageUrl = await uploadImage(file, userId, type);

    if (!imageUrl) {
      throw new Error("Failed to upload image");
    }

    return {
      url: imageUrl,
      type: type
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
