import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/utils/csrf";

/**
 * Higher-order function that adds CSRF protection to an API route handler
 * 
 * @param handler The original API route handler
 * @returns A new handler with CSRF protection applied
 */
export function withCsrf(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return async function csrfProtection(req: NextRequest, context: any) {
    // Skip CSRF validation for GET requests (they should be idempotent)
    if (req.method === "GET") {
      return handler(req, context);
    }
    
    // Validate CSRF token for non-GET requests
    const isValid = await validateCsrfToken(req);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }
    
    // If CSRF validation passes, proceed with the original handler
    return handler(req, context);
  };
}
