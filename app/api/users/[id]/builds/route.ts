import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user-service";

// GET builds for a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    const result = await userService.getUserBuilds(params.id, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch user builds" },
      { status: 500 }
    );
  }
}
