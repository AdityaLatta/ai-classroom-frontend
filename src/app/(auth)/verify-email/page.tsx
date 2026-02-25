"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "" : "Verification token is missing. Please check your email link.",
  );

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    async function verify() {
      try {
        const data = await verifyEmail(token!, { signal: controller.signal });
        setStatus("success");
        setMessage(
          data.message || "Email verified successfully. You can now log in.",
        );
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setStatus("error");
        setMessage(
          getApiErrorMessage(
            err,
            "Verification failed. The link may have expired.",
          ),
        );
      }
    }

    verify();

    return () => controller.abort();
  }, [token]);

  return (
    <div
      className="flex flex-col items-center space-y-4 text-center"
      aria-live="polite"
    >
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifying your email...
          </h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Email Verified
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Verification Failed
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex gap-3 mt-4">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifying your email...
          </h1>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
