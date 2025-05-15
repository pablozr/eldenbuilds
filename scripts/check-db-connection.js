// Este script verifica a conexão com o banco de dados
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Checking database connection...');
  
  try {
    const prisma = new PrismaClient();
    
    // Tenta conectar ao banco de dados
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Verifica se as tabelas existem
    console.log('Checking database tables...');
    
    try {
      // Tenta contar os usuários
      const userCount = await prisma.user.count();
      console.log(`✅ User table exists with ${userCount} records`);
    } catch (error) {
      console.error('❌ Error accessing User table:', error.message);
    }
    
    try {
      // Tenta contar as builds
      const buildCount = await prisma.build.count();
      console.log(`✅ Build table exists with ${buildCount} records`);
    } catch (error) {
      console.error('❌ Error accessing Build table:', error.message);
    }
    
    // Desconecta do banco de dados
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\nPossible solutions:');
      console.log('1. Make sure your database server is running');
      console.log('2. Check if the DATABASE_URL in your .env file is correct');
      console.log('3. Try running: docker-compose up -d');
    }
  }
}

main();
