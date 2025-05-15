/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * @param input The user input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Replace HTML tags and entities
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .trim();
}

/**
 * Sanitizes an object's string properties recursively
 * 
 * @param obj The object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    const value = result[key as keyof typeof result];
    
    if (typeof value === 'string') {
      (result as any)[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      (result as any)[key] = sanitizeObject(value);
    }
  });
  
  return result;
}
