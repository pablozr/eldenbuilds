import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Providers } from "./providers";
import "./globals.css";

// Cinzel font for Elden Ring style headings
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elden Ring Builds",
  description: "Share and discover Elden Ring character builds",
  // Add Content Security Policy to prevent XSS attacks
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  other: {
    'Content-Security-Policy':
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.elden-builds.com https://*.clerk.accounts.dev; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https://*.clerk.com https://*.clerk.dev https://*.supabase.co; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://clerk.elden-builds.com https://*.clerk.accounts.dev https://*.supabase.co; " +
      "frame-src 'self' https://clerk.elden-builds.com https://*.clerk.accounts.dev; " +
      "object-src 'none';"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${cinzel.variable} ${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <Providers>
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
