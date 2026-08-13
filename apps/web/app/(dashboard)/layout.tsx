"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Share2,
  Users,
  Settings,
  Building2,
  Bell,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { FloatingCanvas } from "@/components/three/FloatingCanvas";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/listings", label: "Listing Audit", icon: ClipboardCheck, badge: "Issues" },
  { href: "/social-matcher", label: "Social Matcher", icon: Share2 },
  { href: "/agents", label: "Agent Directory", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden">
        {/* Three.js Background Animation */}
        <FloatingCanvas />

        {/* shadcn Official Sidebar Component (sidebar-02 pattern) */}
        <Sidebar className="border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl z-20">
          {/* Sidebar Header: Brand & Office Context */}
          <SidebarHeader className="h-16 px-4 border-b border-slate-800/80 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 glow-border-indigo shrink-0">
              <Building2 className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="font-semibold text-sm tracking-tight text-white truncate">
                Crescent Sotheby&apos;s
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono truncate">
                Audit &amp; Matcher
              </p>
            </div>
          </SidebarHeader>

          {/* Sidebar Content: Navigation Groups */}
          <SidebarContent className="p-3 space-y-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2">
                Main Portal Menu
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-1">
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`w-full justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 glow-border-indigo font-semibold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                          }`}
                        >
                          <Link href={item.href} className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <Icon className={`size-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge ? (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                                {item.badge}
                              </span>
                            ) : (
                              isActive && <ChevronRight className="size-3 text-indigo-400" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Quick Status Info Panel */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Sparkles className="size-3.5 text-indigo-400" />
                Detection Mode
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Read-only portal audit active for Realtor, Zillow, Homes &amp; Sotheby&apos;s.
              </p>
            </div>
          </SidebarContent>

          {/* Sidebar Footer: User Profile */}
          <SidebarFooter className="p-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="size-8 rounded-full bg-slate-800 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-400">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">Admin Staff</p>
                <p className="text-[10px] text-slate-400 truncate">Brokerage Engine Sync</p>
              </div>
            </div>
            <Link href="/login" className="block">
              <Button variant="ghost" className="w-full justify-start text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10">
                <LogOut className="size-3.5 mr-2" />
                Sign Out
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Inset Container */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 z-10 relative overflow-y-auto bg-slate-950">
          {/* Top Bar Header with Sidebar Trigger */}
          <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-400 hover:text-white" />
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest hidden sm:inline-block">
                Live Monitor Active • 700 Listings Monitored
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-slate-800 text-xs text-slate-300">
                <Bell className="size-3.5 mr-1 text-slate-400" />
                Alerts (5)
              </Button>
              <div className="text-xs text-right hidden sm:block">
                <p className="font-mono text-slate-300">Office: LA / MS / AL</p>
                <p className="text-[10px] text-slate-500">Source: Brokerage Engine</p>
              </div>
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
