import { api } from "@/lib/api";
import type { CourseModule, CreateModuleDTO, UpdateModuleDTO } from "@/types";

export async function fetchModules(courseId: string): Promise<CourseModule[]> {
  const { data } = await api.get<CourseModule[]>(
    `/courses/${courseId}/modules`,
  );
  return data;
}

export async function createModule(
  courseId: string,
  dto: CreateModuleDTO,
): Promise<CourseModule> {
  const { data } = await api.post<CourseModule>(
    `/courses/${courseId}/modules`,
    dto,
  );
  return data;
}

export async function updateModule(
  courseId: string,
  moduleId: string,
  dto: UpdateModuleDTO,
): Promise<CourseModule> {
  const { data } = await api.put<CourseModule>(
    `/courses/${courseId}/modules/${moduleId}`,
    dto,
  );
  return data;
}

export async function reorderModules(
  courseId: string,
  modules: { id: string; order: number }[],
): Promise<CourseModule[]> {
  const { data } = await api.put<CourseModule[]>(
    `/courses/${courseId}/modules/reorder`,
    { modules },
  );
  return data;
}

export async function deleteModule(
  courseId: string,
  moduleId: string,
): Promise<void> {
  await api.delete(`/courses/${courseId}/modules/${moduleId}`);
}
