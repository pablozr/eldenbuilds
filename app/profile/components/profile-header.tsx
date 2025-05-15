'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

interface ProfileHeaderProps {
  user: {
    id: string;
    username: string;
    name?: string | null;
    imageUrl?: string | null;
    bannerUrl?: string | null;
    bio?: string | null;
    favoriteClass?: string | null;
    favoriteWeapon?: string | null;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  // Usar estado local para o banner para forçar a atualização
  const [bannerUrl, setBannerUrl] = useState<string | null>(user.bannerUrl || null);

  // Atualizar o estado quando as props mudarem
  useEffect(() => {
    if (user.bannerUrl !== bannerUrl) {
      setBannerUrl(user.bannerUrl || null);
    }
  }, [user.bannerUrl, bannerUrl]);

  return (
    <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.07)] overflow-hidden">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${user.username}'s banner`}
            fill
            className="object-cover"
            key={`banner-${bannerUrl}`} // Adicionar key para forçar a recriação do componente
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/profile-banner.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 pt-0 -mt-12 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-card/80 bg-card overflow-hidden shadow-lg">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.username}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                key={`avatar-${user.imageUrl}`} // Adicionar key para forçar a recriação do componente
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-cinzel text-primary">
              {user.name || user.username}
            </h1>
            <p className="text-foreground/70 text-sm">
              @{user.username}
            </p>
          </div>

          {/* User Button */}
          <div className="hidden sm:block">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "border-2 border-primary/50 hover:border-primary transition-colors",
                }
              }}
            />
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mt-6 text-foreground/80">
            <p>{user.bio}</p>
          </div>
        )}

        {/* Favorite Class & Weapon */}
        {(user.favoriteClass || user.favoriteWeapon) && (
          <div className="mt-4 flex flex-wrap gap-4">
            {user.favoriteClass && (
              <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm flex items-center gap-2">
                <span className="text-primary">Favorite Class:</span>
                <span>{user.favoriteClass}</span>
              </div>
            )}
            {user.favoriteWeapon && (
              <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm flex items-center gap-2">
                <span className="text-primary">Favorite Weapon:</span>
                <span>{user.favoriteWeapon}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
