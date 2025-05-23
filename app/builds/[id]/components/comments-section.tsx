'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { addComment, deleteComment, editComment } from '../actions/comment';
import { useServerAction } from '@/lib/hooks/useServerAction';
import { z } from 'zod';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    imageUrl: string | null;
  };
}

interface CommentsSectionProps {
  buildId: string;
  initialComments: Comment[];
}

export default function CommentsSection({ buildId, initialComments }: CommentsSectionProps) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Define schemas para validação
  const commentInputSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
    buildId: z.string(),
  });

  const commentOutputSchema = z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      imageUrl: z.string().nullable(),
    }),
  });

  // Usar o hook useServerAction para adicionar comentários
  const {
    execute: executeAddComment,
    isLoading: isAddingComment,
    error: addCommentError,
    validationErrors: addCommentValidationErrors
  } = useServerAction({
    input: commentInputSchema,
    output: commentOutputSchema,
    handler: addComment,
    onSuccess: (data) => {
      setComments([data, ...comments]);
      setNewComment('');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
    },
  });

  // Função para adicionar um comentário usando server action
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!newComment.trim()) return;

    await executeAddComment({
      content: newComment,
      buildId,
    });
  };

  // Define schemas para edição de comentários
  const editCommentInputSchema = z.object({
    commentId: z.string(),
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  });

  // Usar o hook useServerAction para editar comentários
  const {
    execute: executeEditComment,
    isLoading: isEditingComment,
    error: editCommentError,
    validationErrors: editCommentValidationErrors
  } = useServerAction({
    input: editCommentInputSchema,
    output: commentOutputSchema,
    handler: editComment,
    onSuccess: (data) => {
      setComments(
        comments.map((comment) =>
          comment.id === editingCommentId ? data : comment
        )
      );
      setEditingCommentId(null);
      setEditContent('');
    },
    onError: (error) => {
      console.error('Error updating comment:', error);
    },
  });

  // Função para editar um comentário
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    await executeEditComment({
      commentId,
      content: editContent,
    });
  };

  // Define schemas para exclusão de comentários
  const deleteCommentInputSchema = z.object({
    commentId: z.string(),
  });

  const deleteCommentOutputSchema = z.object({
    success: z.boolean(),
  });

  // Usar o hook useServerAction para excluir comentários
  const {
    execute: executeDeleteComment,
    isLoading: isDeletingComment,
    error: deleteCommentError
  } = useServerAction({
    input: deleteCommentInputSchema,
    output: deleteCommentOutputSchema,
    handler: deleteComment,
    onSuccess: (data) => {
      if (data.success) {
        setComments(comments.filter((comment) => comment.id !== commentIdToDelete));
        setCommentIdToDelete(null);
      }
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
    },
  });

  // Estado para armazenar o ID do comentário a ser excluído
  const [commentIdToDelete, setCommentIdToDelete] = useState<string | null>(null);

  // Função para excluir um comentário usando server action
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setCommentIdToDelete(commentId);
    await executeDeleteComment({ commentId });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-cinzel text-primary mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
          <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>
        </svg>
        Comments ({comments.length})
      </h2>

      {/* Formulário de comentário */}
      {isSignedIn ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex-shrink-0 overflow-hidden">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.username || 'User'}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-primary font-medium">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 min-h-[80px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isAddingComment || !newComment.trim()}
                  className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingComment ? 'Posting...' : 'Post Comment'}
                </button>
                {addCommentError && (
                  <p className="text-red-500 text-sm mt-2">{addCommentError}</p>
                )}
                {addCommentValidationErrors && addCommentValidationErrors.length > 0 && (
                  <div className="text-red-500 text-sm mt-2">
                    {addCommentValidationErrors.map((error, index) => (
                      <p key={index}>{error.message}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 border border-primary/20 bg-card/30 rounded-md text-center">
          <p className="text-foreground/80 mb-3">Sign in to leave a comment</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 border border-primary/20 bg-card/30 rounded-md">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex-shrink-0 overflow-hidden">
                  {comment.user.imageUrl ? (
                    <Image
                      src={comment.user.imageUrl}
                      alt={comment.user.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center text-primary font-medium">
                      {comment.user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{comment.user.username}</span>
                      <span className="text-xs text-foreground/60 ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {user?.id === comment.user.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-foreground/60 hover:text-primary transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-foreground/60 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 min-h-[80px]"
                        disabled={isSubmitting}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={isEditingComment || !editContent.trim()}
                          className="px-3 py-1 rounded-md bg-primary text-background hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEditingComment ? 'Saving...' : 'Save'}
                        </button>
                        {editCommentError && (
                          <p className="text-red-500 text-sm mt-2">{editCommentError}</p>
                        )}
                        {editCommentValidationErrors && editCommentValidationErrors.length > 0 && (
                          <div className="text-red-500 text-sm mt-2">
                            {editCommentValidationErrors.map((error, index) => (
                              <p key={index}>{error.message}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-foreground/80 mt-1">{comment.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-foreground/60">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}
