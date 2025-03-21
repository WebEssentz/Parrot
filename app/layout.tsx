import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from "geist/font/mono";
import clsx from "clsx";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { inter, jetbrains, manrope, sora } from './lib/fonts'
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "parrot Enterprise AI Assistant",
  description:
    "An enterprise-grade voice assistant powered by Deepseek, Groq, Cartesia, and Vercel.",
  authors: [{ name: "Godwin" }],
  keywords: ["AI", "voice assistant", "Deepseek", "enterprise", "parrot"],
  viewport: "width=device-width, initial-scale=1",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    title: "parrot Enterprise AI Assistant",
    description: "An enterprise-grade voice assistant with thinking capabilities",
    url: "/",
    images: [{ url: "/og-image.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          inter.variable,
          jetbrains.variable,
          manrope.variable,
          sora.variable,
          GeistSans.variable,
          GeistMono.variable,
          "min-h-dvh flex flex-col antialiased font-sans select-none overflow-hidden bg-background"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storageKey="parrot-theme"
        >
          {children}
          <Toaster richColors theme="system" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
