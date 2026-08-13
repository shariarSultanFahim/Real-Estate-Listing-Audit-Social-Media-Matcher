"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Real Estate App Navigation Data
const data = {
  versions: ["1.0.1 (LA/MS/AL)", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Core Portal Navigation",
      url: "/",
      items: [
        {
          title: "Dashboard Overview",
          url: "/",
        },
        {
          title: "Listing Audit Table",
          url: "/listings",
        },
        {
          title: "Social Media Matcher",
          url: "/social-matcher",
        },
        {
          title: "Agent Directory",
          url: "/agents",
        },
        {
          title: "Syndication Settings",
          url: "/settings",
        },
      ],
    },
    {
      title: "Property Listing Management",
      url: "/listings",
      items: [
        {
          title: "Add New Property Listing",
          url: "/listings/new",
        },
        {
          title: "Flagged Discrepancies",
          url: "/listings?filter=issues",
        },
      ],
    },
    {
      title: "Syndication Portal Monitors",
      url: "/settings",
      items: [
        {
          title: "Realtor.com Monitor",
          url: "/settings",
        },
        {
          title: "Zillow Group Monitor",
          url: "/settings",
        },
        {
          title: "Homes.com Monitor",
          url: "/settings",
        },
        {
          title: "Sotheby's Global Portal",
          url: "/settings",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl" {...props}>
      <SidebarHeader className="p-3 border-b border-slate-800 space-y-2">
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent className="gap-0 p-2">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90 text-slate-500" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="mt-1">
                    {item.items.map((subItem) => {
                      const isActive =
                        subItem.url === "/"
                          ? pathname === "/"
                          : pathname === subItem.url

                      return (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`text-xs px-3 py-2 rounded-md transition-colors ${
                              isActive
                                ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                            }`}
                          >
                            <Link href={subItem.url}>{subItem.title}</Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
