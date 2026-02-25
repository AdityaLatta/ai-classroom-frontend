"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteCourse } from "@/hooks/use-courses";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";
import { useState } from "react";
import type { Course } from "@/types";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onDeleted?: () => void;
}

export function DeleteCourseDialog({
  open,
  onOpenChange,
  course,
  onDeleted,
}: DeleteCourseDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteCourse = useDeleteCourse();

  async function handleDelete() {
    setError(null);
    try {
      await deleteCourse.mutateAsync(course.id);
      toast.success("Course deleted successfully");
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete course."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Course</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{course.title}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <FormError message={error} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCourse.isPending}
          >
            {deleteCourse.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
