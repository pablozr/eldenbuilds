'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Create a context for the CSRF token
const CsrfContext = createContext<string | null>(null);

/**
 * Provider component that fetches and provides a CSRF token
 */
export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch a new CSRF token when the component mounts
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  return (
    <CsrfContext.Provider value={csrfToken}>
      {children}
    </CsrfContext.Provider>
  );
}

/**
 * Hook to access the CSRF token
 */
export function useCsrfToken() {
  const csrfToken = useContext(CsrfContext);
  
  if (csrfToken === undefined) {
    throw new Error('useCsrfToken must be used within a CsrfProvider');
  }
  
  return csrfToken;
}

/**
 * Component that adds a CSRF token to a form
 */
export function CsrfToken() {
  const csrfToken = useCsrfToken();
  
  if (!csrfToken) {
    return null;
  }
  
  return <input type="hidden" name="csrfToken" value={csrfToken} />;
}

/**
 * Function to add a CSRF token to fetch requests
 */
export function withCsrfToken(headers: HeadersInit = {}): HeadersInit {
  const csrfToken = useCsrfToken();
  
  if (!csrfToken) {
    return headers;
  }
  
  return {
    ...headers,
    'X-CSRF-Token': csrfToken,
  };
}
