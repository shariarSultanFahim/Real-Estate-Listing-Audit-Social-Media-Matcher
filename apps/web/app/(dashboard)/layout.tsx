"use client";

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
  listings: "Listing Audit Table",
  new: "Add New Property Listing",
  "social-matcher": "Social Cross-Posting Matcher",
  agents: "Agent Directory",
  settings: "Syndication Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSegment = pathSegments[pathSegments.length - 1] || "";
  const currentPageTitle = ROUTE_NAME_MAP[currentSegment] || currentSegment || "Overview";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden">
        {/* Collapsible AppSidebar Component */}
        <AppSidebar />

        {/* Main Content Inset with Sticky Header & Breadcrumbs */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 z-10 relative overflow-y-auto bg-slate-950">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-slate-400 hover:text-white" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-slate-800" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/" className="text-xs text-slate-400 hover:text-slate-200">
                      Crescent Sotheby&apos;s
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-slate-600" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xs font-semibold text-white">
                      {currentPageTitle}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden md:inline-block">
                700 Listings Monitored
              </span>
              <Button variant="outline" size="sm" className="border-slate-800 text-xs text-slate-300">
                <Bell className="size-3.5 mr-1 text-slate-400" />
                Alerts (5)
              </Button>
            </div>
          </header>

          {/* Page Body */}
          <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
