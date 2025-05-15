// Script para aplicar as políticas de armazenamento do Supabase
// Execute com: node scripts/apply-storage-policies.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function main() {
  try {
    console.log('Applying Supabase storage policies...');
    
    // Verificar se as variáveis de ambiente necessárias estão definidas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL must be defined');
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined');
    }
    
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'setup-storage-policies.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('SQL file read successfully.');
    console.log('To apply these policies, follow these steps:');
    console.log('1. Log in to your Supabase dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Paste the following SQL:');
    console.log('\n-------------------------------------------\n');
    console.log(sqlContent);
    console.log('\n-------------------------------------------\n');
    console.log('5. Run the query');
    
    console.log('\nAfter running the query, you should see the policies in the Storage section of your Supabase dashboard.');
    console.log('Go to Storage > Policies to verify that the policies were created successfully.');
    
    // Verificar se o bucket existe
    console.log('\nChecking if the bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'user-uploads');
    
    if (bucketExists) {
      console.log('Bucket "user-uploads" exists.');
    } else {
      console.log('Bucket "user-uploads" does not exist. Creating...');
      
      const { error: createError } = await supabase.storage.createBucket('user-uploads', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB limit
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log('Bucket "user-uploads" created successfully.');
      }
    }
    
    console.log('\nDone!');
  } catch (error) {
    console.error('Error applying storage policies:', error);
  }
}

main();
