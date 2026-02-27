import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  enrollInCourse,
  unenrollFromCourse,
  fetchMyCourses,
  fetchCourseStudents,
  fetchEnrollmentStatus,
} from "@/lib/services/enrollment.service";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  myCourses: (params?: object) =>
    [...enrollmentKeys.all, "my-courses", params] as const,
  students: (courseId: string) =>
    [...enrollmentKeys.all, "students", courseId] as const,
  status: (courseId: string) =>
    [...enrollmentKeys.all, "status", courseId] as const,
};

export function useMyCourses(
  params: { status?: string; page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: enrollmentKeys.myCourses(params),
    queryFn: () => fetchMyCourses(params),
    placeholderData: keepPreviousData,
  });
}

export function useCourseStudents(courseId: string) {
  return useQuery({
    queryKey: enrollmentKeys.students(courseId),
    queryFn: () => fetchCourseStudents(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollmentStatus(courseId: string) {
  return useQuery({
    queryKey: enrollmentKeys.status(courseId),
    queryFn: () => fetchEnrollmentStatus(courseId),
    enabled: !!courseId,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.status(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.myCourses(),
      });
    },
  });
}

export function useUnenroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => unenrollFromCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.status(courseId),
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.myCourses(),
      });
    },
  });
}
