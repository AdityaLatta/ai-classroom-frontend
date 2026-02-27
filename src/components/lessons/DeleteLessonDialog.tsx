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
import { useDeleteLesson } from "@/hooks/use-lessons";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";
import { useState } from "react";
import type { Lesson } from "@/types";

interface DeleteLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  moduleId: string;
  lesson: Lesson;
  onDeleted?: () => void;
}

export function DeleteLessonDialog({
  open,
  onOpenChange,
  courseId,
  moduleId,
  lesson,
  onDeleted,
}: DeleteLessonDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteLesson = useDeleteLesson();

  async function handleDelete() {
    setError(null);
    try {
      await deleteLesson.mutateAsync({
        courseId,
        moduleId,
        lessonId: lesson.id,
      });
      toast.success("Lesson deleted successfully");
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete lesson."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Lesson</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{lesson.title}&quot;? This
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
            disabled={deleteLesson.isPending}
          >
            {deleteLesson.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
