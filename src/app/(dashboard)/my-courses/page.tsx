"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMyCourses } from "@/hooks/use-enrollments";
import { EnrolledCourseCard } from "@/components/enrollments/EnrolledCourseCard";
import { Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function MyCoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 12;

  const { data, isLoading, error } = useMyCourses({
    page,
    limit,
    status: "ACTIVE",
  });

  const courses = data?.data ?? [];
  const meta = data?.meta;

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/my-courses?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">
          Courses you&apos;re enrolled in and your learning progress.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          Failed to load your courses.
        </div>
      )}

      {!isLoading && !error && courses.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">No courses yet</h2>
            <p className="text-sm text-muted-foreground">
              Browse available courses and enroll to start learning.
            </p>
          </div>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      )}

      {courses.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <EnrolledCourseCard key={course.id} course={course} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
