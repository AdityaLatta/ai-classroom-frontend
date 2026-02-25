import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";
import { CourseFormDialog } from "@/components/courses/CourseFormDialog";
import type { Course } from "@/types";

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

vi.mock("@/hooks/use-courses", () => ({
  useCreateCourse: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
  useUpdateCourse: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
}));

const mockCourse: Course = {
  id: "c1",
  title: "Existing Course",
  description: "An existing course description that is long enough.",
  instructorId: "u1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("CourseFormDialog", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Create Course" title when no course prop', () => {
    renderWithProviders(
      <CourseFormDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(
      screen.getByRole("heading", { name: "Create Course" }),
    ).toBeInTheDocument();
  });

  it('renders "Edit Course" title when course prop is provided', () => {
    renderWithProviders(
      <CourseFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    expect(screen.getByText("Edit Course")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    renderWithProviders(
      <CourseFormDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it('shows "Create Course" button in create mode', () => {
    renderWithProviders(
      <CourseFormDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    expect(
      screen.getByRole("button", { name: "Create Course" }),
    ).toBeInTheDocument();
  });

  it('shows "Save Changes" button in edit mode', () => {
    renderWithProviders(
      <CourseFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <CourseFormDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Create Course" }));

    await waitFor(() => {
      expect(
        screen.getByText(/title must be at least 3 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("calls createCourse on valid submit in create mode", async () => {
    mockCreateMutateAsync.mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(
      <CourseFormDialog open={true} onOpenChange={mockOnOpenChange} />,
    );

    await user.type(screen.getByLabelText("Title"), "New Course Title");
    await user.type(
      screen.getByLabelText("Description"),
      "A valid description that is long enough to pass validation.",
    );
    await user.click(screen.getByRole("button", { name: "Create Course" }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        title: "New Course Title",
        description:
          "A valid description that is long enough to pass validation.",
      });
    });
  });

  it("calls updateCourse on valid submit in edit mode", async () => {
    mockUpdateMutateAsync.mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(
      <CourseFormDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "c1",
        title: "Updated Title",
        description: "An existing course description that is long enough.",
      });
    });
  });
});
