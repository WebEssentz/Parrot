"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      try {
        await handleRedirectCallback({
          afterSignInUrl: "/new",
          afterSignUpUrl: "/new",
        });
      } catch (error) {
        console.error("Error handling redirect:", error);
        router.push("/sign-in");
      }
    };
    
    handle();
  }, [handleRedirectCallback, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="space-y-6 text-center">
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        
        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight animate-pulse">
            Completing sign in...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we redirect you
          </p>
        </div>
      </div>
    </div>
  );
}