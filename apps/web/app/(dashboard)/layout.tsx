"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { DashboardBreadcrumb } from "@/components/dashboard/DashboardBreadcrumb";
import { AlertsPopover } from "@/components/dashboard/AlertsPopover";
import { UserMenu } from "@/components/dashboard/UserMenu";

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
              <UserMenu />
              <AlertsPopover />
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
