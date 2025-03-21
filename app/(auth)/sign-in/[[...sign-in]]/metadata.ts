import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Parrot AI",
  description: "Sign in to your Parrot AI account to access your AI workspace",
  metadataBase: new URL("https://orbe-ai.vercel.app/sign-in"),
  openGraph: {
    title: "Sign In | Parrot AI",
    description: "Sign in to your Parrot AI account to access your AI workspace",
    images: ["/og-image.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Parrot AI",
    description: "Sign in to your Parrot AI account to access your AI workspace"
  }
};