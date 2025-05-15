'use client';

import { useState, useEffect } from 'react';
import { initializeStorage, checkStorageStatus } from '../actions/init-storage';
import { setupStoragePolicies, checkPoliciesStatus } from '../actions/setup-policies';

export default function StorageInitializer() {
  const [status, setStatus] = useState<'checking' | 'not_initialized' | 'initializing' | 'ready' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Checking storage status...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Verificar o status do bucket
        const bucketStatus = await checkStorageStatus();
        
        if (!bucketStatus.success) {
          setStatus('not_initialized');
          setMessage('Storage bucket not initialized. Click to initialize.');
          return;
        }
        
        // Verificar o status das políticas
        const policiesStatus = await checkPoliciesStatus();
        
        if (policiesStatus.success) {
          setStatus('ready');
          setMessage('Storage is ready to use.');
        } else {
          setStatus('not_initialized');
          setMessage('Storage policies not configured. Click to configure.');
        }
      } catch (error) {
        console.error('Error checking storage status:', error);
        setStatus('error');
        setMessage('Error checking storage status.');
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    checkStatus();
  }, []);

  const handleInitialize = async () => {
    try {
      setStatus('initializing');
      setMessage('Initializing storage...');
      setError(null);
      
      // Inicializar o bucket
      await initializeStorage();
      
      // Configurar as políticas
      await setupStoragePolicies();
      
      setStatus('ready');
      setMessage('Storage initialized successfully.');
    } catch (error) {
      console.error('Error initializing storage:', error);
      setStatus('error');
      setMessage('Error initializing storage.');
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-lg font-semibold mb-2">Storage Status</h3>
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'ready' ? 'bg-green-500' :
          status === 'checking' || status === 'initializing' ? 'bg-yellow-500' :
          'bg-red-500'
        }`}></div>
        <span>{message}</span>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
      {(status === 'not_initialized' || status === 'error') && (
        <button
          onClick={handleInitialize}
          disabled={status === 'initializing'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {status === 'initializing' ? 'Initializing...' : 'Initialize Storage'}
        </button>
      )}
    </div>
  );
}
