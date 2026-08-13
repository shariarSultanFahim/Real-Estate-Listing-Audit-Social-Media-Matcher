"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Permission } from "@real-estate/types";
import { usePermission, useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface RequirePermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  superAdminOnly?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  permission,
  permissions,
  superAdminOnly,
  children,
  fallback,
}: RequirePermissionProps) {
  const router = useRouter();
  const { currentUser } = useAuth();

  const checkedPermissions = permissions || (permission ? [permission] : []);
  
  const hasAccess = React.useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.accountType === "superAdmin") return true;
    if (superAdminOnly) return false;
    if (checkedPermissions.length === 0) return true;
    return checkedPermissions.some((p) => currentUser.permissions.includes(p));
  }, [currentUser, checkedPermissions, superAdminOnly]);

  if (!hasAccess) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 my-8">
        <ShieldAlert className="size-12 text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          You do not have permission to view this page or resource. Please contact a Super Admin if you believe this is an error.
        </p>
        <Button variant="outline" onClick={() => router.push("/")} className="text-xs">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
