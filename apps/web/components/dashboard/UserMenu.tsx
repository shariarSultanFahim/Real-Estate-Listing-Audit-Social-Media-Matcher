"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { MOCK_USERS } from "@/lib/mock-data/users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, Shield, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { currentUser, loginByEmail, logout } = useAuth();
  const router = useRouter();

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2 h-9 text-xs">
          <Avatar className="size-6 border border-border">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground hidden sm:inline-block max-w-[120px] truncate">
            {currentUser.name}
          </span>
          <Badge variant={currentUser.accountType === "superAdmin" ? "default" : "secondary"} className="text-[9px] px-1 py-0 hidden md:inline-flex">
            {currentUser.accountType === "superAdmin" ? "SuperAdmin" : "Employee"}
          </Badge>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-foreground">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
            <div className="pt-1.5 flex items-center gap-1.5">
              <Badge variant={currentUser.accountType === "superAdmin" ? "default" : "outline"} className="text-[10px]">
                {currentUser.accountType === "superAdmin" ? "Super Admin" : "Employee Account"}
              </Badge>
              {currentUser.accountType === "employee" && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {currentUser.permissions.length} perms
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <UserIcon className="size-4 mr-2" />
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold py-1">
          Switch Demo User:
        </DropdownMenuLabel>
        {MOCK_USERS.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onClick={() => {
              loginByEmail(u.email);
              router.refresh();
            }}
            className="text-xs cursor-pointer justify-between py-1.5"
          >
            <span className="truncate">{u.name}</span>
            {u.id === currentUser.id ? (
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-primary text-primary">Active</Badge>
            ) : (
              <span className="text-[10px] text-muted-foreground uppercase">{u.accountType === "superAdmin" ? "Admin" : `${u.permissions.length}p`}</span>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="size-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
