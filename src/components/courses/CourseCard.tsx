"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

const difficultyLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === course.instructorId;
  const showStatus = isOwner || user?.role === "ADMIN";

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base">
              {course.title}
            </CardTitle>
            <div className="flex gap-1 shrink-0">
              {isOwner && <Badge variant="secondary">My Course</Badge>}
              {showStatus && course.status !== "PUBLISHED" && (
                <Badge variant={statusVariant[course.status] ?? "outline"}>
                  {course.status}
                </Badge>
              )}
            </div>
          </div>
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
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{course.instructor?.name}</span>
            <span>{formatDate(course.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
