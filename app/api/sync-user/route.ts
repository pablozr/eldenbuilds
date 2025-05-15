import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Obtém o usuário atual do Clerk
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    // Obtém o email principal
    const primaryEmail = user.emailAddresses?.[0]?.emailAddress;
    if (!primaryEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }
    
    // Obtém o nome completo
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    
    // Obtém o nome de usuário (ou usa parte do email se não existir)
    const username = user.username || primaryEmail.split('@')[0];
    
    try {
      // Verifica se o usuário já existe no banco de dados
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
      });
      
      if (existingUser) {
        // Atualiza o usuário existente
        await prisma.user.update({
          where: { clerkId: user.id },
          data: {
            email: primaryEmail,
            username,
            name: fullName || null,
            imageUrl: user.imageUrl || null,
          },
        });
      } else {
        // Cria um novo usuário
        await prisma.user.create({
          data: {
            clerkId: user.id,
            email: primaryEmail,
            username,
            name: fullName || null,
            imageUrl: user.imageUrl || null,
          },
        });
      }
      
      // Redireciona para a página original ou para a home
      const redirectTo = req.nextUrl.searchParams.get('redirect') || '/';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    } catch (error) {
      console.error('Error syncing user:', error);
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in sync-user route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
