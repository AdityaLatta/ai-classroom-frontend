import { api } from "@/lib/api";
import type {
  Enrollment,
  EnrolledCourse,
  EnrolledStudent,
  PaginatedResponse,
} from "@/types";

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>(
    `/enrollments/courses/${courseId}/enroll`,
  );
  return data;
}

export async function unenrollFromCourse(courseId: string): Promise<void> {
  await api.delete(`/enrollments/courses/${courseId}/unenroll`);
}

export async function fetchMyCourses(
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<EnrolledCourse>> {
  const { data } = await api.get<PaginatedResponse<EnrolledCourse>>(
    "/enrollments/my-courses",
    { params },
  );
  return data;
}

export async function fetchCourseStudents(
  courseId: string,
): Promise<EnrolledStudent[]> {
  const { data } = await api.get<EnrolledStudent[]>(
    `/enrollments/courses/${courseId}/students`,
  );
  return data;
}

export async function fetchEnrollmentStatus(
  courseId: string,
): Promise<{ enrolled: boolean; status?: string }> {
  const { data } = await api.get<{ enrolled: boolean; status?: string }>(
    `/enrollments/courses/${courseId}/status`,
  );
  return data;
}
