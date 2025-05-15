import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obter builds de um usuário específico
export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const sort = searchParams.get("sort") || "newest";
    
    // Validar parâmetros
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page parameter" },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Invalid limit parameter" },
        { status: 400 }
      );
    }
    
    // Buscar o usuário pelo nome de usuário
    const user = await prisma.user.findUnique({
      where: { username: params.username },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Calcular o offset para paginação
    const skip = (page - 1) * limit;
    
    // Definir a ordenação
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "popular") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sort === "comments") {
      orderBy = { comments: { _count: "desc" } };
    }
    
    // Buscar as builds do usuário
    const [builds, totalBuilds] = await Promise.all([
      prisma.build.findMany({
        where: {
          userId: user.id,
          isPublished: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.build.count({
        where: {
          userId: user.id,
          isPublished: true,
        },
      }),
    ]);
    
    // Calcular o número total de páginas
    const totalPages = Math.ceil(totalBuilds / limit);
    
    return NextResponse.json({
      builds,
      pagination: {
        currentPage: page,
        totalPages,
        totalBuilds,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch user builds" },
      { status: 500 }
    );
  }
}
