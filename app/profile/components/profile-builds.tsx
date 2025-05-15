'use client';

import Link from "next/link";
import Image from "next/image";

interface Build {
  id: string;
  title: string;
  buildType: string | null;
  level: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    imageUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface ProfileBuildsProps {
  builds: Build[];
  username: string;
}

export default function ProfileBuilds({ builds, username }: ProfileBuildsProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.07)] overflow-hidden">
      <div className="p-4 border-b border-primary/20 bg-primary/5 flex justify-between items-center">
        <h3 className="font-cinzel font-bold text-lg text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Recent Builds
        </h3>
        <Link href={`/profile/${username}`} className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="p-6">
        {builds.length > 0 ? (
          <div className="space-y-4">
            {builds.map((build) => (
              <Link
                key={build.id}
                href={`/builds/${build.id}`}
                className="block p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-primary">{build.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-foreground/70">
                      <span>Level {build.level}</span>
                      {build.buildType && (
                        <>
                          <span>•</span>
                          <span>{build.buildType}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                      </svg>
                      <span>{build._count.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        ) : (
          <div className="text-center py-8 text-foreground/60">
            <p className="mb-4">You haven't created any builds yet.</p>
            <Link
              href="/builds/create"
              className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300"
            >
              Create Your First Build
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
