"use client";

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
} from "lucide-react";
import { FloatingCanvas } from "@/components/three/FloatingCanvas";
import { Button } from "@/components/ui/button";

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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Three.js Background Animation */}
      <FloatingCanvas />

      {/* Glassmorphic Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950/75 backdrop-blur-xl flex flex-col justify-between z-20 relative shrink-0">
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 px-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 glow-border-indigo">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-white">
                Crescent Sotheby&apos;s
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Audit &amp; Matcher
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 glow-border-indigo"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`size-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="size-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
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
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative overflow-y-auto">
        {/* Top Bar Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
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
      </div>
    </div>
  );
}
