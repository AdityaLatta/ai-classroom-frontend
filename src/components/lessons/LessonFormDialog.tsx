"use client";

import { useForm, useWatch } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createLessonSchema } from "@/lib/validations/lesson";
import { useCreateLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { FormError } from "@/components/ui/form-error";
import { useState, useEffect } from "react";
import type { Lesson, LessonType } from "@/types";

interface LessonFormValues {
  title: string;
  type: LessonType;
  description?: string;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
}

interface LessonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  moduleId: string;
  lesson?: Lesson;
}

export function LessonFormDialog({
  open,
  onOpenChange,
  courseId,
  moduleId,
  lesson,
}: LessonFormDialogProps) {
  const isEditing = !!lesson;
  const [error, setError] = useState<string | null>(null);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const form = useForm<LessonFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createLessonSchema) as any,
    defaultValues: {
      title: lesson?.title ?? "",
      type: lesson?.type ?? "TEXT",
      description: lesson?.description ?? "",
      content: lesson?.content ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      durationMinutes: lesson?.durationMinutes ?? undefined,
    },
  });

  const watchedType = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    if (open) {
      form.reset({
        title: lesson?.title ?? "",
        type: lesson?.type ?? "TEXT",
        description: lesson?.description ?? "",
        content: lesson?.content ?? "",
        videoUrl: lesson?.videoUrl ?? "",
        durationMinutes: lesson?.durationMinutes ?? undefined,
      });
    }
  }, [open, lesson, form]);

  function handleOpenChange(next: boolean) {
    if (next) setError(null);
    onOpenChange(next);
  }

  async function onSubmit(values: LessonFormValues) {
    setError(null);

    // Clean up empty strings and irrelevant fields based on type
    const cleaned: Record<string, unknown> = {
      title: values.title,
      type: values.type,
      description: values.description || undefined,
      durationMinutes: values.durationMinutes || undefined,
    };

    if (values.type === "TEXT") {
      cleaned.content = values.content || undefined;
      cleaned.videoUrl = undefined;
    } else if (values.type === "VIDEO") {
      cleaned.videoUrl = values.videoUrl || undefined;
      cleaned.content = undefined;
    } else {
      cleaned.content = undefined;
      cleaned.videoUrl = undefined;
    }

    try {
      if (isEditing) {
        await updateLesson.mutateAsync({
          courseId,
          moduleId,
          lessonId: lesson.id,
          ...cleaned,
        });
        toast.success("Lesson updated successfully");
      } else {
        await createLesson.mutateAsync({
          courseId,
          moduleId,
          ...(cleaned as {
            title: string;
            type: "TEXT" | "VIDEO" | "LIVE_CLASS";
          }),
        });
        toast.success("Lesson created successfully");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          `Failed to ${isEditing ? "update" : "create"} lesson.`,
        ),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the lesson details below."
              : "Fill in the details to add a new lesson."}
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
                    <Input placeholder="Lesson title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TEXT">Text</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="LIVE_CLASS">Live Class</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of this lesson"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedType === "TEXT" && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Lesson content..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedType === "VIDEO" && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/video.mp4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes, optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 15"
                      min={1}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
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
                    : "Adding..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Lesson"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
