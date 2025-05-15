'use client';

import Link from "next/link";

interface ProfileStatsProps {
  buildCount: number;
  publishedBuildCount: number;
  likesReceived: number;
  commentsReceived: number;
  mostPopularBuild: {
    id: string;
    title: string;
    likeCount: number;
  } | null;
}

export default function ProfileStats({
  buildCount,
  publishedBuildCount,
  likesReceived,
  commentsReceived,
  mostPopularBuild,
}: ProfileStatsProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.07)] overflow-hidden">
      <div className="p-4 border-b border-primary/20 bg-primary/5">
        <h3 className="font-cinzel font-bold text-lg text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 20V10"/>
            <path d="M18 20V4"/>
            <path d="M6 20v-4"/>
          </svg>
          Your Stats
        </h3>
      </div>
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-3xl font-bold text-primary">{buildCount}</div>
            <div className="text-sm text-foreground/70">Total Builds</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-3xl font-bold text-primary">{publishedBuildCount}</div>
            <div className="text-sm text-foreground/70">Published Builds</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-3xl font-bold text-primary">{likesReceived}</div>
            <div className="text-sm text-foreground/70">Likes Received</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-3xl font-bold text-primary">{commentsReceived}</div>
            <div className="text-sm text-foreground/70">Comments Received</div>
          </div>
        </div>
        
        {/* Most Popular Build */}
        {mostPopularBuild ? (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-semibold text-foreground/90 mb-2">Most Popular Build</h4>
            <div className="flex justify-between items-center">
              <Link href={`/builds/${mostPopularBuild.id}`} className="text-primary hover:underline font-medium">
                {mostPopularBuild.title}
              </Link>
              <div className="flex items-center gap-1 text-foreground/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                </svg>
                <span>{mostPopularBuild.likeCount}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center text-foreground/70">
            <p>You haven't published any builds yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
