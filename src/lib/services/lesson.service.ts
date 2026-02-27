import { api } from "@/lib/api";
import type { Lesson, CreateLessonDTO, UpdateLessonDTO } from "@/types";

export async function fetchLessons(
  courseId: string,
  moduleId: string,
): Promise<Lesson[]> {
  const { data } = await api.get<Lesson[]>(
    `/courses/${courseId}/modules/${moduleId}/lessons`,
  );
  return data;
}

export async function createLesson(
  courseId: string,
  moduleId: string,
  dto: CreateLessonDTO,
): Promise<Lesson> {
  const { data } = await api.post<Lesson>(
    `/courses/${courseId}/modules/${moduleId}/lessons`,
    dto,
  );
  return data;
}

export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  dto: UpdateLessonDTO,
): Promise<Lesson> {
  const { data } = await api.put<Lesson>(
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    dto,
  );
  return data;
}

export async function reorderLessons(
  courseId: string,
  moduleId: string,
  lessons: { id: string; order: number }[],
): Promise<Lesson[]> {
  const { data } = await api.put<Lesson[]>(
    `/courses/${courseId}/modules/${moduleId}/lessons/reorder`,
    { lessons },
  );
  return data;
}

export async function deleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
): Promise<void> {
  await api.delete(
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
  );
}
