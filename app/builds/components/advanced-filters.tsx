'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AdvancedFiltersProps {
  currentBuildType?: string;
  currentMinLevel?: number;
  currentMaxLevel?: number;
  currentSort?: string;
}

export default function AdvancedFilters({
  currentBuildType,
  currentMinLevel,
  currentMaxLevel,
  currentSort = 'newest',
}: AdvancedFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [minLevel, setMinLevel] = useState<number | undefined>(currentMinLevel);
  const [maxLevel, setMaxLevel] = useState<number | undefined>(currentMaxLevel);
  const [selectedStats, setSelectedStats] = useState<string[]>([]);
  
  // Build types with icons
  const buildTypes = [
    { name: 'Strength', value: 'strength', icon: '💪' },
    { name: 'Dexterity', value: 'dexterity', icon: '🗡️' },
    { name: 'Intelligence', value: 'intelligence', icon: '🧙' },
    { name: 'Faith', value: 'faith', icon: '✨' },
    { name: 'Arcane', value: 'arcane', icon: '🔮' },
    { name: 'Bleed', value: 'bleed', icon: '🩸' },
    { name: 'Frost', value: 'frost', icon: '❄️' },
    { name: 'Poison', value: 'poison', icon: '☠️' },
    { name: 'Quality', value: 'quality', icon: '⚔️' },
    { name: 'Hybrid', value: 'hybrid', icon: '🔄' },
  ];
  
  // Stats for advanced filtering
  const stats = [
    { name: 'High Vigor', value: 'high-vigor', description: 'Builds with 40+ Vigor' },
    { name: 'High Strength', value: 'high-strength', description: 'Builds with 40+ Strength' },
    { name: 'High Dexterity', value: 'high-dexterity', description: 'Builds with 40+ Dexterity' },
    { name: 'High Intelligence', value: 'high-intelligence', description: 'Builds with 40+ Intelligence' },
    { name: 'High Faith', value: 'high-faith', description: 'Builds with 40+ Faith' },
    { name: 'High Arcane', value: 'high-arcane', description: 'Builds with 40+ Arcane' },
    { name: 'Balanced', value: 'balanced', description: 'Builds with evenly distributed stats' },
  ];
  
  // Sort options
  const sortOptions = [
    { name: 'Newest', value: 'newest' },
    { name: 'Oldest', value: 'oldest' },
    { name: 'Most Popular', value: 'popular' },
    { name: 'Most Comments', value: 'comments' },
  ];
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update level filters
    if (minLevel !== undefined) {
      params.set('minLevel', minLevel.toString());
    } else {
      params.delete('minLevel');
    }
    
    if (maxLevel !== undefined) {
      params.set('maxLevel', maxLevel.toString());
    } else {
      params.delete('maxLevel');
    }
    
    // Update stat filters
    if (selectedStats.length > 0) {
      params.set('stats', selectedStats.join(','));
    } else {
      params.delete('stats');
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Navigate to the new URL
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Reset filters
  const resetFilters = () => {
    setMinLevel(undefined);
    setMaxLevel(undefined);
    setSelectedStats([]);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minLevel');
    params.delete('maxLevel');
    params.delete('stats');
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Toggle stat selection
  const toggleStat = (statValue: string) => {
    setSelectedStats(prev => 
      prev.includes(statValue)
        ? prev.filter(s => s !== statValue)
        : [...prev, statValue]
    );
  };
  
  return (
    <div className="w-full">
      {/* Advanced Filters Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-md mb-4 hover:bg-primary/10 transition-colors"
      >
        <span className="font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M7 12h10"/>
            <path d="M10 18h4"/>
          </svg>
          Advanced Filters
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      
      {/* Advanced Filters Panel */}
      {isOpen && (
        <div className="p-4 bg-card/30 border border-primary/20 rounded-md mb-6 animate-in fade-in duration-200">
          <div className="space-y-6">
            {/* Level Range */}
            <div>
              <h4 className="text-sm font-semibold text-foreground/90 mb-3 uppercase tracking-wider">Level Range</h4>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-foreground/70 mb-1 block">Min Level</label>
                  <input
                    type="number"
                    min="1"
                    max="713"
                    value={minLevel || ''}
                    onChange={(e) => setMinLevel(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-1.5 rounded-md bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-foreground/70 mb-1 block">Max Level</label>
                  <input
                    type="number"
                    min="1"
                    max="713"
                    value={maxLevel || ''}
                    onChange={(e) => setMaxLevel(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-1.5 rounded-md bg-background/50 border border-primary/20 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Stat Filters */}
            <div>
              <h4 className="text-sm font-semibold text-foreground/90 mb-3 uppercase tracking-wider">Stat Filters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stats.map((stat) => (
                  <div
                    key={stat.value}
                    onClick={() => toggleStat(stat.value)}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedStats.includes(stat.value)
                        ? 'bg-primary/20 border border-primary/30'
                        : 'bg-background/50 border border-primary/10 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-sm border ${
                        selectedStats.includes(stat.value)
                          ? 'bg-primary border-primary'
                          : 'border-primary/30'
                      } flex items-center justify-center`}>
                        {selectedStats.includes(stat.value) && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{stat.name}</div>
                        <div className="text-xs text-foreground/60">{stat.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-md border border-primary/20 hover:bg-primary/10 text-sm transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-3 py-1.5 rounded-md bg-primary text-background hover:bg-primary/90 text-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Build Type Filters */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground/90 mb-3 uppercase tracking-wider">Build Type</h4>
        <div className="grid grid-cols-2 gap-2">
          {buildTypes.map((type) => (
            <Link
              key={type.value}
              href={`/builds?buildType=${type.value}`}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                currentBuildType === type.value
                  ? 'bg-primary/20 border border-primary/30'
                  : 'bg-background/50 border border-primary/10 hover:bg-primary/10'
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <span className="text-sm">{type.name}</span>
            </Link>
          ))}
          <Link
            href="/builds"
            className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
              !currentBuildType
                ? 'bg-primary/20 border border-primary/30'
                : 'bg-background/50 border border-primary/10 hover:bg-primary/10'
            }`}
          >
            <span className="text-lg">🔍</span>
            <span className="text-sm">All Types</span>
          </Link>
        </div>
      </div>
      
      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground/90 mb-3 uppercase tracking-wider">Sort By</h4>
        <div className="space-y-2">
          {sortOptions.map((sortOption) => (
            <div key={sortOption.value} className="flex items-center">
              <Link
                href={`/builds?sort=${sortOption.value}`}
                className={`flex items-center gap-2 cursor-pointer group w-full ${currentSort === sortOption.value ? 'text-primary' : 'text-foreground/80'}`}
              >
                <div className={`w-3 h-3 rounded-full ${currentSort === sortOption.value ? 'bg-primary' : 'bg-foreground/30'}`}></div>
                <span className="text-sm">{sortOption.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
