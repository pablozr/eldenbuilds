import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { buildService } from "@/lib/services/build-service";
import { notFound } from "next/navigation";
import CommentsSection from "./components/comments-section";
import LikeButton from "./components/like-button";
import { getLikeStatus, getLikeCount } from "./data/get-like-status";
import { getComments } from "./data/get-comments";

export default async function BuildDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const buildId = params?.id;

  // Fetch the build from the database
  const build = await buildService.getBuildById(buildId);

  // If build not found, show 404 page
  if (!build) {
    notFound();
  }

  // Fetch like status and count using the new data fetching functions
  const { liked } = await getLikeStatus(buildId);
  const { count: likeCount } = await getLikeCount(buildId);

  // Fetch comments using the new data fetching function
  const comments = await getComments(buildId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Glassmorphism effect */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/50 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                <Image
                  src="/pic2.webp"
                  alt="Elden Ring Icon"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="font-bold text-foreground group-hover:text-primary transition-colors duration-300 relative">
                Elden Ring Builds
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/builds" className="px-3 py-1.5 rounded-md transition-all duration-300 text-primary bg-primary/5 backdrop-blur-sm relative group">
                Builds
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"></span>
              </Link>
              <Link href="/builds/create" className="px-3 py-1.5 rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 backdrop-blur-sm relative group">
                Create Build
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center gap-3">
              {userId ? (
                <UserButton
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }
                  }}
                />
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 shadow-[0_0_10px_rgba(200,170,110,0.1)] hover:shadow-[0_0_15px_rgba(200,170,110,0.2)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 rounded-md border border-primary/30 hover:bg-secondary/50 font-medium transition-all duration-300 backdrop-blur-sm bg-background/30 hover:bg-background/50 shadow-[0_0_10px_rgba(200,170,110,0.05)] hover:shadow-[0_0_15px_rgba(200,170,110,0.15)]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
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

        <div className="container py-10 relative z-10">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/builds"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors group w-fit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:-translate-x-1 transition-transform"
              >
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="font-medium">Back to Builds</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Build Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(200,170,110,0.07)]">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">
                          {build.buildType === 'Bleed' && '🩸'}
                          {build.buildType === 'Magic' && '✨'}
                          {build.buildType === 'Dexterity' && '🗡️'}
                          {build.buildType === 'Strength' && '🔨'}
                          {build.buildType === 'Faith' && '🌟'}
                          {build.buildType === 'Frost' && '❄️'}
                          {build.buildType === 'Arcane' && '🔮'}
                          {build.buildType === 'Hybrid' && '⚔️'}
                          {!build.buildType && '⚔️'}
                        </span>
                      </div>
                      <span className="text-sm text-primary/80 font-medium">{build.buildType || 'Custom'} Build</span>
                    </div>
                    <h1 className="text-3xl font-bold font-cinzel text-primary">{build.title}</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Level {build.level}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center overflow-hidden">
                    {build.user.imageUrl ? (
                      <Image
                        src={build.user.imageUrl}
                        alt={build.user.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover"
                      />
                    ) : (
                      <span className="text-primary font-medium">{build.user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{build.user.username}</span>
                    <span className="text-xs text-foreground/60">
                      Created on {build.createdAt ? new Date(build.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown date'}
                      {build._count && (
                        <span className="ml-2">
                          • {build._count.comments} {build._count.comments === 1 ? 'comment' : 'comments'}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    {/* Usando o novo componente LikeButton com os dados do servidor */}
                    <LikeButton
                      buildId={buildId}
                      initialLikeCount={likeCount}
                      initialLiked={liked}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold font-cinzel text-primary mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
                      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
                      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
                    </svg>
                    Description
                  </h2>
                  <p className="text-foreground/80 leading-relaxed">{build.description}</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-8">
                <CommentsSection
                  buildId={buildId}
                  initialComments={comments}
                />
              </div>
            </div>

            {/* Stats Column */}
            <div className="space-y-8">
              <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(200,170,110,0.07)] sticky top-24">
                <h2 className="text-xl font-bold font-cinzel text-primary mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Character Stats
                </h2>

                <div className="space-y-4">
                  {/* Vigor */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                        </svg>
                        Vigor
                      </span>
                      <span className="font-bold text-primary">{build.vigor}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div
                        className="bg-red-400 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (build.vigor / 99) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
