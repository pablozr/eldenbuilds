import Link from "next/link";
import Image from "next/image";
import { getBuilds } from "../data/get-builds";
import { Pagination } from "./pagination";
import { EmptyState } from "./empty-state";

interface BuildsListProps {
  page: number;
  limit: number;
  buildType?: string;
  search?: string;
  minLevel?: number;
  maxLevel?: number;
  sort: string;
  stats?: string[];
}

export default async function BuildsList({
  page,
  limit,
  buildType,
  search,
  minLevel,
  maxLevel,
  sort,
  stats,
}: BuildsListProps) {
  // Fetch builds using the new data fetching function
  const result = await getBuilds({
    page,
    limit,
    sort: sort as any,
    buildType,
    search,
    minLevel,
    maxLevel,
    stats,
  });

  const { builds, totalPages, currentPage, totalBuilds } = result;

  // If no builds are found, display an empty state
  if (builds.length === 0) {
    return <EmptyState />;
  }

  // Map of build types to their corresponding background images
  const buildTypeImages: Record<string, string> = {
    "Bleed": "/class-warrior.jpg",
    "Magic": "/class-astrologer.jpg",
    "Dexterity": "/class-samurai.jpg",
    "Strength": "/class-confessor.jpg",
    "Faith": "/class-prophet.jpg",
    "Frost": "/class-prisoner.jpg",
    "Arcane": "/class-bandit.jpg",
    "Hybrid": "/class-vagabond.jpg",
  };

  // Get a background image based on build type or use a default
  const getBuildImage = (type?: string) => {
    if (!type) return "/class-vagabond.jpg";
    return buildTypeImages[type] || "/class-vagabond.jpg";
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {builds.map((build) => (
          <div
            key={build.id}
            className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 shadow-[0_0_15px_rgba(200,170,110,0.07)] hover:shadow-[0_0_25px_rgba(200,170,110,0.1)] overflow-hidden group"
          >
            <div className="h-24 bg-gradient-to-br from-primary/20 to-background/50 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${getBuildImage(build.buildType)}')` }}
              ></div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
                <h2 className="text-lg font-bold font-cinzel text-primary">{build.title}</h2>
              </div>
            </div>

            <div className="p-4">
              <p className="text-foreground/80 mb-3 text-sm line-clamp-2">{build.description}</p>

              {/* Build stats */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-foreground/60">VIG</span>
                  <span className="text-sm font-medium text-primary">{build.vigor}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-foreground/60">MND</span>
                  <span className="text-sm font-medium text-primary">{build.mind}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-foreground/60">STR</span>
                  <span className="text-sm font-medium text-primary">{build.strength}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-foreground/60">DEX</span>
                  <span className="text-sm font-medium text-primary">{build.dexterity}</span>
                </div>
              </div>

              {/* Creator info */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full overflow-hidden bg-primary/10">
                  {build.user.imageUrl ? (
                    <Image
                      src={build.user.imageUrl}
                      alt={build.user.username}
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-primary text-xs">
                      {build.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-xs text-foreground/70">{build.user.username}</span>
              </div>

              {/* Likes and comments count */}
              <div className="flex items-center gap-4 mb-3 text-xs text-foreground/60">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                  </svg>
                  <span>{build._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
                  </svg>
                  <span>{build._count?.comments || 0}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Level {build.level}
                  </span>
                  {build.buildType && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {build.buildType}
                    </span>
                  )}
                </div>
                <Link
                  href={`/builds/${build.id}`}
                  className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 group/link"
                >
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 transition-transform group-hover/link:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildType={buildType}
          search={search}
          minLevel={minLevel}
          maxLevel={maxLevel}
          sort={sort}
        />
      )}
    </>
  );
}
