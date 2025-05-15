'use client';

import { useState, useEffect } from 'react';

export default function StoragePolicyInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<'checking' | 'ready' | 'not_initialized' | 'error'>('checking');
  const [message, setMessage] = useState<string | null>(null);
  
  // Verificar o status das políticas ao carregar o componente
  useEffect(() => {
    checkPoliciesStatus();
  }, []);
  
  // Função para verificar o status das políticas
  const checkPoliciesStatus = async () => {
    try {
      const response = await fetch('/api/storage/setup-policies', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data.status);
        if (data.status === 'ready') {
          setMessage(`Storage policies for bucket '${data.bucketName}' are configured`);
        } else {
          setMessage(`Storage policies for bucket '${data.bucketName}' need to be configured`);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to check storage policies');
      }
    } catch (error) {
      console.error('Error checking storage policies:', error);
      setStatus('error');
      setMessage('An unexpected error occurred');
    }
  };
  
  // Função para configurar as políticas
  const setupPolicies = async () => {
    setIsInitializing(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/storage/setup-policies', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('ready');
        setMessage(data.message || 'Storage policies configured successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to configure storage policies');
      }
    } catch (error) {
      console.error('Error configuring storage policies:', error);
      setStatus('error');
      setMessage('An unexpected error occurred');
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Se as políticas já estiverem configuradas, não mostrar nada
  if (status === 'ready') {
    return null;
  }
  
  return (
    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-yellow-500">Storage Policies Setup</h3>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {status === 'checking' 
              ? 'Checking storage policies status...' 
              : message || 'Storage policies need to be configured before you can upload images.'}
          </p>
          {status !== 'checking' && (
            <button
              onClick={setupPolicies}
              disabled={isInitializing}
              className="px-3 py-1.5 bg-yellow-500 text-black rounded-md text-sm font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitializing ? 'Configuring...' : 'Configure Storage Policies'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
