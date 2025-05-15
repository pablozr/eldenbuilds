'use client';

import { useState, useEffect } from 'react';

export default function StorageInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ready' | 'not_initialized' | 'error'>('checking');
  const [message, setMessage] = useState<string | null>(null);
  
  // Verificar o status do bucket ao carregar o componente
  useEffect(() => {
    checkBucketStatus();
  }, []);
  
  // Função para verificar o status do bucket
  const checkBucketStatus = async () => {
    try {
      const response = await fetch('/api/storage/init', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data.status);
        if (data.status === 'ready') {
          setMessage(`Storage bucket '${data.bucketName}' is ready`);
        } else {
          setMessage(`Storage bucket '${data.bucketName}' needs to be initialized`);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to check storage status');
      }
    } catch (error) {
      console.error('Error checking storage status:', error);
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };
  
  // Função para inicializar o bucket
  const initializeBucket = async () => {
    setIsInitializing(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/storage/init', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('ready');
        setMessage(data.message || 'Storage initialized successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to initialize storage');
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      setStatus('error');
      setMessage('An unexpected error occurred');
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Se o bucket já estiver pronto, não mostrar nada
  if (status === 'ready') {
    return null;
  }
  
  return (
    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-yellow-500">Storage Setup Required</h3>
          <p className="text-sm text-yellow-500/80 mt-1 mb-3">
            {status === 'checking' 
              ? 'Checking storage status...' 
              : message || 'Storage needs to be initialized before you can upload images.'}
          </p>
          {status !== 'checking' && (
            <button
              onClick={initializeBucket}
              disabled={isInitializing}
              className="px-3 py-1.5 bg-yellow-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitializing ? 'Initializing...' : 'Initialize Storage'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
