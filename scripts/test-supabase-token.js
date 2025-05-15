// Script para testar a geração de tokens JWT para o Supabase
// Execute com: node scripts/test-supabase-token.js

const { SignJWT } = require('jose');
require('dotenv').config();

async function main() {
  try {
    console.log('Testing Supabase JWT token generation...');

    // Simular um usuário
    const mockUser = {
      id: 'test-user-id',
      clerkId: 'clerk-user-id',
      email: 'test@example.com'
    };

    // Verificar se o JWT secret está disponível
    if (!process.env.SUPABASE_JWT_SECRET) {
      console.error("SUPABASE_JWT_SECRET is not defined in environment variables");
      console.error("Please add your Supabase JWT secret to the .env file");
      console.error("You can find it in your Supabase dashboard: Settings > API > JWT Settings > JWT Secret");
      return;
    }

    // Criar um JWT token que o Supabase pode entender
    const token = await new SignJWT({
      // Standard claims
      sub: mockUser.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration

      // Supabase specific claims
      role: "authenticated",
      aud: "authenticated",
      iss: "supabase",

      // User data
      user_id: mockUser.id,
      email: mockUser.email,

      // Custom claims for RLS policies
      clerk_id: mockUser.clerkId
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));

    console.log('JWT Token generated successfully!');
    console.log('Token:', token);
    console.log('\nTo verify this token, copy it and paste it at https://jwt.io');
    console.log('The token should contain the following claims:');
    console.log('- sub: test-user-id');
    console.log('- role: authenticated');
    console.log('- user_id: test-user-id');
    console.log('- email: test@example.com');
    console.log('- clerk_id: clerk-user-id');

    console.log('\nThis token can be used to authenticate requests to Supabase Storage.');
    console.log('Example curl command:');
    console.log(`curl -X POST \\
  "${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/user-uploads/test-user-id/test.txt" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: text/plain" \\
  --data "Test file content"`);
  } catch (error) {
    console.error('Error generating token:', error);
  }
}

main();
