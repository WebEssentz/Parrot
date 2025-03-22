import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import clsx from "clsx";
import "../../app/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Parrot AI",
    template: "%s | Parrot AI"
  },
  description: "Enterprise-grade AI assistant for the modern web",
  metadataBase: new URL("https://orbe-ai.vercel.app"),
  icons: {
    icon: "/favicon.ico"
  }
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={clsx(
            GeistSans.variable,
            GeistMono.variable,
            "antialiased font-sans",
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
