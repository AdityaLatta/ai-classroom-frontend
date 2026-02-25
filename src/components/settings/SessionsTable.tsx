"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useSessions,
  useRevokeSession,
  useLogoutAll,
} from "@/hooks/use-sessions";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function SessionsTable() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeSession = useRevokeSession();
  const logoutAll = useLogoutAll();
  const { logout } = useAuthStore();
  const router = useRouter();

  async function handleRevoke(id: string) {
    try {
      await revokeSession.mutateAsync(id);
      toast.success("Session revoked");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to revoke session."));
    }
  }

  async function handleLogoutAll() {
    try {
      await logoutAll.mutateAsync();
      toast.success("All sessions terminated");
      await logout();
      router.push("/login");
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(err, "Failed to logout all sessions."),
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active sessions across devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">
            Failed to load sessions.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions?.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {session.deviceInfo || "Unknown device"}
                    </TableCell>
                    <TableCell>{session.ipAddress}</TableCell>
                    <TableCell>
                      {new Date(session.lastUsedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(session.id)}
                        disabled={revokeSession.isPending}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sessions?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No active sessions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleLogoutAll}
                disabled={logoutAll.isPending}
              >
                {logoutAll.isPending
                  ? "Logging out..."
                  : "Logout All Devices"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
