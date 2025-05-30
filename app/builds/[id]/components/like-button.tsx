'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toggleLike, checkLikeStatus } from '../actions/like';
import { useServerAction } from '@/lib/hooks/useServerAction';
import { z } from 'zod';

interface LikeButtonProps {
  buildId: string;
  initialLikeCount: number;
  initialLiked?: boolean;
}

export default function LikeButton({ buildId, initialLikeCount, initialLiked = false }: LikeButtonProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // Define schemas para validação
  const buildIdSchema = z.object({
    buildId: z.string(),
  });

  const likeResponseSchema = z.object({
    liked: z.boolean(),
  });

  // Usar o hook useServerAction para verificar o status do like
  const {
    execute: executeCheckLikeStatus,
  } = useServerAction({
    input: buildIdSchema,
    output: likeResponseSchema,
    handler: checkLikeStatus,
    onSuccess: (data) => {
      setLiked(data.liked);
    },
    onError: (error) => {
      console.error('Error checking like status:', error);
    },
  });

  // Usar o hook useServerAction para alternar o like
  const {
    execute: executeToggleLike,
    isLoading: isTogglingLike,
    error: toggleLikeError
  } = useServerAction({
    input: buildIdSchema,
    output: likeResponseSchema,
    handler: toggleLike,
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
    },
  });

  // Verifica se o usuário já curtiu a build usando o server action
  useEffect(() => {
    if (!isSignedIn) return;
    executeCheckLikeStatus({ buildId });
  }, [buildId, isSignedIn, executeCheckLikeStatus]);

  // Função para alternar o like usando o server action
  const handleToggleLike = async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    await executeToggleLike({ buildId });
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isTogglingLike}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
        liked
          ? 'bg-primary/20 text-primary border border-primary/30'
          : 'bg-background/50 text-foreground/70 border border-primary/10 hover:bg-primary/10 hover:text-primary'
      } disabled:opacity-50`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={liked ? 'text-primary' : 'text-foreground/70'}
      >
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}
