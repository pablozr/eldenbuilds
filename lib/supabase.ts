import { createClient } from '@supabase/supabase-js';

// Verifica se as variáveis de ambiente necessárias estão definidas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Nome do bucket compartilhado para todos os usuários
export const SHARED_BUCKET = 'user-uploads';

// Função para fazer upload de uma imagem para o Supabase Storage
export async function uploadImage(
  file: File,
  userId: string,
  type: string = 'profile'
): Promise<string | null> {
  try {
    // Gerar um caminho único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;

    // Upload do arquivo para o bucket compartilhado
    const { data, error } = await supabase.storage
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
    const { data: urlData } = supabase.storage
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
    const path = `${userId}/${type}/${filename}`;
    const { error } = await supabase.storage.from(SHARED_BUCKET).remove([path]);

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
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    // Verificar se o bucket compartilhado existe
    const bucketExists = buckets.some(bucket => bucket.name === SHARED_BUCKET);
    
    // Se o bucket não existir, criar
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(SHARED_BUCKET, {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      console.log(`Bucket '${SHARED_BUCKET}' created successfully`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureBucketExists:', error);
    return false;
  }
}

