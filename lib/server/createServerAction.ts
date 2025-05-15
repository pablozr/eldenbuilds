'use server';

import { z } from 'zod';

/**
 * Type for the server action response
 */
export type ServerActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: z.ZodIssue[];
};

/**
 * Options for creating a server action
 */
export interface CreateServerActionOptions<TInput, TOutput> {
  /**
   * Zod schema for validating the input data
   */
  input: z.ZodType<TInput>;
  
  /**
   * Zod schema for validating the output data
   */
  output: z.ZodType<TOutput>;
  
  /**
   * The handler function that processes the request
   */
  handler: (input: TInput) => Promise<TOutput>;
}

/**
 * Create a server action with standardized validation and error handling
 * 
 * @param options The server action options
 * @returns A server action function with standardized response format
 */
export function createServerAction<TInput, TOutput>({
  input: inputSchema,
  output: outputSchema,
  handler,
}: CreateServerActionOptions<TInput, TOutput>) {
  return async (input: TInput): Promise<ServerActionResponse<TOutput>> => {
    try {
      // Validate input
      const validatedInput = inputSchema.parse(input);
      
      // Execute handler
      const result = await handler(validatedInput);
      
      // Validate output
      try {
        const validatedOutput = outputSchema.parse(result);
        
        // Return success response
        return {
          success: true,
          data: validatedOutput,
        };
      } catch (outputError) {
        // Handle output validation error
        if (outputError instanceof z.ZodError) {
          console.error('Output validation error:', outputError.errors);
          
          return {
            success: false,
            error: 'Invalid response format',
            validationErrors: outputError.errors,
          };
        }
        
        throw outputError; // Re-throw if not a Zod error
      }
    } catch (error) {
      // Handle input validation error
      if (error instanceof z.ZodError) {
        console.error('Input validation error:', error.errors);
        
        return {
          success: false,
          error: 'Validation error',
          validationErrors: error.errors,
        };
      }
      
      // Handle other errors
      console.error('Server action error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };
}
