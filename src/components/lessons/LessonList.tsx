"use client";

import { useState } from "react";
import {
  FileText,
  Video,
  Radio,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  BookOpen,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLessons, useReorderLessons } from "@/hooks/use-lessons";
import { LessonFormDialog } from "@/components/lessons/LessonFormDialog";
import { DeleteLessonDialog } from "@/components/lessons/DeleteLessonDialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import type { Lesson, LessonType } from "@/types";

interface LessonListProps {
  courseId: string;
  moduleId: string;
  canModify: boolean;
}

const typeIcon: Record<LessonType, React.ElementType> = {
  TEXT: FileText,
  VIDEO: Video,
  LIVE_CLASS: Radio,
};

const typeLabel: Record<LessonType, string> = {
  TEXT: "Text",
  VIDEO: "Video",
  LIVE_CLASS: "Live Class",
};

const typeBadgeVariant: Record<LessonType, "secondary" | "outline"> = {
  TEXT: "secondary",
  VIDEO: "outline",
  LIVE_CLASS: "outline",
};

export function LessonList({ courseId, moduleId, canModify }: LessonListProps) {
  const {
    data: lessons,
    isLoading,
    isError,
    error,
  } = useLessons(courseId, moduleId);
  const reorderLessons = useReorderLessons();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(
    undefined,
  );
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  function handleEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditingLesson(undefined);
    setFormOpen(true);
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    if (!lessons) return;

    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const reordered = sorted.map((lesson, i) => {
      if (i === index) return { id: lesson.id, order: sorted[swapIndex].order };
      if (i === swapIndex) return { id: lesson.id, order: sorted[index].order };
      return { id: lesson.id, order: lesson.order };
    });

    try {
      await reorderLessons.mutateAsync({
        courseId,
        moduleId,
        lessons: reordered,
      });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to reorder lessons."));
    }
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- Error state ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Failed to load lessons.")}
        </p>
      </div>
    );
  }

  const sorted = lessons ? [...lessons].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="space-y-4">
      {/* --- Empty state --- */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 space-y-2">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            No lessons yet
          </p>
          {canModify && (
            <Button size="sm" variant="outline" onClick={handleAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Lesson
            </Button>
          )}
        </div>
      )}

      {/* --- Lesson rows --- */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((lesson, index) => {
            const Icon = typeIcon[lesson.type];
            return (
              <div
                key={lesson.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-card px-4 py-3",
                  "transition-colors hover:bg-accent/50",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {lesson.title}
                    </span>
                    <Badge
                      variant={typeBadgeVariant[lesson.type]}
                      className="shrink-0"
                    >
                      {typeLabel[lesson.type]}
                    </Badge>
                  </div>
                  {lesson.durationMinutes != null && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{lesson.durationMinutes} min</span>
                    </div>
                  )}
                </div>

                {canModify && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReorder(index, "up")}
                      disabled={index === 0 || reorderLessons.isPending}
                      aria-label="Move lesson up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReorder(index, "down")}
                      disabled={
                        index === sorted.length - 1 || reorderLessons.isPending
                      }
                      aria-label="Move lesson down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(lesson)}
                      aria-label={`Edit ${lesson.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingLesson(lesson)}
                      aria-label={`Delete ${lesson.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- Add button (when lessons exist) --- */}
      {canModify && sorted.length > 0 && (
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="mr-1 h-4 w-4" />
          Add Lesson
        </Button>
      )}

      {/* --- Form dialog --- */}
      <LessonFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setEditingLesson(undefined);
        }}
        courseId={courseId}
        moduleId={moduleId}
        lesson={editingLesson}
      />

      {/* --- Delete dialog --- */}
      {deletingLesson && (
        <DeleteLessonDialog
          open={!!deletingLesson}
          onOpenChange={(next) => {
            if (!next) setDeletingLesson(null);
          }}
          courseId={courseId}
          moduleId={moduleId}
          lesson={deletingLesson}
        />
      )}
    </div>
  );
}
