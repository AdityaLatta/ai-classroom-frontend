import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import React from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | AI Classroom",
    default: "Authentication | AI Classroom",
  },
  description: "Sign in or create an account for AI Classroom",
};

export default function AuthLayout({
  children,
  quote = "Discover the future of interactive learning powered by Artificial Intelligence.",
}: {
  children: React.ReactNode;
  quote?: string;
}) {
  return (
    <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          AI Classroom
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">&ldquo;{quote}&rdquo;</p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 relative">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
          {children}
        </div>
      </div>
    </div>
  );
}
