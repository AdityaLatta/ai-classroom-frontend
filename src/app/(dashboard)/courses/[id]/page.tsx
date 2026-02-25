"use client";

import { use, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCourse } from "@/hooks/use-courses";
import { useAuthStore } from "@/store/auth.store";
import { ArrowLeft, Edit, Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const CourseFormDialog = dynamic(
  () =>
    import("@/components/courses/CourseFormDialog").then(
      (m) => m.CourseFormDialog,
    ),
  { ssr: false },
);

const DeleteCourseDialog = dynamic(
  () =>
    import("@/components/courses/DeleteCourseDialog").then(
      (m) => m.DeleteCourseDialog,
    ),
  { ssr: false },
);

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: course, isLoading, error } = useCourse(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canModify = user?.id === course?.instructorId || user?.role === "ADMIN";

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
        <div className="text-center py-12 text-destructive">
          Course not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground">
            By {course.instructor?.name ?? "Unknown"} &middot; Created{" "}
            {formatDate(course.createdAt)}
            {course.updatedAt !== course.createdAt && (
              <> &middot; Updated {formatDate(course.updatedAt)}</>
            )}
          </p>
        </div>

        {canModify && (
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{course.description}</p>
      </div>

      <CourseFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        course={course}
      />
      <DeleteCourseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        course={course}
        onDeleted={() => router.push("/courses")}
      />
    </div>
  );
}
