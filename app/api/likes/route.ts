import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

// Validation schema for likes
const likeSchema = z.object({
  buildId: z.string(),
});

// POST a new like or remove an existing like
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
    
    const body = await req.json();
    
    // Validate the request body
    const { buildId } = likeSchema.parse(body);
    
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
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
