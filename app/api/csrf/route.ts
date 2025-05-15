import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCsrfToken } from "@/lib/utils/csrf";
import { withRateLimit } from "@/lib/middlewares/with-rate-limit";

/**
 * GET - Generate a new CSRF token
 * This endpoint is rate limited to prevent abuse
 */
export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      // Only authenticated users can get CSRF tokens
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      // Generate a new CSRF token
      const csrfToken = await generateCsrfToken();
      
      return NextResponse.json({ csrfToken });
    } catch (error) {
      console.error("Error generating CSRF token:", error);
      return NextResponse.json(
        { error: "Failed to generate CSRF token" },
        { status: 500 }
      );
    }
  },
  {
    maxRequests: 10, // 10 requests per minute
    windowMs: 60 * 1000 // 1 minute
  }
);
