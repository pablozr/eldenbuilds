import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "profile"; // Tipo de imagem: profile ou banner

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Verificar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    // Upload da imagem usando a função do serviço
    const imageUrl = await uploadImage(file, userId, type);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: imageUrl,
      type: type
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
