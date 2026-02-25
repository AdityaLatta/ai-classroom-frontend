"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import { env } from "@/env";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onNewUser?: () => void;
}

export function GoogleLoginButton({ onNewUser }: GoogleLoginButtonProps) {
  const { login } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      if (buttonRef.current) {
        window.google?.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleResponse(response: { credential: string }) {
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/google", {
        idToken: response.credential,
      });
      login(data.user, data.accessToken);
      if (data.isNewUser && onNewUser) {
        onNewUser();
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to sign in with Google."));
    } finally {
      setIsLoading(false);
    }
  }

  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div ref={buttonRef} className="flex justify-center" />
      {isLoading && (
        <Button variant="outline" className="w-full" disabled>
          Signing in with Google...
        </Button>
      )}
      {error && (
        <div className="text-sm text-destructive font-medium text-center">
          {error}
        </div>
      )}
    </div>
  );
}
