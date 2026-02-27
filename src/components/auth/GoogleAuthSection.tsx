"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";

interface GoogleAuthSectionProps {
  redirectTo?: string;
}

export function GoogleAuthSection({
  redirectTo = "/dashboard",
}: GoogleAuthSectionProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const router = useRouter();

  return (
    <>
      <GoogleLoginButton
        onNewUser={() => setShowRoleDialog(true)}
        redirectTo={redirectTo}
      />
      <RoleSelectionDialog
        open={showRoleDialog}
        onComplete={() => router.push(redirectTo)}
      />
    </>
  );
}
