import Link from 'next/link';
import Image from 'next/image';
import { getBuilds } from '@/app/builds/data/get-builds';

interface UserBuildsGridProps {
  username: string;
  page: number;
  limit: number;
  sort: string;
}

export default async function UserBuildsGrid({ username, page, limit, sort }: UserBuildsGridProps) {
  // Fetch builds using the new data fetching function
  const { builds, totalPages, currentPage, totalBuilds } = await getBuilds({
    username,
    page,
    limit,
    sort: sort as any,
  });

  // If no builds are found, display an empty state
  if (builds.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-primary mb-2">No Builds Found</h3>
          <p className="text-foreground/70 mb-6">
            {username} hasn't published any builds yet.
          </p>
        </div>
      </div>
    );
  }

  // Calculate pagination info
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div>
      {/* Builds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {builds.map((build) => (
          <Link
            key={build.id}
            href={`/builds/${build.id}`}
            className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.07)] overflow-hidden hover:shadow-[0_0_20px_rgba(200,170,110,0.1)] transition-all duration-300 hover:border-primary/30 group"
          >
            <div className="h-32 bg-gradient-to-br from-primary/20 to-background/30 relative">
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
                Level {build.level}
              </div>
              {build.buildType && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary/10 backdrop-blur-sm text-xs font-medium border border-primary/20">
                  {build.buildType}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-primary group-hover:text-primary/80 transition-colors mb-2 line-clamp-1">
                {build.title}
              </h3>
              
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
              <div className="flex items-center gap-4 text-xs text-foreground/60">
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
                  <span>{build._count.likes}</span>
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
                  <span>{build._count.comments}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${username}?page=${currentPage - 1}&limit=${limit}&sort=${sort}`}
              className={`w-10 h-10 rounded-md border border-primary/20 flex items-center justify-center ${
                !hasPrevPage ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-primary/10'
              }`}
              aria-disabled={!hasPrevPage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Link>
            
            <div className="px-4 py-2 rounded-md bg-primary/10 border border-primary/20">
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <Link
              href={`/profile/${username}?page=${currentPage + 1}&limit=${limit}&sort=${sort}`}
              className={`w-10 h-10 rounded-md border border-primary/20 flex items-center justify-center ${
                !hasNextPage ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-primary/10'
              }`}
              aria-disabled={!hasNextPage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
