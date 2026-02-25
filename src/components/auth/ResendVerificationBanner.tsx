"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export function ResendVerificationBanner() {
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    setIsSending(true);
    try {
      await api.post("/auth/resend-verification", {});
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(60);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Failed to resend verification email."),
      );
    } finally {
      setIsSending(false);
    }
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
      <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" />
      <div className="flex-1 text-sm text-yellow-800 dark:text-yellow-200">
        Your email is not verified. Please check your inbox for a verification
        link.
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={isSending || cooldown > 0}
      >
        {cooldown > 0
          ? `Resend in ${cooldown}s`
          : isSending
            ? "Sending..."
            : "Resend"}
      </Button>
    </div>
  );
}
