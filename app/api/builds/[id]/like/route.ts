import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { likeService } from "@/lib/services/like-service";

// POST to like/unlike a build
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

    // Toggle like using the service
    const result = await likeService.toggleLike(params.id, userId);

    return NextResponse.json(result);
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
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if the user has liked the build using the service
    const liked = await likeService.hasLiked(params.id, userId);

    return NextResponse.json({ liked });
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
