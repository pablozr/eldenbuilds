import { createClient } from '@supabase/supabase-js';
import { getUserUUID } from '@/lib/utils/uuid';

// Verifica se as variáveis de ambiente necessárias estão definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
}

// Cria e exporta o cliente Supabase com a chave anônima
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Função para obter um cliente Supabase autenticado com JWT
export async function getAuthenticatedClient() {
  try {
    // Detectar se estamos no servidor ou no cliente
    const isServer = typeof window === 'undefined';

    let token;

    if (isServer) {
      // No servidor, não podemos usar fetch com URLs relativas
      // Em vez disso, usamos diretamente o auth do Clerk para obter o usuário
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = await auth();

      if (!userId) {
        console.error('No authenticated user found');
        return supabase;
      }

      // Importar o prisma para buscar o usuário no banco de dados
      const { prisma } = await import('@/lib/prisma');

      // Buscar o usuário no banco de dados
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        console.error('User not found in database');
        return supabase;
      }

      // Verificar se o JWT secret está disponível
      if (!process.env.SUPABASE_JWT_SECRET) {
        console.error("SUPABASE_JWT_SECRET is not defined in environment variables");
        return supabase;
      }

      // Importar o módulo jose para criar o JWT
      const { SignJWT } = await import('jose');

      // Generate a UUID for the user based on their Clerk ID
      const userUUID = getUserUUID(userId);

      // Criar um JWT token que o Supabase pode entender com segurança aprimorada
      token = await new SignJWT({
        // Standard claims
        sub: userUUID, // Use a valid UUID as the subject
        exp: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutos de expiração (reduzido de 1 hora)
        nbf: Math.floor(Date.now() / 1000), // Não válido antes do tempo atual
        iat: Math.floor(Date.now() / 1000), // Emitido no tempo atual
        jti: `${userUUID}-${Date.now()}`, // ID único do token para prevenir ataques de replay

        // Supabase specific claims
        role: "authenticated",
        aud: "authenticated",
        iss: "supabase",

        // User data
        user_id: userUUID, // Use the same UUID here
        email: user.email,

        // Custom claims for reference
        clerk_id: userId,
        db_user_id: user.id
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime('30m') // 30 minutos de expiração
        .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));
    } else {
      // No cliente, podemos usar fetch normalmente
      const response = await fetch('/api/auth/supabase-token');

      if (!response.ok) {
        console.error('Failed to get Supabase token:', await response.text());
        return supabase; // Retorna o cliente não autenticado em caso de erro
      }

      const data = await response.json();
      token = data.token;
    }

    if (!token) {
      console.error('Failed to get token');
      return supabase;
    }

    // Cria um novo cliente com o token JWT
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
  } catch (error) {
    console.error('Error getting authenticated Supabase client:', error);
    return supabase; // Retorna o cliente não autenticado em caso de erro
  }
}

// Nome do bucket compartilhado para todos os usuários
export const SHARED_BUCKET = 'user-uploads';

// Função para fazer upload de uma imagem para o Supabase Storage
export async function uploadImage(
  file: File,
  userId: string,
  type: string = 'profile'
): Promise<string | null> {
  try {
    // Obter um cliente autenticado para o upload
    const client = await getAuthenticatedClient();

    // Gerar um caminho único para o arquivo
    const fileExt = file.name.split('.').pop();

    // Gerar um UUID para o usuário baseado no ID do Clerk
    // Isso garante que o caminho corresponda às políticas RLS do Supabase
    const userUUID = getUserUUID(userId);
    const fileName = `${userUUID}/${type}/${Date.now()}.${fileExt}`;

    // Upload do arquivo para o bucket compartilhado usando o cliente autenticado
    const { data, error } = await client.storage
      .from(SHARED_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Substituir arquivo existente
      });

    if (error) {
      console.error('Error uploading image:', error);

      // Verificar se o erro é devido a permissões
      if (error.message && error.message.includes('permission')) {
        console.error('Permission error. Make sure the bucket has appropriate RLS policies.');
      } else if (error.message && error.message.includes('not found')) {
        console.error(`Bucket '${SHARED_BUCKET}' not found. Please create it in the Supabase dashboard.`);
      }

      return null;
    }

    // Retorna a URL pública da imagem
    const { data: urlData } = client.storage
      .from(SHARED_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

// Função para excluir uma imagem do Supabase Storage
export async function deleteImage(
  userId: string,
  type: string,
  filename: string
): Promise<boolean> {
  try {
    // Gerar um UUID para o usuário baseado no ID do Clerk
    const userUUID = getUserUUID(userId);
    const path = `${userUUID}/${type}/${filename}`;

    // Obter um cliente autenticado para a exclusão
    const client = await getAuthenticatedClient();

    const { error } = await client.storage.from(SHARED_BUCKET).remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
}

// Função para obter a URL pública de uma imagem
export function getImageUrl(path: string): string {
  const { data } = supabase.storage.from(SHARED_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Função para verificar se um bucket existe e criá-lo se necessário
export async function ensureBucketExists(): Promise<boolean> {
  try {
    // Obter um cliente autenticado
    const client = await getAuthenticatedClient();

    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await client.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    // Verificar se o bucket compartilhado existe
    const bucketExists = buckets.some(bucket => bucket.name === SHARED_BUCKET);

    // Se o bucket não existir, criar
    if (!bucketExists) {
      const { error: createError } = await client.storage.createBucket(SHARED_BUCKET, {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }

      console.log(`Bucket '${SHARED_BUCKET}' created successfully`);

      // Configurar as políticas RLS para o bucket
      await setupBucketPolicies(client);
    }

    return true;
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    return false;
  }
}

// Função para configurar as políticas RLS do bucket
async function setupBucketPolicies(client: any) {
  try {
    // Política para permitir leitura pública
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
    }

    // Política para permitir que usuários autenticados façam upload em suas próprias pastas
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
    }

    console.log('Bucket policies configured successfully');
  } catch (error) {
    console.error('Error setting up bucket policies:', error);
  }
}

