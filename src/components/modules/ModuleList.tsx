"use client";

import { useState } from "react";
import { useModules, useReorderModules } from "@/hooks/use-modules";
import { ModuleFormDialog } from "@/components/modules/ModuleFormDialog";
import { DeleteModuleDialog } from "@/components/modules/DeleteModuleDialog";
import { LessonList } from "@/components/lessons/LessonList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import type { CourseModule } from "@/types";

interface ModuleListProps {
  courseId: string;
  canModify: boolean;
}

export function ModuleList({ courseId, canModify }: ModuleListProps) {
  const { data: modules, isLoading } = useModules(courseId);
  const reorderModules = useReorderModules();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editModule, setEditModule] = useState<CourseModule | null>(null);
  const [deleteModule, setDeleteModule] = useState<CourseModule | null>(null);

  function toggleExpand(moduleId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  async function handleReorder(moduleId: string, direction: "up" | "down") {
    if (!modules || modules.length < 2) return;

    const sorted = [...modules].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((m) => m.id === moduleId);
    if (currentIndex === -1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const reordered = sorted.map((m, i) => {
      if (i === currentIndex)
        return { id: m.id, order: sorted[swapIndex].order };
      if (i === swapIndex)
        return { id: m.id, order: sorted[currentIndex].order };
      return { id: m.id, order: m.order };
    });

    try {
      await reorderModules.mutateAsync({ courseId, modules: reordered });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to reorder modules."));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sorted = modules ? [...modules].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modules</h2>
        {canModify && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No modules yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canModify
              ? "Get started by adding the first module to this course."
              : "This course does not have any modules yet."}
          </p>
          {canModify && (
            <Button
              className="mt-4"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Module
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((mod, index) => {
            const isExpanded = expandedIds.has(mod.id);
            const isFirst = index === 0;
            const isLast = index === sorted.length - 1;

            return (
              <Card key={mod.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      className="flex items-start gap-3 text-left min-w-0"
                      onClick={() => toggleExpand(mod.id)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} module ${mod.title}`}
                    >
                      <Badge variant="secondary" className="mt-0.5 shrink-0">
                        {mod.order}
                      </Badge>
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base">{mod.title}</CardTitle>
                        {mod.description && (
                          <CardDescription className="line-clamp-2">
                            {mod.description}
                          </CardDescription>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                      )}
                    </button>

                    {canModify && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(mod.id, "up")}
                          disabled={isFirst || reorderModules.isPending}
                          aria-label={`Move module "${mod.title}" up`}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(mod.id, "down")}
                          disabled={isLast || reorderModules.isPending}
                          aria-label={`Move module "${mod.title}" down`}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditModule(mod)}
                          aria-label={`Edit module "${mod.title}"`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModule(mod)}
                          aria-label={`Delete module "${mod.title}"`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <LessonList
                      courseId={courseId}
                      moduleId={mod.id}
                      canModify={canModify}
                    />
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ModuleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        courseId={courseId}
      />

      {editModule && (
        <ModuleFormDialog
          open={!!editModule}
          onOpenChange={(open) => {
            if (!open) setEditModule(null);
          }}
          courseId={courseId}
          module={editModule}
        />
      )}

      {deleteModule && (
        <DeleteModuleDialog
          open={!!deleteModule}
          onOpenChange={(open) => {
            if (!open) setDeleteModule(null);
          }}
          courseId={courseId}
          module={deleteModule}
        />
      )}
    </div>
  );
}
