'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { z } from 'zod';
import { useUser } from '@clerk/nextjs';
import { updateProfile } from '../actions/update-profile';
import { uploadProfileImage } from '../actions/upload-image';

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
      formData.append('image', file);
      formData.append('type', type);

      // Usar o server action para fazer upload da imagem
      const result = await uploadProfileImage(formData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload image');
      }

      if (type === 'profile') {
        setProfileImage(result.imageUrl);

        // Também atualizar a imagem de perfil do Clerk diretamente
        if (isClerkUserLoaded && clerkUser) {
          try {
            // Primeiro, buscar a imagem como um blob
            const imageResponse = await fetch(result.imageUrl);
            const imageBlob = await imageResponse.blob();

            // Usar a API do Clerk para definir a imagem de perfil
            await clerkUser.setProfileImage({ file: imageBlob });
            console.log('Clerk profile image updated successfully');
          } catch (clerkError) {
            console.warn('Failed to update Clerk profile image:', clerkError);
          }
        } else {
          console.warn('Clerk user not loaded, skipping profile image update in Clerk');
        }
      } else {
        setBannerImage(result.imageUrl);
      }

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

      // Usar o server action para atualizar o perfil
      const result = await updateProfile(validatedData);

      if (!result.success) {
        if (result.error === "Username already taken") {
          setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
          throw new Error('Username already taken');
        } else {
          throw new Error(result.error || 'Failed to update profile');
        }
      }

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
          {/* Conteúdo do formulário (omitido para brevidade) */}
        </form>
      </div>
    </div>
  );
}
