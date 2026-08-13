"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateEmployee } from "@/hooks/useRealEstateApi";
import { RequirePermission } from "@/components/auth/RequirePermission";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form-label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, ShieldCheck, UserPlus, CheckSquare, Square } from "lucide-react";
import { Permission, AccountType } from "@real-estate/types";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldContent, FieldTitle, FieldDescription } from "@/components/ui/field";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface PermissionGroup {
  resource: string;
  items: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    resource: "Listings Management",
    items: [
      { key: "listings:create", label: "Add New Listings", description: "Create new listing records in the Brokerage Engine mirror" },
      { key: "listings:edit", label: "Edit Listings", description: "Modify property details, prices, and photos" },
      { key: "listings:delete", label: "Delete Listings", description: "Remove listings from the active audit database" },
    ],
  },
  {
    resource: "Discrepancy Audit",
    items: [
      { key: "discrepancies:resolve", label: "Resolve / Ignore Discrepancies", description: "Mark external portal mismatches as resolved or ignored" },
    ],
  },
  {
    resource: "Agent Directory",
    items: [
      { key: "agents:create", label: "Add New Agent", description: "Enroll new agents into the brokerage directory" },
      { key: "agents:edit", label: "Edit Agent Details", description: "Update agent office states, service areas, and cross-post preferences" },
      { key: "agents:delete", label: "Delete Agent", description: "Remove agents from the system" },
    ],
  },
  {
    resource: "Social Cross-Post Matcher",
    items: [
      { key: "socialMatcher:use", label: "Use Social Matcher", description: "Run city and price queries to match agent cross-posting preferences" },
    ],
  },
  {
    resource: "User & Employee Administration",
    items: [
      { key: "users:create", label: "Add New Employee Users", description: "Create new employee accounts" },
      { key: "users:edit", label: "Edit Employee Users", description: "Modify existing employee profiles and assigned permission checkboxes" },
    ],
  },
];

export default function NewEmployeePage() {
  const router = useRouter();
  const createMutation = useCreateEmployee();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("employee");
  const [permissions, setPermissions] = useState<Permission[]>([
    "listings:create",
    "listings:edit",
    "discrepancies:resolve",
    "socialMatcher:use",
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const togglePermission = (perm: Permission) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleSelectAllGroup = (group: PermissionGroup) => {
    const groupKeys = group.items.map((i) => i.key);
    const allSelected = groupKeys.every((k) => permissions.includes(k));

    if (allSelected) {
      setPermissions(permissions.filter((p) => !groupKeys.includes(p)));
    } else {
      const merged = Array.from(new Set([...permissions, ...groupKeys]));
      setPermissions(merged);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Employee name is required";
    if (!email.trim()) newErrors.email = "Email address is required";
    if (!password) newErrors.password = "Initial password is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    createMutation.mutate(
      {
        name,
        email,
        accountType,
        permissions: accountType === "superAdmin" ? [] : permissions,
        password,
      },
      {
        onSuccess: (createdUser) => {
          toast.success(`Employee ${createdUser.name} created successfully!`);
          router.push("/employees");
        },
        onError: () => {
          toast.error("Failed to create employee user.");
        },
      }
    );
  };

  return (
    <RequirePermission permissions={["users:create", "users:edit"]}>
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          icon={<UserPlus className="size-6 text-primary" />}
          title="Create New Employee"
          description="Set up account credentials and configure explicit feature permissions"
          showBackButton
          backHref="/employees"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                1. Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FormLabel required htmlFor="name">Employee Full Name</FormLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g. Jane Doe"
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
                    placeholder="jane@cresentsothebys.com"
                    className={`bg-background border-input text-sm ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FormLabel required htmlFor="password">Initial Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="Minimum 6 characters"
                    className={`bg-background border-input text-sm ${errors.password ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <FormLabel required htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="Repeat password"
                    className={`bg-background border-input text-sm ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : ""}`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <FormLabel required>Account Type</FormLabel>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="radio"
                      name="accountType"
                      value="employee"
                      checked={accountType === "employee"}
                      onChange={() => setAccountType("employee")}
                      className="accent-primary"
                    />
                    Standard Employee (Custom Permissions)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="radio"
                      name="accountType"
                      value="superAdmin"
                      checked={accountType === "superAdmin"}
                      onChange={() => setAccountType("superAdmin")}
                      className="accent-primary"
                    />
                    Super Admin (Full Unrestricted Access)
                  </label>
                </div>
              </div>
            </div>

            {accountType === "employee" ? (
              <div className="space-y-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      2. Granted Resource Permissions
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Check each specific permission action granted to this employee
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {permissions.length} Action{permissions.length !== 1 ? "s" : ""} Selected
                  </Badge>
                </div>

                <div className="space-y-6">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupKeys = group.items.map((i) => i.key);
                    const allSelected = groupKeys.every((k) => permissions.includes(k));

                    return (
                      <div key={group.resource} className="rounded-lg border border-border p-4 bg-muted/20 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {group.resource}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAllGroup(group)}
                            className="text-[11px] h-7 px-2"
                          >
                            {allSelected ? "Deselect Group" : "Select All Group"}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.items.map((item) => {
                            const isChecked = permissions.includes(item.key);
                            return (
                              <FieldLabel key={item.key} className="cursor-pointer font-normal m-0 p-0 border-0 bg-transparent">
                                <Field orientation="horizontal" className={`p-3 rounded-md border text-xs transition-colors ${isChecked ? "bg-primary/10 border-primary text-foreground" : "bg-background border-border text-muted-foreground hover:border-border/80 hover:text-foreground"}`}>
                                  <Checkbox
                                    id={`perm-${item.key}`}
                                    checked={isChecked}
                                    onCheckedChange={() => togglePermission(item.key)}
                                    className="mt-0.5"
                                  />
                                  <FieldContent>
                                    <FieldTitle className="font-semibold text-foreground text-xs">{item.label}</FieldTitle>
                                    <FieldDescription className="text-[11px] text-muted-foreground mt-0.5">{item.description}</FieldDescription>
                                  </FieldContent>
                                </Field>
                              </FieldLabel>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium flex items-center gap-2">
                <ShieldCheck className="size-5 shrink-0" />
                <span>Super Admins automatically bypass permission checks and have full privileges across all modules.</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => router.push("/employees")} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="text-xs gap-2">
                <Save className="size-3.5" />
                {createMutation.isPending ? "Creating..." : "Save Employee Account"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </RequirePermission>
  );
}
