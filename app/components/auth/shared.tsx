'use client'

import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { useTheme } from "next-themes";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";
import ParrotLogo from "../ui/ParrotLogo"

export const BrandLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 text-foreground">
    <ParrotLogo />
    <span className="font-outfit text-xl sm:text-2xl font-bold">
      Parrot
    </span>
  </Link>
);

export const AuthContainer = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/90 to-background -z-10" />
      
      {/* Accent Gradients */}
      <div 
        className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] -z-10"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)'
        }}
      />
      <div 
        className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -z-10"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)'
        }}
      />
      
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-8 left-8"
      >
        <BrandLogo />
      </motion.div>
      
      {/* Main Content */}
      <div className="w-full sm:w-[440px] px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
};

export function OAuthButton({
  icon,
  label,
  description,
  onClick,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-6 py-4 flex items-center gap-4
        bg-black/10 backdrop-blur-xl
        border border-white/10
        rounded-xl hover:bg-black/20
        transition-all duration-200
        group
        ${className}
      `}
    >
      <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      <div className="text-left">
        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
          {label}
        </div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
    </button>
  );
}