import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHookWithProviders, waitFor } from "@/test/test-utils";
import {
  useCourses,
  useCourse,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  courseKeys,
} from "@/hooks/use-courses";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

const mockCourse = {
  id: "c1",
  title: "Test Course",
  description: "A test course description",
  instructorId: "u1",
  instructor: { id: "u1", name: "Instructor", email: "i@test.com" },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockPaginatedResponse = {
  data: [mockCourse],
  meta: { page: 1, limit: 9, total: 1, totalPages: 1 },
};

describe("courseKeys", () => {
  it("generates correct key structure", () => {
    expect(courseKeys.all).toEqual(["courses"]);
    expect(courseKeys.lists()).toEqual(["courses", "list"]);
    expect(courseKeys.list({ page: 1 })).toEqual([
      "courses",
      "list",
      { page: 1 },
    ]);
    expect(courseKeys.details()).toEqual(["courses", "detail"]);
    expect(courseKeys.detail("c1")).toEqual(["courses", "detail", "c1"]);
  });
});

describe("useCourses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches courses list", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const { result } = renderHookWithProviders(() => useCourses());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith("/courses", { params: {} });
    expect(result.current.data).toEqual(mockPaginatedResponse);
  });

  it("passes params to API", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

    const params = { page: 2, limit: 10, search: "test" };
    renderHookWithProviders(() => useCourses(params));

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith("/courses", { params }),
    );
  });
});

describe("useCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a single course by id", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ data: mockCourse });

    const { result } = renderHookWithProviders(() => useCourse("c1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith("/courses/c1");
    expect(result.current.data).toEqual(mockCourse);
  });

  it("is disabled when id is empty", () => {
    const { result } = renderHookWithProviders(() => useCourse(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /courses", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({ data: mockCourse });

    const { result } = renderHookWithProviders(() => useCreateCourse());

    await result.current.mutateAsync({
      title: "New Course",
      description: "A new course description",
    });

    expect(api.post).toHaveBeenCalledWith("/courses", {
      title: "New Course",
      description: "A new course description",
    });
  });
});

describe("useUpdateCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls PUT /courses/:id", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.put).mockResolvedValue({ data: mockCourse });

    const { result } = renderHookWithProviders(() => useUpdateCourse());

    await result.current.mutateAsync({
      id: "c1",
      title: "Updated Title",
    });

    expect(api.put).toHaveBeenCalledWith("/courses/c1", {
      title: "Updated Title",
    });
  });
});

describe("useDeleteCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls DELETE /courses/:id", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.delete).mockResolvedValue({});

    const { result } = renderHookWithProviders(() => useDeleteCourse());

    await result.current.mutateAsync("c1");

    expect(api.delete).toHaveBeenCalledWith("/courses/c1");
  });
});
