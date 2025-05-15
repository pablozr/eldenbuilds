'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface CustomUserButtonProps {
  afterSignOutUrl?: string;
}

export default function CustomUserButton({ afterSignOutUrl = '/' }: CustomUserButtonProps) {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch the user's profile from our database to get the latest image URL
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch('/api/users/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      console.log('Fetched user profile:', data);
      return data;
    },
    enabled: !!clerkUser,
    staleTime: 1000 * 10, // 10 seconds (reduced from 1 minute)
    refetchOnWindowFocus: true,
  });

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push(afterSignOutUrl);
  };

  // Add effect to refetch profile data when component mounts
  useEffect(() => {
    if (clerkUser) {
      // Force refetch profile data when component mounts
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  }, [clerkUser, queryClient]);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // If we're still loading the user profile or there's no user, use the default UserButton
  if (isLoading || !userProfile) {
    return (
      <UserButton
        afterSignOutUrl={afterSignOutUrl}
        appearance={{
          elements: {
            userButtonAvatarBox: "border-2 border-primary/50 hover:border-primary transition-colors",
          }
        }}
      />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary/50 hover:border-primary transition-colors overflow-hidden"
      >
        {userProfile.imageUrl ? (
          <Image
            src={userProfile.imageUrl}
            alt={userProfile.username || 'User'}
            width={40}
            height={40}
            className="w-10 h-10 object-cover"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary text-lg font-bold">
            {userProfile.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-primary/20 z-50">
          <div className="py-1">
            <a
              href="/profile"
              className="block px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary"
            >
              Profile
            </a>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
