import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses | AI Classroom",
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
