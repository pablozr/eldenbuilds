'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormSchema, type BuildFormValues } from '@/lib/validations/build';
import { createBuild } from './actions/create-build';

export default function CreateBuildPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuildFormValues>({
    resolver: zodResolver(buildFormSchema),
    defaultValues: {
      title: '',
      description: '',
      level: 150,
      buildType: null,
      vigor: 10,
      mind: 10,
      endurance: 10,
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      faith: 10,
      arcane: 10,
      weapons: [''],
      armor: [''],
      talismans: [''],
      spells: [''],
      isPublished: true,
    },
  });

  // Field arrays for equipment
  const {
    fields: weaponFields,
    append: appendWeapon,
    remove: removeWeapon,
  } = useFieldArray({
    control,
    name: 'weapons',
  });

  const {
    fields: armorFields,
    append: appendArmor,
    remove: removeArmor,
  } = useFieldArray({
    control,
    name: 'armor',
  });

  const {
    fields: talismanFields,
    append: appendTalisman,
    remove: removeTalisman,
  } = useFieldArray({
    control,
    name: 'talismans',
  });

  const {
    fields: spellFields,
    append: appendSpell,
    remove: removeSpell,
  } = useFieldArray({
    control,
    name: 'spells',
  });

  // Calculate remaining stat points
  const stats = watch(['vigor', 'mind', 'endurance', 'strength', 'dexterity', 'intelligence', 'faith', 'arcane']);
  const level = watch('level');
  const startingLevel = 1;
  const baseStats = 80; // 10 points in each of the 8 stats
  const usedPoints = stats.reduce((acc, stat) => acc + (stat - 10), 0);
  const totalPoints = level - startingLevel;
  const remainingPoints = totalPoints - usedPoints;

  // Build types for selection
  const buildTypes = [
    { name: 'Select a build type', value: '' },
    { name: 'Strength', value: 'strength' },
    { name: 'Dexterity', value: 'dexterity' },
    { name: 'Quality', value: 'quality' },
    { name: 'Intelligence', value: 'intelligence' },
    { name: 'Faith', value: 'faith' },
    { name: 'Arcane', value: 'arcane' },
    { name: 'Hybrid', value: 'hybrid' },
    { name: 'Bleed', value: 'bleed' },
    { name: 'Frost', value: 'frost' },
    { name: 'Poison', value: 'poison' },
    { name: 'Lightning', value: 'lightning' },
    { name: 'Fire', value: 'fire' },
    { name: 'Holy', value: 'holy' },
    { name: 'Other', value: 'other' },
  ];

  const onSubmit = async (data: BuildFormValues) => {
    if (!userId) {
      setError('You must be logged in to create a build');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Filter out empty equipment entries
      data.weapons = data.weapons.filter(weapon => weapon.trim() !== '');
      data.armor = data.armor.filter(armor => armor.trim() !== '');
      data.talismans = data.talismans.filter(talisman => talisman.trim() !== '');
      data.spells = data.spells.filter(spell => spell.trim() !== '');

      // Ensure at least one weapon
      if (data.weapons.length === 0) {
        setError('At least one weapon is required');
        setIsSubmitting(false);
        return;
      }

      // Usar o server action para criar a build
      const result = await createBuild(data);
      
      // Se houver erro, exibir mensagem
      if (result && !result.success) {
        setError(result.error || 'An error occurred while creating the build');
      }
      
      // O redirecionamento é feito automaticamente pelo server action
    } catch (err) {
      console.error('Error creating build:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the build');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Glassmorphism effect */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/50 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                <Image
                  src="/pic2.webp"
                  alt="Elden Ring Icon"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span className="font-bold text-foreground group-hover:text-primary transition-colors duration-300 relative">
                Elden Ring Builds
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/builds" className="px-3 py-1.5 rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 backdrop-blur-sm relative group">
                Builds
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/builds/create" className="px-3 py-1.5 rounded-md transition-all duration-300 text-primary bg-primary/5 backdrop-blur-sm relative group">
                Create Build
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary"></span>
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center gap-3">
              {userId ? (
                <UserButton
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "border-2 border-primary/50 hover:border-primary transition-colors",
                    }
                  }}
                />
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 shadow-[0_0_10px_rgba(200,170,110,0.1)] hover:shadow-[0_0_15px_rgba(200,170,110,0.2)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-4 py-2 rounded-md border border-primary/30 hover:bg-secondary/50 font-medium transition-all duration-300 backdrop-blur-sm bg-background/30 hover:bg-background/50 shadow-[0_0_10px_rgba(200,170,110,0.05)] hover:shadow-[0_0_15px_rgba(200,170,110,0.15)]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background to-card/80"></div>
        <div className="absolute inset-0 z-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8aa6e' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="container py-10 relative z-10">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/builds"
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors group w-fit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:-translate-x-1 transition-transform"
              >
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="font-medium">Back to Builds</span>
            </Link>
          </div>

          <div className="text-center mb-10 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10"></div>
            <h1 className="text-4xl font-bold font-cinzel text-primary mb-4 relative inline-block">
              <span className="relative">
                Forge Your Legend
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></span>
              </span>
            </h1>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              Create and share your Elden Ring character build with the community
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 rounded-md text-red-500">
              {error}
            </div>
          )}

          {/* Not logged in message */}
          {!userId && (
            <div className="mb-6 p-4 border border-primary/50 bg-primary/10 rounded-md">
              <p className="text-foreground/80 mb-4">You need to be signed in to create a build.</p>
              <div className="flex gap-4">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-md border border-primary/30 hover:bg-secondary/50 font-medium transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Build Form */}
          {userId && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Conteúdo do formulário (omitido para brevidade) */}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
