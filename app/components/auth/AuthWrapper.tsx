import React from "react";
import Image from "next/image";
import Link from "next/link";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/zaiDDGR.jpeg"
          alt="Elden Ring Background"
          fill
          className="object-cover object-center brightness-[0.6]"
          priority
        />
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px]"></div>
      </div>

      {/* Header with Glassmorphism effect */}
      <header className="relative z-10 w-full border-b border-primary/20 bg-background/50 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative h-8 w-8 overflow-hidden">
                <Image
                  src="/elden-ring-icon.png"
                  alt="Elden Ring Icon"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-bold font-cinzel text-primary text-lg relative group-hover:text-primary/90 transition-colors duration-300">
                Elden Ring Builds
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Auth Form Container */}
      <div className="flex-1 flex items-center justify-center z-10 w-full p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="relative flex justify-center">
            {/* Golden glow effect around the form */}
            <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md"></div>

            {/* Form content */}
            <div className="relative w-full bg-card/80 backdrop-blur-md p-6 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(200,170,110,0.2)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
