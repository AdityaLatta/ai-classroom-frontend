"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EnrolledCourse } from "@/types";
import { formatDate } from "@/lib/utils";

interface EnrolledCourseCardProps {
  course: EnrolledCourse;
}

const difficultyLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  const { totalLessons, completedLessons, progressPercent } = course.progress;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <CardTitle className="line-clamp-2 text-base">
            {course.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {course.instructor?.name && <span>{course.instructor.name}</span>}
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {completedLessons}/{totalLessons} lessons ({progressPercent}%)
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Enrolled {formatDate(course.enrolledAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
