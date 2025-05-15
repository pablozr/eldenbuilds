'use server';

import { auth } from "@clerk/nextjs/server";
import { generateCsrfToken } from "@/lib/csrf";

/**
 * Gera um token CSRF para proteção contra ataques CSRF
 * @returns Token CSRF
 */
export async function generateCsrfTokenAction() {
  try {
    // Only authenticated users can get CSRF tokens
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    // Generate a new CSRF token
    const csrfToken = await generateCsrfToken();
    
    return { csrfToken };
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    throw error;
  }
}
