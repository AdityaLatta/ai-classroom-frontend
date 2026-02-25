import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | AI Classroom",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
