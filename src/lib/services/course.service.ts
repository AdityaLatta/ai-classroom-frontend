import { api } from "@/lib/api";
import type {
  Course,
  CreateCourseDTO,
  UpdateCourseDTO,
  ListCoursesParams,
  PaginatedResponse,
} from "@/types";

export async function fetchCourses(params: ListCoursesParams = {}) {
  const { data } = await api.get<PaginatedResponse<Course>>("/courses", {
    params,
  });
  return data;
}

export async function fetchCourse(id: string) {
  const { data } = await api.get<Course>(`/courses/${id}`);
  return data;
}

export async function createCourse(dto: CreateCourseDTO) {
  const { data } = await api.post<Course>("/courses", dto);
  return data;
}

export async function updateCourse({
  id,
  ...dto
}: UpdateCourseDTO & { id: string }) {
  const { data } = await api.put<Course>(`/courses/${id}`, dto);
  return data;
}

export async function deleteCourse(id: string) {
  await api.delete(`/courses/${id}`);
}
