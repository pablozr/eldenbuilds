/**
 * Simple in-memory rate limiter
 * For production, consider using a Redis-based solution
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter function
 * 
 * @param identifier Unique identifier for the client (IP, user ID, etc.)
 * @param maxRequests Maximum number of requests allowed in the time window
 * @param windowMs Time window in milliseconds
 * @returns Object with success flag and limit information
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute by default
) {
  const now = Date.now();
  
  // Clean up expired entries every 100 requests
  if (Math.random() < 0.01) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  // Get or create rate limit entry
  const entry = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + windowMs
  };
  
  // Reset if the time window has passed
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }
  
  // Increment request count
  entry.count++;
  
  // Update store
  rateLimitStore.set(identifier, entry);
  
  // Calculate remaining requests and time until reset
  const remaining = Math.max(0, maxRequests - entry.count);
  const reset = Math.ceil((entry.resetTime - now) / 1000); // in seconds
  
  return {
    success: entry.count <= maxRequests,
    limit: maxRequests,
    remaining,
    reset
  };
}
