"use client";

import { useState } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

type Role = "STUDENT" | "INSTRUCTOR";

interface RoleSelectionDialogProps {
  open: boolean;
  onComplete: (role: Role) => void;
}

const roles = [
  {
    value: "STUDENT" as Role,
    label: "Student",
    description: "Browse and enroll in courses to learn new skills",
    icon: GraduationCap,
  },
  {
    value: "INSTRUCTOR" as Role,
    label: "Instructor",
    description: "Create and publish courses to teach others",
    icon: BookOpen,
  },
];

export function RoleSelectionDialog({ open, onComplete }: RoleSelectionDialogProps) {
  const [selected, setSelected] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  async function handleConfirm() {
    if (!selected) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/select-role", { role: selected });
      // Update just the role in the store without touching the access token
      if (user) {
        useAuthStore.setState({ user: { ...user, role: data.role } });
      }
      onComplete(selected);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to set role. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Choose your role</DialogTitle>
          <DialogDescription>
            How will you be using the platform? You can change this later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-colors hover:bg-accent",
                selected === role.value
                  ? "border-primary bg-accent"
                  : "border-muted",
              )}
            >
              <role.icon className="h-10 w-10" />
              <div>
                <p className="font-semibold">{role.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm text-destructive font-medium text-center">
            {error}
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!selected || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Setting up..." : "Continue"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
