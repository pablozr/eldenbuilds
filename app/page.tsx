import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
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

      {/* Hero Section - Full Screen (100vh) */}
      <section className="w-full h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/pic3.jpeg"
            alt="Elden Ring Background"
            fill
            className="object-cover object-center brightness-60"
            priority
          />
          <div className="absolute inset-0 bg-background/10"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 z-1">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl font-cinzel text-primary drop-shadow-[0_0_8px_rgba(200,170,110,0.3)]">
                Share Your Builds
              </h1>
              <p className="mx-auto max-w-[700px] text-foreground/90 md:text-xl lg:text-2xl">
                Create, discover, and discuss the best character builds for Elden Ring.
                Join our community of <span className="text-primary font-semibold">Tarnished</span> warriors.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row mt-8">
              <Link
                href="/builds"
                className="inline-flex h-14 items-center justify-center rounded-md bg-primary px-10 text-base font-medium text-background shadow transition-colors hover:bg-primary/90 border border-primary/50 hover:shadow-[0_0_20px_rgba(200,170,110,0.3)]"
              >
                Browse Builds
              </Link>
              {!userId && (
                <Link
                  href="/sign-up"
                  className="inline-flex h-14 items-center justify-center rounded-md border border-primary/30 px-10 text-base font-medium shadow-sm transition-colors hover:bg-secondary/50 backdrop-blur-sm bg-background/10 hover:bg-background/20 hover:shadow-[0_0_20px_rgba(200,170,110,0.15)]"
                >
                  Become Tarnished
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-28 lg:py-36 relative overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background to-card/80"></div>
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8aa6e' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10"></div>
            <h2 className="text-4xl md:text-5xl font-bold font-cinzel text-primary mb-6 relative inline-block">
              <span className="relative">
                Forge Your Legend
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              </span>
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto text-lg">
              Join the community of <span className="text-primary font-semibold">Tarnished</span> seeking glory in the Lands Between
            </p>
          </div>

          <div className="relative">
            {/* Character Image - Left Side (as visual element) - Desktop version */}
            <div className="hidden lg:block absolute left-0 bottom-0 top-0 z-10">
              <div className="relative h-full flex items-center">
                <Image
                  src="/pic1.png"
                  alt="Elden Ring Character"
                  width={1200}
                  height={1800}
                  className="h-auto w-auto max-h-[1350px]"
                  style={{
                    minWidth: '950px',
                    marginLeft: '-400px'
                  }}
                  priority
                />
              </div>
            </div>

            {/* Character Image - Mobile version (above cards) */}
            <div className="w-full flex justify-center mb-8 lg:hidden">
              <div className="relative" style={{ maxWidth: '70%' }}>
                <Image
                  src="/pic1.png"
                  alt="Elden Ring Character"
                  width={600}
                  height={900}
                  className="h-auto w-auto object-contain"
                  priority
                />
              </div>
            </div>

            {/* Cards - Main focus */}
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 lg:ml-[200px]">
              <div className="grid gap-6 p-8 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 shadow-[0_0_15px_rgba(200,170,110,0.07)] hover:shadow-[0_0_25px_rgba(200,170,110,0.1)] elden-border">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30 shadow-[0_0_10px_rgba(200,170,110,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7 text-primary"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold font-cinzel text-primary">Create Builds</h3>
                </div>
                <p className="text-foreground/80">
                  Share your character builds with detailed stats, equipment, and strategies to conquer the Lands Between.
                </p>
                <div className="pt-2">
                  <Link href="/builds/create" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 group">
                    Create Now
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 p-8 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 shadow-[0_0_15px_rgba(200,170,110,0.07)] hover:shadow-[0_0_25px_rgba(200,170,110,0.1)] elden-border">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30 shadow-[0_0_10px_rgba(200,170,110,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7 text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m16 12-4 4-4-4" />
                      <path d="M12 8v8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold font-cinzel text-primary">Discover Builds</h3>
                </div>
                <p className="text-foreground/80">
                  Find new and powerful character builds created by fellow Tarnished to overcome the challenges ahead.
                </p>
                <div className="pt-2">
                  <Link href="/builds" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 group">
                    Browse Builds
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 p-8 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 shadow-[0_0_15px_rgba(200,170,110,0.07)] hover:shadow-[0_0_25px_rgba(200,170,110,0.1)] elden-border">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30 shadow-[0_0_10px_rgba(200,170,110,0.2)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7 text-primary"
                    >
                      <path d="M17 14V2" />
                      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold font-cinzel text-primary">Discuss & Rate</h3>
                </div>
                <p className="text-foreground/80">
                  Comment on builds, rate them, and engage with the Elden Ring community of fellow warriors.
                </p>
                <div className="pt-2">
                  <Link href="/builds" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 group">
                    Join Discussions
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



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
