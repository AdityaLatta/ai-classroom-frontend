import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from "@/test/test-utils";
import { DeleteCourseDialog } from "@/components/courses/DeleteCourseDialog";
import { toast } from "sonner";
import type { Course } from "@/types";

const mockDeleteMutateAsync = vi.fn();

vi.mock("@/hooks/use-courses", () => ({
  useDeleteCourse: () => ({
    mutateAsync: mockDeleteMutateAsync,
    isPending: false,
  }),
}));

const mockCourse: Course = {
  id: "c1",
  title: "Course to Delete",
  description: "This course will be deleted.",
  instructorId: "u1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("DeleteCourseDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnDeleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the course title in the confirmation message", () => {
    renderWithProviders(
      <DeleteCourseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    expect(screen.getByText(/course to delete/i)).toBeInTheDocument();
  });

  it("renders the warning about irreversibility", () => {
    renderWithProviders(
      <DeleteCourseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("calls delete mutation on confirm", async () => {
    mockDeleteMutateAsync.mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteCourseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
        onDeleted={mockOnDeleted}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("c1");
    });
  });

  it("shows success toast and calls callbacks on success", async () => {
    mockDeleteMutateAsync.mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteCourseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
        onDeleted={mockOnDeleted}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Course deleted successfully");
      expect(mockOnDeleted).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("shows error message on failure", async () => {
    mockDeleteMutateAsync.mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteCourseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText("Failed to delete course."),
    ).toBeInTheDocument();
  });

  it("calls onOpenChange(false) on cancel", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <DeleteCourseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        course={mockCourse}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
