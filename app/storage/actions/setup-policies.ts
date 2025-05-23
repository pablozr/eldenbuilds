'use server';

import { auth } from "@clerk/nextjs/server";
import { supabase, SHARED_BUCKET, getAuthenticatedClient } from "@/lib/supabase";

/**
 * Configura políticas RLS para o bucket de armazenamento
 * @returns Objeto com informações sobre o status da configuração
 */
export async function setupStoragePolicies() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Obter um cliente autenticado
    const client = await getAuthenticatedClient();

    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new Error("Failed to list buckets");
    }
    
    // Verificar se o bucket compartilhado existe
    const bucketExists = buckets.some(bucket => bucket.name === SHARED_BUCKET);
    
    if (!bucketExists) {
      // Criar o bucket se não existir
      const { error: createError } = await client.storage.createBucket(SHARED_BUCKET, {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw new Error("Failed to create bucket");
      }
    }

    // Configurar políticas RLS para o bucket
    
    // 1. Política para permitir leitura pública
    const { error: readError } = await client.storage.from(SHARED_BUCKET).createPolicy(
      'Public Read Policy',
      {
        definition: {
          name: 'Public Read Policy',
          allow_access: true,
          match_type: 'prefix',
          prefix_match: '',
          operations: ['select'],
        },
      }
    );
    
    if (readError) {
      console.error('Error creating read policy:', readError);
      // Continuar mesmo com erro, pois a política pode já existir
    }
    
    // 2. Política para permitir que usuários autenticados façam upload em suas próprias pastas
    const { error: writeError } = await client.storage.from(SHARED_BUCKET).createPolicy(
      'Authenticated User Write Policy',
      {
        definition: {
          name: 'Authenticated User Write Policy',
          allow_access: true,
          match_type: 'prefix_exact_match',
          prefix_match: '${auth.uid}/',
          operations: ['insert', 'update', 'delete'],
        },
      }
    );
    
    if (writeError) {
      console.error('Error creating write policy:', writeError);
      // Continuar mesmo com erro, pois a política pode já existir
    }

    return {
      success: true,
      message: "Storage bucket policies configured successfully",
    };
  } catch (error) {
    console.error("Error configuring storage policies:", error);
    throw error;
  }
}

/**
 * Verifica o status das políticas do bucket
 * @returns Objeto com informações sobre o status das políticas
 */
export async function checkPoliciesStatus() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Obter um cliente autenticado
    const client = await getAuthenticatedClient();

    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      throw new Error("Failed to list buckets");
    }
    
    // Verificar se o bucket compartilhado existe
    const bucketExists = buckets.some(bucket => bucket.name === SHARED_BUCKET);
    
    if (!bucketExists) {
      return {
        success: false,
        message: `Bucket '${SHARED_BUCKET}' does not exist`,
        status: "not_initialized",
      };
    }

    // Verificar as políticas existentes
    const { data: policies, error: policiesError } = await client.storage.from(SHARED_BUCKET).getPolicies();
    
    if (policiesError) {
      console.error('Error getting policies:', policiesError);
      throw new Error("Failed to get bucket policies");
    }

    return {
      success: true,
      bucketName: SHARED_BUCKET,
      status: "ready",
      policies: policies || [],
    };
  } catch (error) {
    console.error("Error checking policies status:", error);
    throw error;
  }
}
