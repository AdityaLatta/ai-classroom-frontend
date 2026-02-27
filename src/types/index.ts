// --- Course ---

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CourseDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  status: CourseStatus;
  thumbnailUrl: string | null;
  category: string | null;
  difficulty: CourseDifficulty | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  status?: CourseStatus;
  thumbnailUrl?: string;
  category?: string;
  difficulty?: CourseDifficulty;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  status?: CourseStatus;
  thumbnailUrl?: string | null;
  category?: string | null;
  difficulty?: CourseDifficulty | null;
}

export interface UpdateCourseInput extends UpdateCourseDTO {
  id: string;
}

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CourseStatus;
  category?: string;
  difficulty?: CourseDifficulty;
}

// --- Modules ---

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDTO {
  title: string;
  description?: string;
}

export interface UpdateModuleDTO {
  title?: string;
  description?: string | null;
}

export interface UpdateModuleInput extends UpdateModuleDTO {
  courseId: string;
  moduleId: string;
}

// --- Lessons ---

export type LessonType = "TEXT" | "VIDEO" | "LIVE_CLASS";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: string | null;
  videoUrl: string | null;
  order: number;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonDTO {
  title: string;
  type: LessonType;
  description?: string;
  content?: string;
  videoUrl?: string;
  durationMinutes?: number;
}

export interface UpdateLessonDTO {
  title?: string;
  type?: LessonType;
  description?: string | null;
  content?: string | null;
  videoUrl?: string | null;
  durationMinutes?: number | null;
}

export interface UpdateLessonInput extends UpdateLessonDTO {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

// --- Enrollments ---

export type EnrollmentStatus = "ACTIVE" | "DROPPED";

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
}

export interface EnrolledCourse extends Course {
  enrollmentId: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  progress: CourseProgress;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface EnrolledStudent {
  userId: string;
  userName: string;
  userEmail: string;
  enrollmentId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
}

// --- Progress ---

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface LessonProgressDTO {
  id: string;
  lessonId: string;
  status: ProgressStatus;
  progressPercent: number;
  completedAt: string | null;
  lastAccessedAt: string;
}

export interface CourseProgressSummary {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  progressPercent: number;
  lastAccessedAt: string | null;
}

// --- Pagination ---

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// --- Sessions ---

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
}
