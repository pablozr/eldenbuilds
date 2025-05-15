'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateSupabaseToken } from '../actions/supabase-token';
import { createClient } from '@supabase/supabase-js';

interface SupabaseContextType {
  supabaseClient: ReturnType<typeof createClient> | null;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabaseClient: null,
  isLoading: true,
  error: null,
  refreshToken: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export default function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createClient> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeSupabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar se as variáveis de ambiente estão definidas
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      }

      // Gerar um token JWT para autenticação com o Supabase
      const { token } = await generateSupabaseToken();

      // Criar um cliente Supabase autenticado
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
          auth: {
            persistSession: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      setSupabaseClient(client);
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize Supabase client');
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar o cliente Supabase quando o componente for montado
  useEffect(() => {
    initializeSupabase();

    // Configurar um intervalo para renovar o token a cada 25 minutos
    // (o token expira em 30 minutos)
    const intervalId = setInterval(() => {
      initializeSupabase();
    }, 25 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Função para renovar o token manualmente
  const refreshToken = async () => {
    await initializeSupabase();
  };

  return (
    <SupabaseContext.Provider value={{ supabaseClient, isLoading, error, refreshToken }}>
      {children}
    </SupabaseContext.Provider>
  );
}
