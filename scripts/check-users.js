// Script para verificar usuários no banco de dados
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Checking users in database...');
  
  try {
    const prisma = new PrismaClient();
    
    // Busca todos os usuários
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in database:`);
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- ID: ${user.id}, ClerkID: ${user.clerkId}, Username: ${user.username}, Email: ${user.email}`);
      });
    } else {
      console.log('No users found in the database.');
    }
    
    // Desconecta do banco de dados
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
}

main();
