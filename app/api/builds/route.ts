import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { buildFormSchema } from "@/lib/validations/build";
import { buildService, BuildSortOption } from "@/lib/services/build-service";
import { authService } from "@/lib/services/auth-service";
import { ClerkUser } from "@/types/clerk";

// GET all builds
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parâmetros de paginação
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    // Parâmetros de filtro
    const search = searchParams.get("search") || undefined;
    const buildType = searchParams.get("buildType") || undefined;
    const minLevel = searchParams.get("minLevel") ? parseInt(searchParams.get("minLevel")!) : undefined;
    const maxLevel = searchParams.get("maxLevel") ? parseInt(searchParams.get("maxLevel")!) : undefined;
    const userId = searchParams.get("userId") || undefined;

    // Parâmetro de ordenação
    const sort = (searchParams.get("sort") as BuildSortOption) || "newest";

    // Busca as builds com os filtros, ordenação e paginação
    const result = await buildService.getBuilds(
      { search, buildType, minLevel, maxLevel, userId, isPublished: true },
      sort,
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch builds" },
      { status: 500 }
    );
  }
}

// POST a new build
export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser || !clerkUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Sincroniza o usuário do Clerk com o banco de dados
    try {
      // Converte o usuário do Clerk para o formato esperado pelo serviço
      const userToSync: ClerkUser = {
        id: clerkUser.id,
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        emailAddresses: clerkUser.emailAddresses?.map(email => ({
          id: email.id,
          emailAddress: email.emailAddress
        }))
      };

      // Sincroniza o usuário
      await authService.syncUser(userToSync);
      console.log(`User synchronized: ${clerkUser.id}`);
    } catch (syncError) {
      console.error("Error synchronizing user:", syncError);
      return NextResponse.json(
        { error: "Failed to synchronize user data" },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate the request body
    try {
      const validatedData = buildFormSchema.parse(body);

      // Create the build using the service
      const build = await buildService.createBuild(validatedData, clerkUser.id);

      return NextResponse.json(build, { status: 201 });
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.error("Validation error:", e.errors);
        return NextResponse.json(
          { error: "Validation error", details: e.errors },
          { status: 400 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("Error creating build:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "User not found" ? 404 : 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create build" },
      { status: 500 }
    );
  }
}
