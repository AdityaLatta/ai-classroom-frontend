import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | AI Classroom",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
