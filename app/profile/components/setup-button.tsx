'use client';

import { useState } from 'react';

export default function SetupButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleSetup = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      const response = await fetch('/api/setup-db', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message || 'Setup completed successfully!');
      } else {
        setError(data.error || 'Failed to setup database');
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <button
        onClick={handleSetup}
        disabled={isLoading}
        className="px-4 py-2 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Setting up...' : 'Setup Database'}
      </button>
      
      {message && (
        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-md text-green-500 text-sm">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
