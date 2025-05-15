// Script para criar um usuário de teste no banco de dados
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Creating test user in database...');
  
  try {
    const prisma = new PrismaClient();
    
    // Obtém o ID do Clerk do ambiente ou usa um valor padrão
    const clerkId = process.env.CLERK_USER_ID || 'user_2YHtGYPMJMXBJJxfumdPBxxx123'; // Substitua pelo seu ID real do Clerk
    
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });
    
    if (existingUser) {
      console.log(`User already exists: ${existingUser.username} (${existingUser.email})`);
      await prisma.$disconnect();
      return;
    }
    
    // Cria um novo usuário
    const user = await prisma.user.create({
      data: {
        clerkId,
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        imageUrl: null,
      },
    });
    
    console.log(`✅ Test user created: ${user.username} (${user.email})`);
    console.log(`ID: ${user.id}, ClerkID: ${user.clerkId}`);
    
    // Desconecta do banco de dados
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating test user:', error.message);
  }
}

main();
