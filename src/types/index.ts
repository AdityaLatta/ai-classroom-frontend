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
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
}

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  search?: string;
}

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

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
}
