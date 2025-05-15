import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { commentService } from "@/lib/services/comment-service";
import { commentFormSchema } from "@/lib/validations/build";

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
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = commentFormSchema.parse({
      ...body,
      buildId: params.id,
    });

    // Create the comment using the service
    const comment = await commentService.createComment(validatedData, userId);

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
}
