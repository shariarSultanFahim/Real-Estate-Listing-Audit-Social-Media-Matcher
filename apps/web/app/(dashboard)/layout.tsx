"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

import { DashboardBreadcrumb } from "@/components/dashboard/DashboardBreadcrumb";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DashboardBreadcrumb />
            </div>

            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest hidden md:inline-block">
                700 Listings Monitored
              </span>
              <Button variant="outline" size="sm" className="text-xs">
                <Bell className="size-3.5 mr-1" />
                Alerts (5)
              </Button>
              <AnimatedThemeToggler className="flex size-8 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors" />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-y-hidden rounded-xl bg-background p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
