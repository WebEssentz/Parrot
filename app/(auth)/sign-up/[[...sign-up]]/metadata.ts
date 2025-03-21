import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Parrot AI",
  description: "Join Parrot AI - Your AI-powered assistant for the future",
  metadataBase: new URL("https://orbe-ai.vercel.app/sign-up"),
  openGraph: {
    title: "Create Account | Parrot AI",
    description: "Join Parrot AI - Your AI-powered assistant for the future",
    images: ["/og-image.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Account | Parrot AI",
    description: "Join Parrot AI - Your AI-powered assistant for the future"
  }
};