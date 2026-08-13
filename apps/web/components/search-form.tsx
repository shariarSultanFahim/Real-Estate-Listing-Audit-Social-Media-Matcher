"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search listings, agents..."
            className="pl-8 bg-sidebar-accent/50 border-sidebar-border text-xs"
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none text-sidebar-foreground/60" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
