"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Building2,
  Share2,
  Users,
  Settings,
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  UserCheck,
  User,
} from "lucide-react"
import { usePermission, useAuth } from "@/components/auth/AuthProvider"
import { Permission } from "@real-estate/types"

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
  useSidebar,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon: any
  permission?: Permission
  superAdminOnly?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const data: { info: { title: string; subtitle: string }; navMain: NavGroup[] } = {
  info: {
    title: "Crescent Sotheby's",
    subtitle: "Listing & Social Matcher",
  },
  navMain: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Overview",
          url: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Listings",
      items: [
        {
          title: "All Listings",
          url: "/listings",
          icon: ListFilter,
        },
        {
          title: "Add New Listing",
          url: "/listings/new",
          icon: PlusCircle,
          permission: "listings:create",
        },
        {
          title: "Social Matcher",
          url: "/social-matcher",
          icon: Share2,
          permission: "socialMatcher:use",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Agents Directory",
          url: "/agents",
          icon: Users,
        },
        {
          title: "Employees & Permissions",
          url: "/employees",
          icon: UserCheck,
          permission: "users:edit",
        },
        {
          title: "My Profile",
          url: "/profile",
          icon: User,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
          superAdminOnly: true,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const { currentUser } = useAuth()
  
  const canCreateListings = usePermission("listings:create")
  const canUseSocial = usePermission("socialMatcher:use")
  const canEditUsers = usePermission("users:edit")
  const canCreateUsers = usePermission("users:create")

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isPermitted = (item: NavItem) => {
    if (item.superAdminOnly) {
      return currentUser?.accountType === "superAdmin"
    }
    if (!item.permission) return true
    if (item.permission === "listings:create") return canCreateListings
    if (item.permission === "socialMatcher:use") return canUseSocial
    if (item.permission === "users:edit") return canEditUsers || canCreateUsers
    return true
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild onClick={handleNavClick}>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-sm leading-tight">
                  <span className="truncate text-sm font-bold">{data.info.title}</span>
                  <span className="truncate text-xs font-semibold text-sidebar-foreground/60">
                    {data.info.subtitle}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => {
          const visibleItems = group.items.filter((item) => isPermitted(item))
          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive =
                      item.url === "/"
                        ? pathname === "/"
                        : item.url === "/listings"
                          ? pathname === "/listings" || (pathname.startsWith("/listings/") && pathname !== "/listings/new")
                          : pathname === item.url || pathname.startsWith(item.url + "/")

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={handleNavClick}
                          className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}

