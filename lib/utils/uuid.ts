import { v5 as uuidv5 } from 'uuid';

// Namespace for our application (this is a random UUID)
// We use a fixed namespace to ensure consistent UUID generation
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

/**
 * Generate a deterministic UUID v5 from a string
 * This ensures that the same input always produces the same UUID
 * 
 * @param input The input string (e.g., Clerk user ID)
 * @returns A valid UUID v5 string
 */
export function generateUUID(input: string): string {
  return uuidv5(input, NAMESPACE);
}

/**
 * Generate a UUID for a user based on their Clerk ID
 * 
 * @param clerkId The Clerk user ID
 * @returns A valid UUID v5 string
 */
export function getUserUUID(clerkId: string): string {
  return generateUUID(`clerk:${clerkId}`);
}
