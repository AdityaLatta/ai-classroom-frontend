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
import { useDeleteModule } from "@/hooks/use-modules";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";
import { useState } from "react";
import type { CourseModule } from "@/types";

interface DeleteModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  module: CourseModule;
  onDeleted?: () => void;
}

export function DeleteModuleDialog({
  open,
  onOpenChange,
  courseId,
  module,
  onDeleted,
}: DeleteModuleDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const deleteModule = useDeleteModule();

  async function handleDelete() {
    setError(null);
    try {
      await deleteModule.mutateAsync({ courseId, moduleId: module.id });
      toast.success("Module deleted successfully");
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete module."));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Module</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{module.title}&quot;? All
            lessons within this module will also be removed. This action cannot
            be undone.
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
            disabled={deleteModule.isPending}
          >
            {deleteModule.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
