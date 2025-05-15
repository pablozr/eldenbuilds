'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { useUser } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

// Schema de validação para o formulário de perfil
const profileFormSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  favoriteClass: z.string().max(50, "Class name must be 50 characters or less").optional(),
  favoriteWeapon: z.string().max(50, "Weapon name must be 50 characters or less").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSettingsProps {
  user: {
    id: string;
    username: string;
    imageUrl?: string | null;
    bannerUrl?: string | null;
    bio?: string | null;
    favoriteClass?: string | null;
    favoriteWeapon?: string | null;
  };
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useUser();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    username: user.username,
    bio: user.bio || '',
    favoriteClass: user.favoriteClass || '',
    favoriteWeapon: user.favoriteWeapon || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user.imageUrl || null);
  const [bannerImage, setBannerImage] = useState<string | null>(user.bannerUrl || null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [usernameChanged, setUsernameChanged] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Classes do Elden Ring
  const classes = [
    "Astrologer", "Bandit", "Confessor", "Hero", "Prisoner",
    "Prophet", "Samurai", "Vagabond", "Warrior", "Wretch"
  ];

  // Armas populares do Elden Ring
  const weapons = [
    "Uchigatana", "Moonveil", "Rivers of Blood", "Bloodhound's Fang",
    "Sword of Night and Flame", "Dark Moon Greatsword", "Blasphemous Blade",
    "Wing of Astel", "Hand of Malenia", "Starscourge Greatsword"
  ];

  const checkUsernameAvailability = async (username: string) => {
    if (username === user.username) {
      setUsernameAvailable(true);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      setUsernameAvailable(data.available);

      if (!data.available) {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already taken"
        }));
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMessage(null);

    // If username is changed, check availability after a delay
    if (name === 'username' && value !== user.username) {
      setUsernameChanged(true);

      // Clear any existing timeout
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }

      // Set a new timeout to check username availability
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    }
  };

  const handleProfileImageClick = () => {
    profileInputRef.current?.click();
  };

  const handleBannerImageClick = () => {
    bannerInputRef.current?.click();
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'banner') => {
    if (!file) return;

    setIsUploading(true);
    setSuccessMessage(null);

    try {
      // Verificar o tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size exceeds 2MB limit');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // 1. Upload the image to Supabase storage
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.url;

      if (type === 'profile') {
        setProfileImage(imageUrl);

        // 2. Also update the Clerk user profile image directly
        if (isClerkUserLoaded && clerkUser) {
          try {
            // First, fetch the image as a blob
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();

            // Use the Clerk frontend API to set the profile image
            await clerkUser.setProfileImage({ file: imageBlob });
            console.log('Clerk profile image updated successfully');
          } catch (clerkError) {
            console.warn('Failed to update Clerk profile image:', clerkError);
          }
        } else {
          console.warn('Clerk user not loaded, skipping profile image update in Clerk');
        }
      } else {
        setBannerImage(imageUrl);
      }

      // 3. Update the user profile in our database
      await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type === 'profile' ? 'imageUrl' : 'bannerUrl']: imageUrl,
        }),
      });

      // Invalidate the userProfile query to force a refetch
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      // Adicionar um pequeno atraso antes de mostrar a mensagem de sucesso e atualizar a página
      setTimeout(() => {
        setSuccessMessage(`${type === 'profile' ? 'Profile' : 'Banner'} image updated successfully!`);

        // Forçar uma atualização completa da página para garantir que as imagens sejam recarregadas
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      setSuccessMessage(`Error: ${error instanceof Error ? error.message : 'Failed to upload image'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      // Validar os dados do formulário
      const validatedData = profileFormSchema.parse(formValues);

      // Verificar se o nome de usuário foi alterado e se está disponível
      if (validatedData.username !== user.username) {
        // Verificar a disponibilidade do nome de usuário
        const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(validatedData.username)}`);
        const data = await response.json();

        if (!data.available) {
          setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
          setIsSubmitting(false);
          return;
        }
      }

      // Enviar os dados para a API
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Username already taken") {
          setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
          throw new Error('Username already taken');
        } else {
          throw new Error('Failed to update profile');
        }
      }

      // Invalidate the userProfile query to force a refetch
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      // Exibir mensagem de sucesso
      setSuccessMessage('Profile updated successfully!');

      // Atualizar a página
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mapear erros de validação
        const fieldErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as keyof ProfileFormValues] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Error updating profile:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm shadow-[0_0_15px_rgba(200,170,110,0.07)] overflow-hidden">
      <div className="p-4 border-b border-primary/20 bg-primary/5">
        <h3 className="font-cinzel font-bold text-lg text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Edit Profile
        </h3>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground/80 mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/50">
                @
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={formValues.username}
                onChange={handleChange}
                className="w-full pl-8 px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
                placeholder="username"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-red-500 text-xs">{errors.username}</p>
            )}
            {isCheckingUsername && (
              <p className="mt-1 text-primary/70 text-xs">Checking username availability...</p>
            )}
            {usernameChanged && !errors.username && usernameAvailable && formValues.username !== user.username && (
              <p className="mt-1 text-green-500 text-xs">Username is available</p>
            )}
            <p className="mt-1 text-xs text-foreground/50">
              Your username is unique and will be displayed as @{formValues.username}
            </p>
          </div>

          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={handleProfileImageClick}
                className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 overflow-hidden cursor-pointer hover:border-primary transition-colors relative flex items-center justify-center"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-primary font-bold text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground/70 mb-2">
                  Click on the image to upload a new profile picture.
                </p>
                <p className="text-xs text-foreground/50">
                  Recommended size: 400x400 pixels. Max size: 2MB.
                </p>
              </div>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Profile Banner
            </label>
            <div
              onClick={handleBannerImageClick}
              className="w-full h-32 rounded-md bg-primary/5 border border-primary/20 overflow-hidden cursor-pointer hover:border-primary/40 transition-colors relative"
            >
              {bannerImage ? (
                <Image
                  src={bannerImage}
                  alt="Profile Banner"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/50">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-foreground/50">
              Recommended size: 1200x300 pixels. Max size: 2MB.
            </p>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground/80 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formValues.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-red-500 text-xs">{errors.bio}</p>
            )}
          </div>

          {/* Favorite Class */}
          <div>
            <label htmlFor="favoriteClass" className="block text-sm font-medium text-foreground/80 mb-1">
              Favorite Class
            </label>
            <select
              id="favoriteClass"
              name="favoriteClass"
              value={formValues.favoriteClass}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
            >
              <option value="">Select a class</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
            {errors.favoriteClass && (
              <p className="mt-1 text-red-500 text-xs">{errors.favoriteClass}</p>
            )}
          </div>

          {/* Favorite Weapon */}
          <div>
            <label htmlFor="favoriteWeapon" className="block text-sm font-medium text-foreground/80 mb-1">
              Favorite Weapon
            </label>
            <select
              id="favoriteWeapon"
              name="favoriteWeapon"
              value={formValues.favoriteWeapon}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm"
            >
              <option value="">Select a weapon</option>
              {weapons.map((weapon) => (
                <option key={weapon} value={weapon}>
                  {weapon}
                </option>
              ))}
            </select>
            {errors.favoriteWeapon && (
              <p className="mt-1 text-red-500 text-xs">{errors.favoriteWeapon}</p>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-500 text-sm">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
