import { api } from "@/lib/api";
import type {
  LessonProgressDTO,
  CourseProgressSummary,
  ProgressStatus,
} from "@/types";

export async function updateLessonProgress(
  lessonId: string,
  dto: { status: ProgressStatus; progressPercent: number },
): Promise<LessonProgressDTO> {
  const { data } = await api.put<LessonProgressDTO>(
    `/progress/lessons/${lessonId}`,
    dto,
  );
  return data;
}

export async function fetchCourseProgress(
  courseId: string,
): Promise<CourseProgressSummary> {
  const { data } = await api.get<CourseProgressSummary>(
    `/progress/courses/${courseId}`,
  );
  return data;
}
