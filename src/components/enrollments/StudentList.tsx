"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCourseStudents } from "@/hooks/use-enrollments";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { EnrollmentStatus } from "@/types";

interface StudentListProps {
  courseId: string;
}

const statusVariant: Record<EnrollmentStatus, "default" | "secondary"> = {
  ACTIVE: "default",
  DROPPED: "secondary",
};

export function StudentList({ courseId }: StudentListProps) {
  const { data: students, isLoading, error } = useCourseStudents(courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load enrolled students.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Enrolled Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students?.map((student) => (
          <TableRow key={student.enrollmentId}>
            <TableCell>{student.userName}</TableCell>
            <TableCell>{student.userEmail}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[student.status]}>
                {student.status}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(student.enrolledAt)}</TableCell>
          </TableRow>
        ))}
        {(students?.length ?? 0) === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-muted-foreground"
            >
              No students enrolled yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
