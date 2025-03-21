"use client";

import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <motion.div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />

        {/* Animated gradient orbs */}
        {[
          "from-primary/20 to-primary/0",
          "from-blue-600/20 to-blue-600/0",
          "from-violet-600/20 to-violet-600/0",
        ].map((gradient, i) => (
          <motion.div
            key={gradient}
            className={cn(
              "absolute rounded-full blur-3xl opacity-50",
              "w-[400px] h-[400px]",
              `bg-gradient-radial ${gradient}`
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 2,
            }}
            style={{
              left: `${25 + i * 25}%`,
              top: `${20 + i * 20}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 flex items-center gap-2"
      >
        <BrainCircuit className="h-8 w-8 text-primary" />
        <span className="font-outfit text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent">
          Enterprise AI
        </span>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
};