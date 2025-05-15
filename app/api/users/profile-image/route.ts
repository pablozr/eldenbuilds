import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

// Schema de validação para atualização da imagem de perfil
const profileImageSchema = z.object({
  imageUrl: z.string().url(),
});

// PATCH - Atualizar a imagem de perfil do usuário no Clerk
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validar os dados da requisição
    const body = await req.json();
    const validatedData = profileImageSchema.parse(body);

    // Atualizar a imagem de perfil no Clerk
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        imageUrl: validatedData.imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile image updated in Clerk successfully",
    });
  } catch (error) {
    console.error("Error updating Clerk profile image:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}
