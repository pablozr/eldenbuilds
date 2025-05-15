import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";
import { buildFormSchema } from "@/lib/validations/build";
import { buildService } from "@/lib/services/build-service";
import { withCsrf } from "@/lib/middlewares/with-csrf";
import { withRateLimit } from "@/lib/middlewares/with-rate-limit";
import { sanitizeObject } from "@/lib/utils/sanitize";

// GET a specific build
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const build = await buildService.getBuildById(params.id);

    if (!build) {
      return NextResponse.json(
        { error: "Build not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(build);
  } catch (error) {
    console.error("Error fetching build:", error);
    return NextResponse.json(
      { error: "Failed to fetch build" },
      { status: 500 }
    );
  }
}

// PUT (update) a build
export const PUT = withRateLimit(withCsrf(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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
    const validatedData = buildFormSchema.parse(body);

    // Sanitize user input to prevent XSS
    const sanitizedData = sanitizeObject(validatedData);

    // Update the build using the service with sanitized data
    const updatedBuild = await buildService.updateBuild(params.id, sanitizedData, userId);

    return NextResponse.json(updatedBuild);
  } catch (error) {
    console.error("Error updating build:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "User not found" ? 404 :
            error.message === "Build not found" ? 404 :
            error.message === "Unauthorized" ? 401 : 500
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to update build" },
      { status: 500 }
    );
  }
}), {
  maxRequests: 5,  // 5 build updates per minute
  windowMs: 60 * 1000  // 1 minute
});

// DELETE a build
export const DELETE = withRateLimit(withCsrf(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the build using the service
    await buildService.deleteBuild(params.id, userId);

    return NextResponse.json({ message: "Build deleted successfully" });
  } catch (error) {
    console.error("Error deleting build:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.message === "User not found" ? 404 :
            error.message === "Build not found" ? 404 :
            error.message === "Unauthorized" ? 401 : 500
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete build" },
      { status: 500 }
    );
  }
}), {
  maxRequests: 3,  // 3 build deletions per minute (more restrictive)
  windowMs: 60 * 1000  // 1 minute
});
