import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateLessonProgress,
  fetchCourseProgress,
} from "@/lib/services/progress.service";
import type { ProgressStatus } from "@/types";

export const progressKeys = {
  all: ["progress"] as const,
  course: (courseId: string) =>
    [...progressKeys.all, "course", courseId] as const,
};

export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: progressKeys.course(courseId),
    queryFn: () => fetchCourseProgress(courseId),
    enabled: !!courseId,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      lessonId,
      status,
      progressPercent,
    }: {
      lessonId: string;
      courseId: string;
      status: ProgressStatus;
      progressPercent: number;
    }) => updateLessonProgress(lessonId, { status, progressPercent }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.course(variables.courseId),
      });
    },
  });
}
