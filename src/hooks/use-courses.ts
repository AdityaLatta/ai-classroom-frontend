import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchCourses,
  fetchCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/lib/services/course.service";
import type {
  CreateCourseDTO,
  UpdateCourseInput,
  ListCoursesParams,
} from "@/types";

export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (params: ListCoursesParams) => [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

export function useCourses(params: ListCoursesParams = {}) {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => fetchCourses(params),
    placeholderData: keepPreviousData,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => fetchCourse(id),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCourseDTO) => createCourse(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: UpdateCourseInput) => updateCourse(variables),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: courseKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}
