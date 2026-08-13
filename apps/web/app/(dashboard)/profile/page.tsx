"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useUpdateProfile } from "@/hooks/useRealEstateApi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form-label";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Lock, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";

    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters";
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    updateProfileMutation.mutate(
      {
        id: currentUser.id,
        data: {
          name,
          email,
          ...(newPassword ? { password: newPassword } : {}),
        },
      },
      {
        onSuccess: (updatedUser) => {
          setCurrentUser({
            ...currentUser,
            name: updatedUser.name,
            email: updatedUser.email,
          });
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Profile updated successfully!");
        },
        onError: () => {
          toast.error("Failed to update profile.");
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="My Account Profile"
        description="Manage your personal account credentials and security settings"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6 border-border bg-card">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div className="size-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={currentUser.accountType === "superAdmin" ? "default" : "secondary"} className="text-[10px]">
                  {currentUser.accountType === "superAdmin" ? "Super Admin Account" : "Employee Account"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserIcon className="size-4 text-primary" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FormLabel required htmlFor="name">Full Name</FormLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`bg-background border-input text-sm ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <FormLabel required htmlFor="email">Email Address</FormLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={`bg-background border-input text-sm ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="size-4 text-primary" /> Security &amp; Password
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Leave blank if you do not wish to change your password
              </p>
            </div>

            <div className="space-y-3 w-full">
              <div className="space-y-1.5">
                <FormLabel htmlFor="newPassword">New Password</FormLabel>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
                  }}
                  placeholder="Enter new password (min 6 chars)"
                  className={`bg-background border-input text-sm ${errors.newPassword ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  placeholder="Confirm new password"
                  className={`bg-background border-input text-sm ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : ""}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" /> Account Permissions (Read-Only)
            </h3>
            {currentUser.accountType === "superAdmin" ? (
              <p className="text-xs text-muted-foreground">
                As a <strong className="text-foreground font-semibold">Super Admin</strong>, you implicitly have full unrestricted permissions across all brokerage modules.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {currentUser.permissions.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No explicit permissions assigned.</span>
                ) : (
                  currentUser.permissions.map((p) => (
                    <Badge key={p} variant="outline" className="text-xs bg-muted/40 font-mono">
                      {p}
                    </Badge>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" disabled={updateProfileMutation.isPending} className="text-xs gap-2">
              <Save className="size-3.5" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Profile Changes"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
