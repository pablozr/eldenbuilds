'use client';

import { useState } from 'react';
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
 * Type for the server action handler function
 */
export type ServerActionHandler<TInput, TOutput> = (
  input: TInput
) => Promise<ServerActionResponse<TOutput>>;

/**
 * Type for the server action hook options
 */
export interface UseServerActionOptions<TInput, TOutput> {
  /**
   * Zod schema for validating the input data
   */
  input: z.ZodType<TInput>;
  
  /**
   * Zod schema for validating the output data
   */
  output: z.ZodType<TOutput>;
  
  /**
   * The server action handler function
   */
  handler: (input: TInput) => Promise<any>;
  
  /**
   * Optional callback to run on success
   */
  onSuccess?: (data: TOutput) => void;
  
  /**
   * Optional callback to run on error
   */
  onError?: (error: string, validationErrors?: z.ZodIssue[]) => void;
}

/**
 * Type for the server action hook return value
 */
export interface UseServerActionReturn<TInput, TOutput> {
  /**
   * Execute the server action with the given input
   */
  execute: (input: TInput) => Promise<ServerActionResponse<TOutput>>;
  
  /**
   * Whether the server action is currently loading
   */
  isLoading: boolean;
  
  /**
   * The data returned from the server action
   */
  data: TOutput | undefined;
  
  /**
   * The error returned from the server action
   */
  error: string | undefined;
  
  /**
   * The validation errors returned from the server action
   */
  validationErrors: z.ZodIssue[] | undefined;
  
  /**
   * Reset the state of the server action
   */
  reset: () => void;
}

/**
 * A hook for standardizing server actions with Zod validation
 * 
 * @param options The server action options
 * @returns The server action hook return value
 */
export function useServerAction<TInput, TOutput>({
  input: inputSchema,
  output: outputSchema,
  handler,
  onSuccess,
  onError,
}: UseServerActionOptions<TInput, TOutput>): UseServerActionReturn<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[] | undefined>(undefined);

  /**
   * Reset the state of the server action
   */
  const reset = () => {
    setData(undefined);
    setError(undefined);
    setValidationErrors(undefined);
  };

  /**
   * Execute the server action with the given input
   */
  const execute = async (input: TInput): Promise<ServerActionResponse<TOutput>> => {
    // Reset state
    reset();
    setIsLoading(true);

    try {
      // Validate input
      const validatedInput = inputSchema.parse(input);

      // Execute handler
      const result = await handler(validatedInput);

      // Validate output
      try {
        const validatedOutput = outputSchema.parse(result.data || result);
        
        // Format response
        const response: ServerActionResponse<TOutput> = {
          success: result.success !== false, // Default to true if not specified
          data: validatedOutput,
        };

        // Update state
        setData(validatedOutput);
        
        // Call onSuccess callback
        if (response.success && onSuccess) {
          onSuccess(validatedOutput);
        }

        setIsLoading(false);
        return response;
      } catch (outputError) {
        // Handle output validation error
        if (outputError instanceof z.ZodError) {
          const errorResponse: ServerActionResponse<TOutput> = {
            success: false,
            error: 'Invalid response format',
            validationErrors: outputError.errors,
          };
          
          setError('Invalid response format');
          setValidationErrors(outputError.errors);
          
          // Call onError callback
          if (onError) {
            onError('Invalid response format', outputError.errors);
          }
          
          setIsLoading(false);
          return errorResponse;
        }
        
        throw outputError; // Re-throw if not a Zod error
      }
    } catch (error) {
      // Handle input validation error
      if (error instanceof z.ZodError) {
        const errorResponse: ServerActionResponse<TOutput> = {
          success: false,
          error: 'Validation error',
          validationErrors: error.errors,
        };
        
        setError('Validation error');
        setValidationErrors(error.errors);
        
        // Call onError callback
        if (onError) {
          onError('Validation error', error.errors);
        }
        
        setIsLoading(false);
        return errorResponse;
      }
      
      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errorResponse: ServerActionResponse<TOutput> = {
        success: false,
        error: errorMessage,
      };
      
      setError(errorMessage);
      
      // Call onError callback
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
      return errorResponse;
    }
  };

  return {
    execute,
    isLoading,
    data,
    error,
    validationErrors,
    reset,
  };
}
