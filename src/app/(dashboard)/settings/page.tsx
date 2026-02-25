"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { SetPasswordForm } from "@/components/settings/SetPasswordForm";
import { SessionsTable } from "@/components/settings/SessionsTable";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const isOAuthUser = user?.authProvider && user.authProvider !== "local";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Tabs defaultValue="password">
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="password" className="mt-6">
          {isOAuthUser ? <SetPasswordForm /> : <ChangePasswordForm />}
        </TabsContent>
        <TabsContent value="sessions" className="mt-6">
          <SessionsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
