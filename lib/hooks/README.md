# Server Action Utilities

This directory contains utilities for standardizing server actions in your Next.js application.

## `useServerAction` Hook

The `useServerAction` hook provides a standardized way to handle server actions in your client components. It includes:

- Input and output validation using Zod schemas
- Standardized error handling
- Loading states
- Proper TypeScript typing

### Usage

```tsx
import { z } from 'zod';
import { useServerAction } from '@/lib/hooks/useServerAction';
import { myServerAction } from '@/app/actions/myAction';

// Define your schemas
const inputSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

// Use the hook in your component
function MyForm() {
  const { 
    execute, 
    isLoading, 
    data, 
    error, 
    validationErrors,
    reset 
  } = useServerAction({
    input: inputSchema,
    output: outputSchema,
    handler: myServerAction,
    onSuccess: (data) => {
      // Handle success
      console.log('Success:', data);
    },
    onError: (error, validationErrors) => {
      // Handle error
      console.error('Error:', error, validationErrors);
    },
  });
  
  const handleSubmit = async (formData) => {
    const result = await execute(formData);
    // result contains the standardized response
  };
  
  return (
    // Your form JSX
  );
}
```

## Server-Side Utility

The `createServerAction` utility helps you create standardized server actions with proper validation and error handling.

### Usage

```ts
// In a server action file (with 'use server' directive)
import { z } from 'zod';
import { createServerAction } from '@/lib/server/createServerAction';

// Define your schemas
const inputSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

const outputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});

// Create your server action
export const createUser = createServerAction({
  input: inputSchema,
  output: outputSchema,
  handler: async (validatedData) => {
    // Your business logic here
    const user = await db.users.create({
      data: validatedData,
    });
    
    // Return the data to be validated by the output schema
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  },
});
```

## Benefits

Using these utilities provides several benefits:

1. **Consistency**: All server actions follow the same pattern and return standardized responses
2. **Type Safety**: Full TypeScript support with proper typing for inputs and outputs
3. **Validation**: Automatic validation of inputs and outputs using Zod schemas
4. **Error Handling**: Standardized error handling for validation errors and runtime errors
5. **User Feedback**: Built-in loading states and error messages for better user experience

## Response Format

All server actions return responses in this standardized format:

```ts
{
  success: boolean;
  data?: T;  // Only present on success
  error?: string;  // Only present on error
  validationErrors?: z.ZodIssue[];  // Only present on validation errors
}
```

This makes it easy to handle responses consistently throughout your application.
