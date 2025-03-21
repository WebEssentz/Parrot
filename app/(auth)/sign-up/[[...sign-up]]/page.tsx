"use client";

import { useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from 'react-icons/fc';
import { BsGithub, BsMicrosoft } from 'react-icons/bs';
import Link from "next/link";
import { useState } from "react";
import { AuthContainer, OAuthButton } from "@/components/auth/shared";


const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

// Update the backgroundVariants
const backgroundVariants = {
  github: "bg-github",
  google: "bg-google",
  microsoft: "bg-microsoft",
  default: "bg-gradient-to-br from-gray-900 to-gray-800"
};


export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);
  const [greeting] = useState(getTimeBasedGreeting());

  // In your sign-in handler
const signInWith = async (strategy: OAuthStrategy) => {
  if (!isLoaded) return;

  setSelectedProvider(strategy);
  setIsGlitching(true);

  // Add a delay for the glitch effect
  setTimeout(async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/new",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      setIsGlitching(false);
    }
  }, 1500);
};

  return (
    <AuthContainer>
      <AnimatePresence>
        {isGlitching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="glitch-effect">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl font-bold text-white"
              >
                Accessing Parrot AI...
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="space-y-2 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <div className="w-24 h-24 mx-auto">
                  🦜
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
              >
                {greeting}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-300"
              >
                Welcome to the AI frontier
              </motion.p>
            </div>

            {/* OAuth Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
{[
  {
    icon: <FcGoogle className="w-6 h-6" />,
    label: "Continue with Google",
    strategy: "oauth_google",
    description: "Access your AI workspace in the cloud",
  },
  {
    icon: <BsGithub className="w-6 h-6 text-white" />,
    label: "Continue with GitHub",
    strategy: "oauth_github", 
    description: "For developers who shape the future",
  },
  {
    icon: <BsMicrosoft className="w-6 h-6 text-[#00a4ef]" />,
    label: "Continue with Microsoft",
    strategy: "oauth_microsoft",
    description: "Enterprise-ready AI assistant",
  },
].map((provider) => (
  <OAuthButton
    key={provider.strategy}
    icon={provider.icon}
    label={provider.label}
    description={provider.description}
    onClick={() => signInWith(provider.strategy as OAuthStrategy)}
    className={`hover:scale-105 transform transition-all ${
      selectedProvider === provider.strategy ? 'ring-2 ring-primary' : ''
    }`}
  />
))}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-sm text-gray-300">
                Already have a Parrot?{" "}
                <Link
                  href="/sign-in"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign In →
                </Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContainer>
  );
}