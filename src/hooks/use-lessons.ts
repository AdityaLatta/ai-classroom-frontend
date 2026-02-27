import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLessons,
  createLesson,
  updateLesson,
  reorderLessons,
  deleteLesson,
} from "@/lib/services/lesson.service";
import type { CreateLessonDTO, UpdateLessonInput } from "@/types";

export const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (moduleId: string) => [...lessonKeys.lists(), moduleId] as const,
};

export function useLessons(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: lessonKeys.list(moduleId),
    queryFn: () => fetchLessons(courseId, moduleId),
    enabled: !!courseId && !!moduleId,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      ...dto
    }: CreateLessonDTO & { courseId: string; moduleId: string }) =>
      createLesson(courseId, moduleId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lessonKeys.list(variables.moduleId),
      });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, lessonId, ...dto }: UpdateLessonInput) =>
      updateLesson(courseId, moduleId, lessonId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lessonKeys.list(variables.moduleId),
      });
    },
  });
}

export function useReorderLessons() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      lessons,
    }: {
      courseId: string;
      moduleId: string;
      lessons: { id: string; order: number }[];
    }) => reorderLessons(courseId, moduleId, lessons),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lessonKeys.list(variables.moduleId),
      });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      lessonId,
    }: {
      courseId: string;
      moduleId: string;
      lessonId: string;
    }) => deleteLesson(courseId, moduleId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lessonKeys.list(variables.moduleId),
      });
    },
  });
}
