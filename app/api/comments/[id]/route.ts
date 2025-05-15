import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { commentService } from "@/lib/services/comment-service";
import { prisma } from "@/lib/prisma";
import { withCsrf } from "@/lib/middlewares/with-csrf";
import { withRateLimit } from "@/lib/middlewares/with-rate-limit";
import { sanitizeInput } from "@/lib/utils/sanitize";

// PUT (update) a comment
export const PUT = withRateLimit(withCsrf(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const commentId = params.id;

    if (!body.content || typeof body.content !== "string" || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

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

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the comment
    if (comment.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Sanitize the comment content to prevent XSS
    const sanitizedContent = sanitizeInput(body.content);

    // Update the comment with sanitized content
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: sanitizedContent },
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "User not found" ? 404 :
            error.message === "Comment not found" ? 404 :
            error.message === "Unauthorized" ? 401 : 500
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}), {
  maxRequests: 5,  // 5 comment updates per minute
  windowMs: 60 * 1000  // 1 minute
});

// DELETE a comment
export const DELETE = withRateLimit(withCsrf(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const commentId = params.id;

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

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if the user is the author of the comment
    if (comment.userId !== dbUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "User not found" ? 404 :
            error.message === "Comment not found" ? 404 :
            error.message === "Unauthorized" ? 401 : 500
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}), {
  maxRequests: 5,  // 5 comment deletions per minute
  windowMs: 60 * 1000  // 1 minute
});
