import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { profileService } from "@/lib/services/profile-service";
import ProfileHeader from "./components/profile-header";
import ProfileStats from "@/app/profile/components/profile-stats";
import ProfileBuilds from "@/app/profile/components/profile-builds";
import ProfileSettings from "./components/profile-settings";

export default async function ProfilePage() {
  const { userId } = await auth();

  // Redirecionar para a página de login se o usuário não estiver autenticado
  if (!userId) {
    redirect("/sign-in");
  }

  // Buscar o usuário no banco de dados
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">User Not Found</h1>
          <p className="text-foreground/70 mb-6">
            We couldn't find your user profile. Please try signing in again.
          </p>
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Buscar o perfil completo do usuário (incluindo bannerUrl)
  const userProfile = await profileService.getUserProfile(user.id);

  // Combinar os dados do usuário com os dados do perfil
  const userWithProfile = {
    ...user,
    bannerUrl: userProfile?.bannerUrl || null,
    bio: userProfile?.bio || null,
    favoriteClass: userProfile?.favoriteClass || null,
    favoriteWeapon: userProfile?.favoriteWeapon || null,
  };

  // Buscar estatísticas do usuário
  const buildCount = await prisma.build.count({
    where: { userId: user.id },
  });

  const publishedBuildCount = await prisma.build.count({
    where: {
      userId: user.id,
      isPublished: true,
    },
  });

  const likesReceived = await prisma.like.count({
    where: {
      build: {
        userId: user.id,
      },
    },
  });

  const commentsReceived = await prisma.comment.count({
    where: {
      build: {
        userId: user.id,
      },
    },
  });

  // Buscar build mais popular
  const mostPopularBuild = await prisma.build.findFirst({
    where: {
      userId: user.id,
      isPublished: true,
    },
    orderBy: {
      likes: {
        _count: 'desc',
      },
    },
    include: {
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  // Buscar as builds do usuário (apenas as 3 mais recentes)
  const recentBuilds = await prisma.build.findMany({
    where: {
      userId: user.id,
      isPublished: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          imageUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    take: 3,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Glassmorphism effect */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/50 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                <Image
                  src="/pic2.webp"
                  alt="Elden Ring Icon"
                  width={40}
                  height={40}
                  className="h-10 w-10 relative z-10 transition-transform duration-500 group-hover:scale-105 object-contain rounded-full"
                />
              </div>
              <span className="font-cinzel font-bold text-primary text-xl relative">
                Elden Ring Builds
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/builds" className="px-3 py-1.5 rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 backdrop-blur-sm relative group">
                Builds
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/builds/create" className="px-3 py-1.5 rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 backdrop-blur-sm relative group">
                Create Build
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background to-card/80"></div>
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8aa6e' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container py-12 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <ProfileHeader
              user={userWithProfile}
            />


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Stats */}
                <ProfileStats
                  buildCount={buildCount}
                  publishedBuildCount={publishedBuildCount}
                  likesReceived={likesReceived}
                  commentsReceived={commentsReceived}
                  mostPopularBuild={mostPopularBuild ? {
                    id: mostPopularBuild.id,
                    title: mostPopularBuild.title,
                    likeCount: mostPopularBuild._count.likes,
                  } : null}
                />

                {/* Recent Builds */}
                <ProfileBuilds
                  builds={recentBuilds.map(build => ({
                    ...build,
                    createdAt: build.createdAt ? build.createdAt.toISOString() : '',
                  }))}
                  username={user.username}
                />
              </div>

              {/* Profile Settings */}
              <div className="lg:col-span-1">
                <ProfileSettings
                  user={userWithProfile}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-primary/20 py-8 md:py-6 bg-card/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/pic2.webp"
              alt="Elden Ring Icon"
              width={28}
              height={28}
              className="h-7 w-7 object-contain rounded-full"
            />
            <p className="text-center text-sm leading-loose text-foreground/70 md:text-left">
              © {new Date().getFullYear()} Elden Ring Builds. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}



