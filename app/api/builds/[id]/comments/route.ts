import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { commentService } from "@/lib/services/comment-service";
import { commentFormSchema } from "@/lib/validations/build";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/utils/sanitize";
import { withRateLimit } from "@/lib/middlewares/with-rate-limit";

// GET comments for a build
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await commentService.getCommentsByBuildId(params.id);

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST a new comment
export const POST = withRateLimit(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const buildId = params.id;

    // Validate the request body
    const validatedData = commentFormSchema.parse({
      ...body,
      buildId,
    });

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

    // Sanitize the comment content to prevent XSS
    const sanitizedContent = sanitizeInput(validatedData.content);

    // Create the comment with sanitized content
    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        userId: dbUser.id,
        buildId,
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
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}, {
  maxRequests: 5,  // 5 comments per minute
  windowMs: 60 * 1000  // 1 minute
});
