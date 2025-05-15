import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ensureBucketExists, SHARED_BUCKET } from "@/lib/supabase";

// POST - Inicializar o bucket de armazenamento
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar e criar o bucket se necessário
    const bucketReady = await ensureBucketExists();

    if (!bucketReady) {
      return NextResponse.json(
        { error: "Failed to initialize storage bucket" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Storage bucket '${SHARED_BUCKET}' initialized successfully`,
    });
  } catch (error) {
    console.error("Error initializing storage bucket:", error);
    return NextResponse.json(
      { error: "Failed to initialize storage bucket" },
      { status: 500 }
    );
  }
}

// GET - Verificar o status do bucket de armazenamento
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar se o bucket existe
    const bucketReady = await ensureBucketExists();

    return NextResponse.json({
      success: bucketReady,
      bucketName: SHARED_BUCKET,
      status: bucketReady ? "ready" : "not_initialized",
    });
  } catch (error) {
    console.error("Error checking storage bucket status:", error);
    return NextResponse.json(
      { error: "Failed to check storage bucket status" },
      { status: 500 }
    );
  }
}
