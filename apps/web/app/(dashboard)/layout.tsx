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

const ROUTE_NAME_MAP: Record<string, string> = {
  "": "Overview Dashboard",
  listings: "Listings Table",
  new: "Add New Item",
  "social-matcher": "Social Cross-Posting Matcher",
  agents: "Agent Directory",
  settings: "Settings",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSegment = pathSegments[pathSegments.length - 1] || "";
  const currentPageTitle = ROUTE_NAME_MAP[currentSegment] || currentSegment || "Overview";

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
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/" className="font-medium text-foreground">
                      Crescent Sotheby&apos;s
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold">
                      {currentPageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
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
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-y-hidden rounded-tl-xl bg-background p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
