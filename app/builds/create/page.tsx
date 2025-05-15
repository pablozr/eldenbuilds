'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormSchema, type BuildFormValues } from '@/lib/validations/build';

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
  const { fields: weaponFields, append: appendWeapon, remove: removeWeapon } = useFieldArray({
    control,
    name: 'weapons',
  });

  const { fields: armorFields, append: appendArmor, remove: removeArmor } = useFieldArray({
    control,
    name: 'armor',
  });

  const { fields: talismanFields, append: appendTalisman, remove: removeTalisman } = useFieldArray({
    control,
    name: 'talismans',
  });

  const { fields: spellFields, append: appendSpell, remove: removeSpell } = useFieldArray({
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

      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Verifica se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text());
        throw new Error('Server returned non-JSON response');
      }

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.details) {
          // Se houver detalhes de validação, exibe-os
          console.error('Validation errors:', responseData.details);
          throw new Error(responseData.error || 'Failed to create build');
        } else {
          throw new Error(responseData.error || 'Failed to create build');
        }
      }

      router.push(`/builds/${responseData.id}`);
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
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                <Image
                  src="/pic2.webp"
                  alt="Elden Ring Icon"
                  width={40}
                  height={40}
                  className="h-10 w-10 relative z-10 transition-transform duration-500 group-hover:scale-105 object-contain rounded-full"
                />
              </div>
              <span className="font-cinzel font-bold text-primary text-xl relative">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(200,170,110,0.07)]">
                    <h2 className="text-xl font-bold font-cinzel text-primary mb-5 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Build Information
                    </h2>

                    <div className="space-y-4">
                      {/* Build Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">
                          Build Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="title"
                          type="text"
                          {...register('title')}
                          className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                          placeholder="e.g. Moonlight Greatsword Mage"
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                        )}
                      </div>

                      {/* Build Type */}
                      <div>
                        <label htmlFor="buildType" className="block text-sm font-medium mb-1">
                          Build Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="buildType"
                          {...register('buildType')}
                          className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                        >
                          {buildTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Character Level */}
                      <div>
                        <label htmlFor="level" className="block text-sm font-medium mb-1">
                          Character Level <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="level"
                          type="number"
                          {...register('level', { valueAsNumber: true })}
                          className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                          min="1"
                          max="713"
                        />
                        {errors.level && (
                          <p className="mt-1 text-sm text-red-500">{errors.level.message}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="description"
                          {...register('description')}
                          rows={4}
                          className="w-full px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                          placeholder="Describe your build, its strengths, weaknesses, and how to play it effectively..."
                        ></textarea>
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Equipment Section */}
                  <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(200,170,110,0.07)]">
                    <h2 className="text-xl font-bold font-cinzel text-primary mb-5 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Equipment
                    </h2>

                    <div className="space-y-6">
                      {/* Weapons */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Weapons <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {weaponFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <input
                                {...register(`weapons.${index}`)}
                                className="flex-1 px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                                placeholder="e.g. Dark Moon Greatsword"
                              />
                              <button
                                type="button"
                                onClick={() => removeWeapon(index)}
                                className="p-2 text-foreground/60 hover:text-red-500 transition-colors"
                                disabled={index === 0 && weaponFields.length === 1}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => appendWeapon('')}
                            className="mt-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                            Add Weapon
                          </button>
                        </div>
                        {errors.weapons && (
                          <p className="mt-1 text-sm text-red-500">{errors.weapons.message}</p>
                        )}
                      </div>

                      {/* Armor */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Armor</label>
                        <div className="space-y-2">
                          {armorFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <input
                                {...register(`armor.${index}`)}
                                className="flex-1 px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                                placeholder="e.g. Snow Witch Hat"
                              />
                              <button
                                type="button"
                                onClick={() => removeArmor(index)}
                                className="p-2 text-foreground/60 hover:text-red-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => appendArmor('')}
                            className="mt-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                            Add Armor
                          </button>
                        </div>
                      </div>

                      {/* Talismans */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Talismans</label>
                        <div className="space-y-2">
                          {talismanFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <input
                                {...register(`talismans.${index}`)}
                                className="flex-1 px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                                placeholder="e.g. Erdtree's Favor +2"
                              />
                              <button
                                type="button"
                                onClick={() => removeTalisman(index)}
                                className="p-2 text-foreground/60 hover:text-red-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => appendTalisman('')}
                            className="mt-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                            Add Talisman
                          </button>
                        </div>
                      </div>

                      {/* Spells */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Spells</label>
                        <div className="space-y-2">
                          {spellFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                              <input
                                {...register(`spells.${index}`)}
                                className="flex-1 px-3 py-2 bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                                placeholder="e.g. Comet Azur"
                              />
                              <button
                                type="button"
                                onClick={() => removeSpell(index)}
                                className="p-2 text-foreground/60 hover:text-red-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => appendSpell('')}
                            className="mt-2 px-4 py-2 text-sm bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 transition-colors flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14M5 12h14"></path>
                            </svg>
                            Add Spell
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-8">
                  <div className="rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-[0_0_15px_rgba(200,170,110,0.07)] sticky top-24">
                    <h2 className="text-xl font-bold font-cinzel text-primary mb-5 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Character Stats
                    </h2>

                    <div className="mb-4 p-3 bg-primary/10 rounded-md border border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Remaining Points:</span>
                        <span className={`font-bold ${remainingPoints < 0 ? 'text-red-500' : 'text-primary'}`}>
                          {remainingPoints}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Vigor */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="vigor" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                            </svg>
                            Vigor
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('vigor');
                                if (currentValue > 10) {
                                  setValue('vigor', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="vigor"
                              type="number"
                              {...register('vigor', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('vigor');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('vigor', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-red-400/70 to-red-500/70 h-full rounded-full" style={{ width: `${(watch('vigor') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Mind */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="mind" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v12"/>
                              <path d="M8 10h8"/>
                            </svg>
                            Mind
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('mind');
                                if (currentValue > 10) {
                                  setValue('mind', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="mind"
                              type="number"
                              {...register('mind', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('mind');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('mind', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-blue-400/70 to-blue-500/70 h-full rounded-full" style={{ width: `${(watch('mind') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Endurance */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="endurance" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                              <line x1="16" x2="2" y1="8" y2="22"/>
                              <line x1="17.5" x2="9" y1="15" y2="15"/>
                            </svg>
                            Endurance
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('endurance');
                                if (currentValue > 10) {
                                  setValue('endurance', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="endurance"
                              type="number"
                              {...register('endurance', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('endurance');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('endurance', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-green-400/70 to-green-500/70 h-full rounded-full" style={{ width: `${(watch('endurance') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Strength */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="strength" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                              <path d="M18.37 2.63 14 7l-1.37-1.37a1 1 0 0 0-1.41 0L9.6 7.25a1 1 0 0 0 0 1.41L12 11a1 1 0 0 0 1.41 0l1.37-1.37L19 14l1.37-1.37a1 1 0 0 0 0-1.41L19 9.6a1 1 0 0 0-1.41 0L16.2 11l-1.83-1.83 3.37-3.37a1 1 0 0 0 0-1.41L16.2 2.8a1 1 0 0 0-1.41 0L13.6 4l-1.37-1.37a1 1 0 0 0-1.41 0L9.19 4.26a1 1 0 0 0 0 1.41L10.8 7l-1.37 1.37a1 1 0 0 0 0 1.41l1.63 1.63a1 1 0 0 0 1.41 0L13.8 10l1.37 1.37a1 1 0 0 0 1.41 0l1.63-1.63a1 1 0 0 0 0-1.41L16.8 7l1.57-1.58a1 1 0 0 0 0-1.41z"/>
                            </svg>
                            Strength
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('strength');
                                if (currentValue > 10) {
                                  setValue('strength', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="strength"
                              type="number"
                              {...register('strength', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('strength');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('strength', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-orange-400/70 to-orange-500/70 h-full rounded-full" style={{ width: `${(watch('strength') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Dexterity */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="dexterity" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <path d="M8 13h2"/>
                              <path d="M8 17h2"/>
                              <path d="M14 13h2"/>
                              <path d="M14 17h2"/>
                            </svg>
                            Dexterity
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('dexterity');
                                if (currentValue > 10) {
                                  setValue('dexterity', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="dexterity"
                              type="number"
                              {...register('dexterity', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('dexterity');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('dexterity', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-yellow-400/70 to-yellow-500/70 h-full rounded-full" style={{ width: `${(watch('dexterity') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Intelligence */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="intelligence" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                              <path d="M8 3v.5A1.5 1.5 0 0 0 9.5 5h5A1.5 1.5 0 0 0 16 3.5V3"/>
                              <path d="M2 9.5h20"/>
                              <path d="M18 11.5v.5a2 2 0 0 1-2 2h-.5"/>
                              <path d="M6 11.5v.5a2 2 0 0 0 2 2h.5"/>
                              <path d="M12 16v4"/>
                              <path d="M9 20h6"/>
                            </svg>
                            Intelligence
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('intelligence');
                                if (currentValue > 10) {
                                  setValue('intelligence', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="intelligence"
                              type="number"
                              {...register('intelligence', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('intelligence');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('intelligence', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-purple-400/70 to-purple-500/70 h-full rounded-full" style={{ width: `${(watch('intelligence') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Faith */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="faith" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                              <path d="M12 2v8"/>
                              <path d="m4.93 10.93 1.41 1.41"/>
                              <path d="M2 18h2"/>
                              <path d="M20 18h2"/>
                              <path d="m19.07 10.93-1.41 1.41"/>
                              <path d="M22 22H2"/>
                              <path d="m8 22 4-10 4 10"/>
                              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>
                            </svg>
                            Faith
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('faith');
                                if (currentValue > 10) {
                                  setValue('faith', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="faith"
                              type="number"
                              {...register('faith', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('faith');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('faith', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-amber-400/70 to-amber-500/70 h-full rounded-full" style={{ width: `${(watch('faith') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Arcane */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="arcane" className="font-medium text-foreground/90 flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                              <path d="M12 9v4"/>
                              <path d="M12 17h.01"/>
                            </svg>
                            Arcane
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('arcane');
                                if (currentValue > 10) {
                                  setValue('arcane', currentValue - 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              -
                            </button>
                            <input
                              id="arcane"
                              type="number"
                              {...register('arcane', { valueAsNumber: true })}
                              className="w-12 px-2 py-1 text-center bg-background/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                              min="10"
                              max="99"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = watch('arcane');
                                if (currentValue < 99 && remainingPoints > 0) {
                                  setValue('arcane', currentValue + 1);
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-background/50 border border-primary/20 rounded-md hover:bg-primary/10 transition-colors"
                              disabled={remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden border border-primary/10">
                          <div className="bg-gradient-to-r from-pink-400/70 to-pink-500/70 h-full rounded-full" style={{ width: `${(watch('arcane') / 99) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6 mt-6 border-t border-primary/10">
                        <button
                          type="submit"
                          disabled={isSubmitting || remainingPoints < 0}
                          className="w-full py-3 rounded-md bg-primary text-background hover:bg-primary/90 font-medium transition-all duration-300 shadow-[0_0_10px_rgba(200,170,110,0.1)] hover:shadow-[0_0_15px_rgba(200,170,110,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"/>
                                <path d="m12 5 7 7-7 7"/>
                              </svg>
                              Create Build
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-primary/20 py-8 md:py-6 bg-card/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/pic2.webp"
              alt="Elden Ring Icon"
              width={28}
              height={28}
              className="h-7 w-7 object-contain rounded-full"
            />
            <p className="text-center text-sm leading-loose text-foreground/70 md:text-left">
              © {new Date().getFullYear()} Elden Ring Builds. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-foreground/70 hover:text-primary">
              Terms
            </Link>
            <Link href="#" className="text-sm text-foreground/70 hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-foreground/70 hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
