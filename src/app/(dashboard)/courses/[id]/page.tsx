"use client";

import { use, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourse } from "@/hooks/use-courses";
import { useAuthStore } from "@/store/auth.store";
import { ArrowLeft, Edit, Loader2, Trash2 } from "lucide-react";
import { formatDate, hasRole } from "@/lib/utils";
import Link from "next/link";
import { ModuleList } from "@/components/modules/ModuleList";
import { EnrollButton } from "@/components/enrollments/EnrollButton";
import { CourseProgressCard } from "@/components/progress/CourseProgressCard";
import { StudentList } from "@/components/enrollments/StudentList";
import { useEnrollmentStatus } from "@/hooks/use-enrollments";

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

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const difficultyLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: course, isLoading, error } = useCourse(id);
  const { data: enrollmentStatus } = useEnrollmentStatus(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canModify = user?.id === course?.instructorId || hasRole(user, "ADMIN");
  const isInstructor =
    user?.id === course?.instructorId || hasRole(user, "INSTRUCTOR", "ADMIN");
  const isEnrolled = enrollmentStatus?.enrolled === true;

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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {course.title}
            </h1>
            <Badge
              variant={course.status === "PUBLISHED" ? "default" : "secondary"}
            >
              {statusLabel[course.status] ?? course.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            By {course.instructor?.name ?? "Unknown"} &middot; Created{" "}
            {formatDate(course.createdAt)}
            {course.updatedAt !== course.createdAt && (
              <> &middot; Updated {formatDate(course.updatedAt)}</>
            )}
          </p>
          <div className="flex gap-1 flex-wrap">
            {course.difficulty && (
              <Badge variant="outline" className="text-xs font-normal">
                {difficultyLabel[course.difficulty] ?? course.difficulty}
              </Badge>
            )}
            {course.category && (
              <Badge variant="outline" className="text-xs font-normal">
                {course.category}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {hasRole(user, "STUDENT") && <EnrollButton courseId={course.id} />}
          {canModify && (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap">{course.description}</p>
      </div>

      {/* Progress card for enrolled students */}
      {isEnrolled && <CourseProgressCard courseId={course.id} />}

      {/* Tabs: Content and Students */}
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          {isInstructor && canModify && (
            <TabsTrigger value="students">Students</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="content" className="mt-4">
          <ModuleList courseId={course.id} canModify={canModify ?? false} />
        </TabsContent>
        {isInstructor && canModify && (
          <TabsContent value="students" className="mt-4">
            <StudentList courseId={course.id} />
          </TabsContent>
        )}
      </Tabs>

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
