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

export function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === course.instructorId;

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base">
              {course.title}
            </CardTitle>
            {isOwner && <Badge variant="secondary">My Course</Badge>}
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
