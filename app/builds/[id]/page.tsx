import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { buildService } from "@/lib/services/build-service";
import { notFound } from "next/navigation";

export default async function BuildDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const buildId = params.id;

  // Fetch the build from the database
  const build = await buildService.getBuildById(buildId);

  // If build not found, show 404 page
  if (!build) {
    notFound();
  }

  // Parse arrays from JSON strings if they exist, or handle as regular strings
  const parseJsonOrSplit = (value: any) => {
    if (!value) return [];

    if (typeof value === 'string') {
      // Try to parse as JSON first
      try {
        return JSON.parse(value);
      } catch (e) {
        // If not valid JSON, split by commas or return as single item array
        return value.includes(',') ? value.split(',').map(item => item.trim()) : [value];
      }
    }

    // If already an array, return as is
    if (Array.isArray(value)) {
      return value;
    }

    // Fallback to empty array
    return [];
  };

  const weapons = parseJsonOrSplit(build.weapons);
  const armor = parseJsonOrSplit(build.armor);
  const talismans = parseJsonOrSplit(build.talismans);
  const spells = parseJsonOrSplit(build.spells);

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
                      Created on {new Date(build.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {build._count && (
                        <span className="ml-2">
                          • {build._count.likes} {build._count.likes === 1 ? 'like' : 'likes'}
                          • {build._count.comments} {build._count.comments === 1 ? 'comment' : 'comments'}
                        </span>
                      )}
                    </span>
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

              {/* Equipment Section */}
              <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(200,170,110,0.07)]">
                <h2 className="text-xl font-bold font-cinzel text-primary mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Equipment
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-md p-4 bg-primary/5 border border-primary/10">
                    <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
                      Weapons
                    </h3>
                    {weapons.length > 0 ? (
                      <ul className="space-y-2">
                        {weapons.map((weapon, index) => (
                          <li key={index} className="flex items-center gap-2 text-foreground/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70"></span>
                            {weapon}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground/60 italic">No weapons specified</p>
                    )}
                  </div>

                  <div className="rounded-md p-4 bg-primary/5 border border-primary/10">
                    <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
                      </svg>
                      Armor
                    </h3>
                    {armor.length > 0 ? (
                      <ul className="space-y-2">
                        {armor.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-foreground/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground/60 italic">No armor specified</p>
                    )}
                  </div>

                  <div className="rounded-md p-4 bg-primary/5 border border-primary/10">
                    <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m4.93 4.93 4.24 4.24"/>
                        <path d="m14.83 9.17 4.24-4.24"/>
                        <path d="m14.83 14.83 4.24 4.24"/>
                        <path d="m9.17 14.83-4.24 4.24"/>
                        <circle cx="12" cy="12" r="4"/>
                      </svg>
                      Talismans
                    </h3>
                    {talismans.length > 0 ? (
                      <ul className="space-y-2">
                        {talismans.map((talisman, index) => (
                          <li key={index} className="flex items-center gap-2 text-foreground/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70"></span>
                            {talisman}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground/60 italic">No talismans specified</p>
                    )}
                  </div>

                  <div className="rounded-md p-4 bg-primary/5 border border-primary/10">
                    <h3 className="font-medium text-primary mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/>
                        <circle cx="17" cy="7" r="5"/>
                      </svg>
                      Spells
                    </h3>
                    {spells.length > 0 ? (
                      <ul className="space-y-2">
                        {spells.map((spell, index) => (
                          <li key={index} className="flex items-center gap-2 text-foreground/80">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary/70"></span>
                            {spell}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-foreground/60 italic">No spells used</p>
                    )}
                  </div>
                </div>
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
                      <div className="bg-gradient-to-r from-red-400/70 to-red-500/70 h-full rounded-full" style={{ width: `${(build.vigor / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Mind */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v12"/>
                          <path d="M8 10h8"/>
                        </svg>
                        Mind
                      </span>
                      <span className="font-bold text-primary">{build.mind}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-blue-400/70 to-blue-500/70 h-full rounded-full" style={{ width: `${(build.mind / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Endurance */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                          <line x1="16" x2="2" y1="8" y2="22"/>
                          <line x1="17.5" x2="9" y1="15" y2="15"/>
                        </svg>
                        Endurance
                      </span>
                      <span className="font-bold text-primary">{build.endurance}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-green-400/70 to-green-500/70 h-full rounded-full" style={{ width: `${(build.endurance / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Strength */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                          <path d="M18.37 2.63 14 7l-1.37-1.37a1 1 0 0 0-1.41 0L9.6 7.25a1 1 0 0 0 0 1.41L12 11a1 1 0 0 0 1.41 0l1.37-1.37L19 14l1.37-1.37a1 1 0 0 0 0-1.41L19 9.6a1 1 0 0 0-1.41 0L16.2 11l-1.83-1.83 3.37-3.37a1 1 0 0 0 0-1.41L16.2 2.8a1 1 0 0 0-1.41 0L13.6 4l-1.37-1.37a1 1 0 0 0-1.41 0L9.19 4.26a1 1 0 0 0 0 1.41L10.8 7l-1.37 1.37a1 1 0 0 0 0 1.41l1.63 1.63a1 1 0 0 0 1.41 0L13.8 10l1.37 1.37a1 1 0 0 0 1.41 0l1.63-1.63a1 1 0 0 0 0-1.41L16.8 7l1.57-1.58a1 1 0 0 0 0-1.41z"/>
                        </svg>
                        Strength
                      </span>
                      <span className="font-bold text-primary">{build.strength}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-orange-400/70 to-orange-500/70 h-full rounded-full" style={{ width: `${(build.strength / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Dexterity */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <path d="M8 13h2"/>
                          <path d="M8 17h2"/>
                          <path d="M14 13h2"/>
                          <path d="M14 17h2"/>
                        </svg>
                        Dexterity
                      </span>
                      <span className="font-bold text-primary">{build.dexterity}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-yellow-400/70 to-yellow-500/70 h-full rounded-full" style={{ width: `${(build.dexterity / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Intelligence */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                          <path d="M8 3v.5A1.5 1.5 0 0 0 9.5 5h5A1.5 1.5 0 0 0 16 3.5V3"/>
                          <path d="M2 9.5h20"/>
                          <path d="M18 11.5v.5a2 2 0 0 1-2 2h-.5"/>
                          <path d="M6 11.5v.5a2 2 0 0 0 2 2h.5"/>
                          <path d="M12 16v4"/>
                          <path d="M9 20h6"/>
                        </svg>
                        Intelligence
                      </span>
                      <span className="font-bold text-primary">{build.intelligence}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-purple-400/70 to-purple-500/70 h-full rounded-full" style={{ width: `${(build.intelligence / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Faith */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                          <path d="M12 2v8"/>
                          <path d="m4.93 10.93 1.41 1.41"/>
                          <path d="M2 18h2"/>
                          <path d="M20 18h2"/>
                          <path d="m19.07 10.93-1.41 1.41"/>
                          <path d="M22 22H2"/>
                          <path d="m8 22 4-10 4 10"/>
                          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
                        </svg>
                        Faith
                      </span>
                      <span className="font-bold text-primary">{build.faith}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-amber-400/70 to-amber-500/70 h-full rounded-full" style={{ width: `${(build.faith / 99) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Arcane */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground/90 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                          <path d="M12 9v4"/>
                          <path d="M12 17h.01"/>
                        </svg>
                        Arcane
                      </span>
                      <span className="font-bold text-primary">{build.arcane}</span>
                    </div>
                    <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                      <div className="bg-gradient-to-r from-pink-400/70 to-pink-500/70 h-full rounded-full" style={{ width: `${(build.arcane / 99) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Stat Distribution Visualization */}
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <h3 className="font-medium text-primary mb-4 text-sm uppercase tracking-wider">Stat Distribution</h3>
                  <div className="relative h-64 w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        {/* Radar Chart Background */}
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Background Hexagon Shapes */}
                          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="rgba(200,170,110,0.1)" strokeWidth="0.5" />
                          <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="rgba(200,170,110,0.1)" strokeWidth="0.5" />
                          <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="none" stroke="rgba(200,170,110,0.1)" strokeWidth="0.5" />
                          <polygon points="50,40 60,45 60,55 50,60 40,55 40,45" fill="none" stroke="rgba(200,170,110,0.1)" strokeWidth="0.5" />

                          {/* Axis Lines */}
                          <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="10" y1="30" x2="90" y2="70" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="10" y1="70" x2="90" y2="30" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="90" y2="30" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="90" y2="70" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="10" y2="30" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="10" y2="70" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />
                          <line x1="50" y1="50" x2="50" y2="90" stroke="rgba(200,170,110,0.2)" strokeWidth="0.5" />

                          {/* Stat Points */}
                          {/* Calculate positions based on stat values */}
                          {/* Vigor (top) */}
                          <circle cx="50" cy={50 - (build.vigor / 99) * 40} r="2" fill="rgba(248,113,113,0.8)" />
                          {/* Mind (top right) */}
                          <circle cx={50 + (build.mind / 99) * 40 * Math.cos(Math.PI/6)} cy={50 - (build.mind / 99) * 40 * Math.sin(Math.PI/6)} r="2" fill="rgba(96,165,250,0.8)" />
                          {/* Intelligence (right) */}
                          <circle cx={50 + (build.intelligence / 99) * 40 * Math.cos(Math.PI/2)} cy={50 - (build.intelligence / 99) * 40 * Math.sin(Math.PI/2)} r="2" fill="rgba(167,139,250,0.8)" />
                          {/* Dexterity (bottom right) */}
                          <circle cx={50 + (build.dexterity / 99) * 40 * Math.cos(5*Math.PI/6)} cy={50 - (build.dexterity / 99) * 40 * Math.sin(5*Math.PI/6)} r="2" fill="rgba(250,204,21,0.8)" />
                          {/* Arcane (bottom) */}
                          <circle cx="50" cy={50 + (build.arcane / 99) * 40} r="2" fill="rgba(244,114,182,0.8)" />
                          {/* Faith (bottom left) */}
                          <circle cx={50 - (build.faith / 99) * 40 * Math.cos(5*Math.PI/6)} cy={50 - (build.faith / 99) * 40 * Math.sin(5*Math.PI/6)} r="2" fill="rgba(251,191,36,0.8)" />
                          {/* Strength (left) */}
                          <circle cx={50 - (build.strength / 99) * 40 * Math.cos(Math.PI/2)} cy={50 - (build.strength / 99) * 40 * Math.sin(Math.PI/2)} r="2" fill="rgba(249,115,22,0.8)" />
                          {/* Endurance (top left) */}
                          <circle cx={50 - (build.endurance / 99) * 40 * Math.cos(Math.PI/6)} cy={50 - (build.endurance / 99) * 40 * Math.sin(Math.PI/6)} r="2" fill="rgba(74,222,128,0.8)" />

                          {/* Stat Area */}
                          <polygon
                            points={`
                              ${50},${50 - (build.vigor / 99) * 40}
                              ${50 + (build.mind / 99) * 40 * Math.cos(Math.PI/6)},${50 - (build.mind / 99) * 40 * Math.sin(Math.PI/6)}
                              ${50 + (build.intelligence / 99) * 40 * Math.cos(Math.PI/2)},${50 - (build.intelligence / 99) * 40 * Math.sin(Math.PI/2)}
                              ${50 + (build.dexterity / 99) * 40 * Math.cos(5*Math.PI/6)},${50 - (build.dexterity / 99) * 40 * Math.sin(5*Math.PI/6)}
                              ${50},${50 + (build.arcane / 99) * 40}
                              ${50 - (build.faith / 99) * 40 * Math.cos(5*Math.PI/6)},${50 - (build.faith / 99) * 40 * Math.sin(5*Math.PI/6)}
                              ${50 - (build.strength / 99) * 40 * Math.cos(Math.PI/2)},${50 - (build.strength / 99) * 40 * Math.sin(Math.PI/2)}
                              ${50 - (build.endurance / 99) * 40 * Math.cos(Math.PI/6)},${50 - (build.endurance / 99) * 40 * Math.sin(Math.PI/6)}
                            `}
                            fill="rgba(200,170,110,0.15)"
                            stroke="rgba(200,170,110,0.6)"
                            strokeWidth="1"
                          />
                        </svg>

                        {/* Stat Labels */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs text-red-400">VIG</div>
                        <div className="absolute top-[15%] right-[20%] text-xs text-blue-400">MND</div>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1 text-xs text-purple-400">INT</div>
                        <div className="absolute bottom-[15%] right-[20%] text-xs text-yellow-400">DEX</div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-xs text-pink-400">ARC</div>
                        <div className="absolute bottom-[15%] left-[20%] text-xs text-amber-400">FTH</div>
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 translate-x-1 text-xs text-orange-400">STR</div>
                        <div className="absolute top-[15%] left-[20%] text-xs text-green-400">END</div>
                      </div>
                    </div>
                  </div>
                </div>
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
