import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import clsx from "clsx";
import "../../app/globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from '@clerk/nextjs';
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
	title: "Parrot",
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
		title: "Parrot",
		description: "An enterprise-grade voice assistant with thinking capabilities",
		url: "/",
		images: [{ url: "/og-image.png" }],
	},
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
    <html lang="en">
      <body
        className={clsx(
          GeistSans.variable,
          GeistMono.variable,
          "py-8 px-6 lg:p-10 dark:text-white bg-white dark:bg-black min-h-dvh flex flex-col justify-between antialiased font-sans select-none"
        )}
      >
        <ClerkProvider>
          <main className="flex flex-col items-center justify-center grow">
            {children}
          </main>
        </ClerkProvider>

        {typeof window !== 'undefined' && (
          <>
            <Toaster richColors theme="system" />
            <Analytics />
          </>
        )}
      </body>
    </html>
    </SidebarProvider>
  );
}