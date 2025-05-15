import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { getUserUUID } from "@/lib/utils/uuid";

// This endpoint generates a custom JWT token that Supabase can understand
// It will be used to authenticate requests to Supabase Storage
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Check if JWT secret is available
    if (!process.env.SUPABASE_JWT_SECRET) {
      console.error("SUPABASE_JWT_SECRET is not defined in environment variables");
      return NextResponse.json(
        { error: "Server configuration error: JWT secret not defined" },
        { status: 500 }
      );
    }

    // Generate a UUID for the user based on their Clerk ID
    const userUUID = getUserUUID(userId);

    // Create a JWT token that Supabase can understand with enhanced security
    // The token needs to include specific claims that Supabase expects
    const token = await new SignJWT({
      // Standard claims
      sub: userUUID, // Use a valid UUID as the subject
      exp: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes expiration (reduced from 1 hour)
      nbf: Math.floor(Date.now() / 1000), // Not valid before current time
      iat: Math.floor(Date.now() / 1000), // Issued at current time
      jti: `${userUUID}-${Date.now()}`, // Unique token ID to prevent replay attacks

      // Supabase specific claims
      role: "authenticated",
      aud: "authenticated",
      iss: "supabase",

      // User data
      user_id: userUUID, // Use the same UUID here
      email: user.email,

      // Custom claims for reference
      clerk_id: userId,
      db_user_id: user.id
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime('30m') // 30 minutes expiration
      .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating Supabase token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
