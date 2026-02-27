"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/hooks/use-courses";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CourseCard } from "@/components/courses/CourseCard";
import { useAuthStore } from "@/store/auth.store";
import { hasRole } from "@/lib/utils";
import { Loader2, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const CourseFormDialog = dynamic(
  () =>
    import("@/components/courses/CourseFormDialog").then(
      (m) => m.CourseFormDialog,
    ),
  { ssr: false },
);

export default function CoursesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const debouncedSearch = useDebouncedValue(search, 300);
  const createOpen = searchParams.get("create") === "true";
  const limit = 9;

  const { data, isLoading, error } = useCourses({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const canCreate = hasRole(user, "INSTRUCTOR", "ADMIN");

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Browse and manage courses</p>
        </div>
        {canCreate && (
          <Button onClick={() => updateParams({ create: "true" })}>
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value, page: null })}
          className="pl-9"
          aria-label="Search courses"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Failed to load courses. Please try again.
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {debouncedSearch
            ? "No courses match your search."
            : "No courses yet."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page >= data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <CourseFormDialog
        open={createOpen}
        onOpenChange={(open) => updateParams({ create: open ? "true" : null })}
      />
    </div>
  );
}
