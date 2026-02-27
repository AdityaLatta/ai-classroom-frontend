"use client";

import { Button } from "@/components/ui/button";
import {
  useEnroll,
  useUnenroll,
  useEnrollmentStatus,
} from "@/hooks/use-enrollments";
import { useAuthStore } from "@/store/auth.store";
import { hasRole } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const { user } = useAuthStore();
  const { data: status, isLoading: isCheckingStatus } =
    useEnrollmentStatus(courseId);
  const enroll = useEnroll();
  const unenroll = useUnenroll();

  if (!hasRole(user, "STUDENT")) {
    return null;
  }

  async function handleEnroll() {
    try {
      await enroll.mutateAsync(courseId);
      toast.success("Successfully enrolled in the course");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to enroll in the course."));
    }
  }

  async function handleUnenroll() {
    try {
      await unenroll.mutateAsync(courseId);
      toast.success("Successfully unenrolled from the course");
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Failed to unenroll from the course."),
      );
    }
  }

  if (isCheckingStatus) {
    return (
      <Button disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (status?.enrolled) {
    return (
      <Button
        variant="outline"
        onClick={handleUnenroll}
        disabled={unenroll.isPending}
      >
        {unenroll.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Unenrolling...
          </>
        ) : (
          "Unenroll"
        )}
      </Button>
    );
  }

  return (
    <Button onClick={handleEnroll} disabled={enroll.isPending}>
      {enroll.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        "Enroll"
      )}
    </Button>
  );
}
