"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createModuleSchema } from "@/lib/validations/module";
import { useCreateModule, useUpdateModule } from "@/hooks/use-modules";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";
import { useState, useEffect } from "react";
import type { CourseModule } from "@/types";

interface ModuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  module?: CourseModule;
}

export function ModuleFormDialog({
  open,
  onOpenChange,
  courseId,
  module,
}: ModuleFormDialogProps) {
  const isEditing = !!module;
  const [error, setError] = useState<string | null>(null);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();

  const form = useForm<z.infer<typeof createModuleSchema>>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      title: module?.title ?? "",
      description: module?.description ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: module?.title ?? "",
        description: module?.description ?? "",
      });
    }
  }, [open, module, form]);

  function handleOpenChange(next: boolean) {
    if (next) setError(null);
    onOpenChange(next);
  }

  async function onSubmit(values: z.infer<typeof createModuleSchema>) {
    setError(null);
    const cleaned = {
      ...values,
      description: values.description || undefined,
    };
    try {
      if (isEditing) {
        await updateModule.mutateAsync({
          courseId,
          moduleId: module.id,
          ...cleaned,
        });
        toast.success("Module updated successfully");
      } else {
        await createModule.mutateAsync({ courseId, ...cleaned });
        toast.success("Module created successfully");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          `Failed to ${isEditing ? "update" : "create"} module.`,
        ),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Module" : "Add Module"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the module details below."
              : "Fill in the details to add a new module."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Module title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Module description (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError message={error} />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Module"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
