import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentFormSchema } from "@/lib/validations/build";
import { currentUser } from "@clerk/nextjs/server";

// POST a new comment
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
    const validatedData = commentFormSchema.parse(body);
    
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
        id: validatedData.buildId,
      },
    });
    
    if (!build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }
    
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: dbUser.id,
        buildId: validatedData.buildId,
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
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

