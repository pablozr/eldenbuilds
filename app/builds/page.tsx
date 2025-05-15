import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { buildService } from "@/lib/services/build-service";
import { Suspense } from "react";
import BuildsList from "./components/builds-list";
import BuildsLoading from "./components/builds-loading";
import AdvancedFilters from "./components/advanced-filters";

export default async function BuildsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = await auth();
  const params = searchParams;

  // Get pagination parameters from URL
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const limit = typeof params.limit === 'string' ? parseInt(params.limit) : 9;

  // Get filter parameters from URL
  const buildType = typeof params.buildType === 'string' ? params.buildType : undefined;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const minLevel = typeof params.minLevel === 'string' ? parseInt(params.minLevel) : undefined;
  const maxLevel = typeof params.maxLevel === 'string' ? parseInt(params.maxLevel) : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : 'newest';
  const stats = typeof params.stats === 'string' ? params.stats.split(',') : undefined;

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
              <Link href="/builds" className="px-3 py-1.5 rounded-md transition-all duration-300 text-primary bg-primary/5 backdrop-blur-sm relative group">
                Builds
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"></span>
              </Link>
              <Link href="/builds/create" className="px-3 py-1.5 rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 backdrop-blur-sm relative group">
                Create Build
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              {userId && (
                <Link href="/profile" className="px-3 py-1.5 rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 backdrop-blur-sm relative group">
                  My Profile
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
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

        <div className="container py-12 relative z-10">
          <div className="text-center mb-12 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10"></div>
            <h1 className="text-4xl md:text-5xl font-bold font-cinzel text-primary mb-6 relative inline-block">
              <span className="relative">
                Elden Ring Builds
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              </span>
            </h1>
            <p className="text-foreground/80 max-w-2xl mx-auto text-lg">
              Discover builds created by fellow <span className="text-primary font-semibold">Tarnished</span> or share your own
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary/50 rounded-full"></div>
              <h2 className="text-2xl font-cinzel font-bold">
                {buildType ? `${buildType} Builds` :
                 search ? `Search: "${search}"` :
                 "Latest Builds"}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <form action="/builds" method="GET" className="relative flex-1">
                <input
                  type="text"
                  name="search"
                  placeholder="Search builds..."
                  defaultValue={search}
                  className="w-full px-4 py-2 rounded-md bg-card/50 border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm placeholder:text-foreground/50"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-primary transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </button>
              </form>

              <Link
                href="/builds/create"
                className="px-5 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 shadow-[0_0_10px_rgba(200,170,110,0.1)] hover:shadow-[0_0_15px_rgba(200,170,110,0.2)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Create Build
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with Filters */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="sticky top-24 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.07)] overflow-hidden">
                <div className="p-4 border-b border-primary/20 bg-primary/5">
                  <h3 className="font-cinzel font-bold text-lg text-primary flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                    </svg>
                    Filter Builds
                  </h3>
                </div>

                <div className="p-4">
                  <AdvancedFilters
                    currentBuildType={buildType}
                    currentMinLevel={minLevel}
                    currentMaxLevel={maxLevel}
                    currentSort={sort}
                  />
                </div>
              </div>
            </aside>

            {/* Main Content Grid */}
            <div className="flex-1 flex flex-col gap-8">
              <Suspense fallback={<BuildsLoading />}>
                <BuildsList
                  page={page}
                  limit={limit}
                  buildType={buildType}
                  search={search}
                  minLevel={minLevel}
                  maxLevel={maxLevel}
                  sort={sort}
                  stats={stats}
                />
              </Suspense>
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
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-foreground/70 hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-foreground/70 hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-foreground/70 hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
