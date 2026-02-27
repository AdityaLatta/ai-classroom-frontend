import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchModules,
  createModule,
  updateModule,
  reorderModules,
  deleteModule,
} from "@/lib/services/module.service";
import type { CreateModuleDTO, UpdateModuleInput } from "@/types";

export const moduleKeys = {
  all: ["modules"] as const,
  lists: () => [...moduleKeys.all, "list"] as const,
  list: (courseId: string) => [...moduleKeys.lists(), courseId] as const,
};

export function useModules(courseId: string) {
  return useQuery({
    queryKey: moduleKeys.list(courseId),
    queryFn: () => fetchModules(courseId),
    enabled: !!courseId,
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      ...dto
    }: CreateModuleDTO & { courseId: string }) => createModule(courseId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.list(variables.courseId),
      });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, ...dto }: UpdateModuleInput) =>
      updateModule(courseId, moduleId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.list(variables.courseId),
      });
    },
  });
}

export function useReorderModules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      modules,
    }: {
      courseId: string;
      modules: { id: string; order: number }[];
    }) => reorderModules(courseId, modules),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.list(variables.courseId),
      });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
    }: {
      courseId: string;
      moduleId: string;
    }) => deleteModule(courseId, moduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleKeys.list(variables.courseId),
      });
    },
  });
}
