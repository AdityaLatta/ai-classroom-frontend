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
import { createCourseSchema } from "@/lib/validations/course";
import { useCreateCourse, useUpdateCourse } from "@/hooks/use-courses";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Course } from "@/types";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
}: CourseFormDialogProps) {
  const isEditing = !!course;
  const [error, setError] = useState<string | null>(null);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const form = useForm<z.infer<typeof createCourseSchema>>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: course?.title ?? "",
      description: course?.description ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: course?.title ?? "",
        description: course?.description ?? "",
      });
      setError(null);
    }
  }, [open, course, form]);

  async function onSubmit(values: z.infer<typeof createCourseSchema>) {
    setError(null);
    try {
      if (isEditing) {
        await updateCourse.mutateAsync({ id: course.id, ...values });
        toast.success("Course updated successfully");
      } else {
        await createCourse.mutateAsync(values);
        toast.success("Course created successfully");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          `Failed to ${isEditing ? "update" : "create"} course.`,
        ),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Course" : "Create Course"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the course details below."
              : "Fill in the details to create a new course."}
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
                    <Input placeholder="Course title" {...field} />
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
                      placeholder="Course description"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
                    : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
