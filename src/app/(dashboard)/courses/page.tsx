"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourses } from "@/hooks/use-courses";
import { CourseCard } from "@/components/courses/CourseCard";
import { useAuthStore } from "@/store/auth.store";
import { Loader2, Plus, Search } from "lucide-react";

const CourseFormDialog = dynamic(
  () =>
    import("@/components/courses/CourseFormDialog").then(
      (m) => m.CourseFormDialog,
    ),
  { ssr: false },
);

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const limit = 9;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useCourses({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const canCreate = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Browse and manage courses</p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
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
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
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
            {data?.data?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
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
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <CourseFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
