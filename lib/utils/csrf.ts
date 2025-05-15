import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// CSRF token expiration time (15 minutes)
const CSRF_TOKEN_EXPIRATION = 15 * 60; // 15 minutes in seconds

/**
 * Generate a CSRF token
 * 
 * @returns CSRF token
 */
export async function generateCsrfToken(): Promise<string> {
  if (!process.env.CSRF_SECRET) {
    throw new Error("CSRF_SECRET environment variable is not set");
  }

  // Generate a random token value
  const tokenValue = crypto.randomUUID();
  
  // Create a JWT token with the random value
  const token = await new SignJWT({ value: tokenValue })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CSRF_TOKEN_EXPIRATION}s`)
    .sign(new TextEncoder().encode(process.env.CSRF_SECRET));
  
  // Set the token in a cookie
  cookies().set("csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: CSRF_TOKEN_EXPIRATION,
    path: "/"
  });
  
  return token;
}

/**
 * Validate a CSRF token
 * 
 * @param request Next.js request object
 * @returns Whether the token is valid
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  if (!process.env.CSRF_SECRET) {
    throw new Error("CSRF_SECRET environment variable is not set");
  }
  
  try {
    // Get the token from the cookie
    const cookieToken = request.cookies.get("csrf_token")?.value;
    
    // Get the token from the header
    const headerToken = request.headers.get("x-csrf-token");
    
    // If either token is missing, validation fails
    if (!cookieToken || !headerToken) {
      return false;
    }
    
    // Verify the cookie token
    const { payload: cookiePayload } = await jwtVerify(
      cookieToken,
      new TextEncoder().encode(process.env.CSRF_SECRET)
    );
    
    // Verify the header token
    const { payload: headerPayload } = await jwtVerify(
      headerToken,
      new TextEncoder().encode(process.env.CSRF_SECRET)
    );
    
    // Compare the token values
    return cookiePayload.value === headerPayload.value;
  } catch (error) {
    console.error("CSRF token validation error:", error);
    return false;
  }
}
