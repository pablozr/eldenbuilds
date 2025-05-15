import { prisma } from '@/lib/prisma';
import { ClerkUser } from '@/types/clerk';

/**
 * Serviço para gerenciar autenticação e sincronização de usuários
 */
export const authService = {
  /**
   * Sincroniza um usuário do Clerk com o banco de dados
   * Se o usuário não existir, cria um novo
   * Se o usuário existir, atualiza os dados
   */
  async syncUser(clerkUser: ClerkUser) {
    if (!clerkUser.id) {
      throw new Error('User ID is required');
    }

    try {
      // Verifica se o usuário já existe no banco de dados
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id },
      });

      // Obtém o email principal
      const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!primaryEmail) {
        throw new Error('User email is required');
      }

      // Obtém o nome completo
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ');

      // Obtém o nome de usuário (ou usa parte do email se não existir)
      const username = clerkUser.username || primaryEmail.split('@')[0];

      if (existingUser) {
        // Atualiza o usuário existente
        return await prisma.user.update({
          where: { clerkId: clerkUser.id },
          data: {
            email: primaryEmail,
            username,
            name: fullName || null,
            imageUrl: clerkUser.imageUrl || null,
          },
        });
      } else {
        // Cria um novo usuário
        return await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            username,
            name: fullName || null,
            imageUrl: clerkUser.imageUrl || null,
          },
        });
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  },
};
