"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { googleLogin } from "@/lib/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import { FormError } from "@/components/ui/form-error";
import { env } from "@/env";

interface GoogleIdConfig {
  client_id: string;
  callback: (response: { credential: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  width?: string;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (
            element: HTMLElement,
            config: GoogleButtonConfig,
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onNewUser?: () => void;
  redirectTo?: string;
}

export function GoogleLoginButton({
  onNewUser,
  redirectTo = "/dashboard",
}: GoogleLoginButtonProps) {
  const { login } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setError(null);
      setIsLoading(true);
      try {
        const data = await googleLogin(response.credential);
        login(data.user, data.accessToken);
        if (data.isNewUser && onNewUser) {
          onNewUser();
        } else {
          router.push(redirectTo);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, "Failed to sign in with Google."));
      } finally {
        setIsLoading(false);
      }
    },
    [login, router, onNewUser, redirectTo],
  );

  // Store latest callback in a ref so the SDK always calls the current version
  const callbackRef = useRef(handleGoogleResponse);
  useEffect(() => {
    callbackRef.current = handleGoogleResponse;
  }, [handleGoogleResponse]);

  useEffect(() => {
    const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    function initializeGoogle() {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => callbackRef.current(res),
      });
      if (buttonRef.current) {
        window.google?.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
        });
      }
    }

    // Reuse existing script if already loaded (e.g. navigating back to this page)
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      if (window.google) {
        initializeGoogle();
      } else {
        existing.addEventListener("load", initializeGoogle);
      }
      return () => {
        window.google?.accounts.id.cancel();
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, []);

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
      <FormError message={error} className="text-center" />
    </div>
  );
}
