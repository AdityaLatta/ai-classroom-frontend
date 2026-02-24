"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { passwordSchema } from "@/lib/validations";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"form" | "success" | "error">(
    token ? "form" : "error",
  );
  const [errorMessage, setErrorMessage] = useState(
    token
      ? ""
      : "Reset token is missing. Please request a new password reset link.",
  );

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
      });
      setStatus("success");
      toast.success("Password reset successfully!");
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Failed to reset password. The link may have expired.",
      );
      setStatus("error");
      setErrorMessage(msg);
      toast.error(msg);
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Password Reset
        </h1>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now sign in with
          your new password.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset Failed
        </h1>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <div className="flex gap-3 mt-4">
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/forgot-password">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Reset your password
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter your new password below
      </p>

      <div className="grid gap-6 mt-6 pt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
