"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { useCourseProgress } from "@/hooks/use-progress";
import { formatDate } from "@/lib/utils";
import { BookOpen, CheckCircle2, Clock, Loader2 } from "lucide-react";

interface CourseProgressCardProps {
  courseId: string;
}

export function CourseProgressCard({ courseId }: CourseProgressCardProps) {
  const { data: progress, isLoading, error } = useCourseProgress(courseId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">
            Failed to load progress.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProgressBar value={progress.progressPercent} />

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="text-lg font-semibold">
              {progress.completedLessons}
              <span className="text-sm font-normal text-muted-foreground">
                /{progress.totalLessons}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">In Progress</span>
            </div>
            <p className="text-lg font-semibold">
              {progress.inProgressLessons}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-lg font-semibold">{progress.totalLessons}</p>
          </div>
        </div>

        {progress.lastAccessedAt && (
          <p className="text-xs text-muted-foreground">
            Last accessed {formatDate(progress.lastAccessedAt)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
