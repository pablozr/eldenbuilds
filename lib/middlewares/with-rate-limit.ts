import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/utils/rate-limit";

/**
 * Higher-order function that adds rate limiting to an API route handler
 *
 * @param handler The original API route handler
 * @param options Rate limiting options
 * @returns A new handler with rate limiting applied
 */
export function withRateLimit(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    maxRequests?: number;
    windowMs?: number;
    identifierFn?: (req: NextRequest) => string;
  } = {}
) {
  const {
    maxRequests = 10,
    windowMs = 60 * 1000, // 1 minute
    identifierFn = (req) => req.ip || 'anonymous'
  } = options;

  return async function rateLimitMiddleware(req: NextRequest, context: any) {
    // Get client identifier (IP address by default)
    const identifier = identifierFn(req);

    // Apply rate limiting
    const result = rateLimit(identifier, maxRequests, windowMs);

    // If rate limit exceeded, return 429 Too Many Requests
    if (!result.success) {
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": result.reset.toString()
          }
        }
      );
    }

    // Add rate limit headers to the response
    const response = await handler(req, context);

    // Clone the response to add headers
    const headers = new Headers(response.headers);
    headers.set("X-RateLimit-Limit", maxRequests.toString());
    headers.set("X-RateLimit-Remaining", result.remaining.toString());
    headers.set("X-RateLimit-Reset", result.reset.toString());

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
}
