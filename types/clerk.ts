/**
 * Tipo para representar um endereço de email do Clerk
 */
export interface ClerkEmailAddress {
  emailAddress: string;
  id: string;
  verification?: {
    status: string;
    strategy: string;
  };
}

/**
 * Tipo para representar um usuário do Clerk
 */
export interface ClerkUser {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: ClerkEmailAddress[];
  imageUrl?: string | null;
}
