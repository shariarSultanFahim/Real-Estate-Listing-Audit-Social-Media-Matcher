"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/useRealEstateApi";
import { usePermission } from "@/components/auth/AuthProvider";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Shield, UserCheck, CheckCircle, Clock } from "lucide-react";
import { Permission } from "@real-estate/types";

const PERMISSION_LABELS: Record<Permission, string> = {
  "listings:create": "Add Listing",
  "listings:edit": "Edit Listing",
  "listings:delete": "Delete Listing",
  "discrepancies:resolve": "Resolve Discrepancy",
  "agents:create": "Add Agent",
  "agents:edit": "Edit Agent",
  "agents:delete": "Delete Agent",
  "socialMatcher:use": "Use Matcher",
  "users:create": "Add User",
  "users:edit": "Edit User",
};

export default function EmployeesPage() {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();
  const [search, setSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");

  const canCreateUsers = usePermission("users:create");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      accountTypeFilter === "all" || u.accountType === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <RequirePermission permissions={["users:edit", "users:create"]}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <UserCheck className="size-6 text-primary" /> Employee &amp; User Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage system employees, account privileges, and granular feature permissions
            </p>
          </div>

          {canCreateUsers && (
            <Button onClick={() => router.push("/employees/new")} className="text-xs gap-1.5 self-start md:self-auto">
              <UserPlus className="size-4" /> Add Employee
            </Button>
          )}
        </div>

        {/* Filter bar */}
        <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or email..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-muted-foreground">Account Type:</span>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              {["all", "superAdmin", "employee"].map((type) => (
                <button
                  key={type}
                  onClick={() => setAccountTypeFilter(type)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    accountTypeFilter === type
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "All Accounts" : type === "superAdmin" ? "Super Admins" : "Employees"}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* User Table */}
        <div className="rounded-md border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Employee</TableHead>
                <TableHead className="text-xs font-semibold">Account Type</TableHead>
                <TableHead className="text-xs font-semibold">Granted Permissions</TableHead>
                <TableHead className="text-xs font-semibold">Last Login</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    Loading employee directory...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No employees matching filter criteria found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    onClick={() => router.push(`/employees/${u.id}`)}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <TableCell>
                      <div className="font-semibold text-sm text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.accountType === "superAdmin" ? "default" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {u.accountType === "superAdmin" ? "Super Admin" : "Employee"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.accountType === "superAdmin" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="size-3.5" /> Full Access (All Granted)
                        </span>
                      ) : u.permissions.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">No permissions</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {u.permissions.map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px] bg-muted/30">
                              {PERMISSION_LABELS[p] || p}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.lastLoginAt ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-muted-foreground" />
                          {new Date(u.lastLoginAt).toLocaleDateString()} {new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/employees/${u.id}`);
                        }}
                        className="text-xs h-8 px-2"
                      >
                        Edit User
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </RequirePermission>
  );
}
