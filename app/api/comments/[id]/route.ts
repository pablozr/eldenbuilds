import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { commentService } from "@/lib/services/comment-service";

// PUT (update) a comment
export async function PUT(
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

    if (!body.content || typeof body.content !== "string" || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Update the comment using the service
    const updatedComment = await commentService.updateComment(params.id, body.content, userId);

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
}

// DELETE a comment
export async function DELETE(
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

    // Delete the comment using the service
    await commentService.deleteComment(params.id, userId);

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
}
