import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { likeService } from "@/lib/services/like-service";
import { prisma } from "@/lib/prisma";

// POST to like/unlike a build
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const buildId = params?.id;

    // Get the user from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the build exists
    const build = await prisma.build.findUnique({
      where: {
        id: buildId,
      },
    });

    if (!build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }

    // Check if the user has already liked the build
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_buildId: {
          userId: dbUser.id,
          buildId,
        },
      },
    });

    // If the user has already liked the build, remove the like
    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({ liked: false });
    }

    // Otherwise, create a new like
    await prisma.like.create({
      data: {
        userId: dbUser.id,
        buildId,
      },
    });

    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error("Error toggling like:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "User not found" ? 404 :
            error.message === "Build not found" ? 404 : 500
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

// GET to check if a user has liked a build
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const buildId = params?.id;

    // Get the user from the database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user has already liked the build
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_buildId: {
          userId: dbUser.id,
          buildId,
        },
      },
    });

    return NextResponse.json({ liked: !!existingLike });
  } catch (error) {
    console.error("Error checking like:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "User not found" ? 404 :
            error.message === "Build not found" ? 404 : 500
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to check like" },
      { status: 500 }
    );
  }
}
