"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ROUTE_LABELS: Record<string, string> = {
  listings: "Listings Audit",
  new: "Add New Listing",
  edit: "Edit Essentials",
  "social-matcher": "Social Cross-Posting Matcher",
  agents: "Agent Directory",
  employees: "Employee Management",
  profile: "My Profile",
  settings: "Brokerage Settings",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link href="/">Crescent Sotheby&apos;s</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Analytics Overview
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const primarySegment = segments[0];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/">Crescent Sotheby&apos;s</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          {segments.length === 1 ? (
            <BreadcrumbPage className="capitalize font-semibold text-foreground">
              {ROUTE_LABELS[primarySegment] || primarySegment}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={`/${primarySegment}`} className="capitalize font-medium">
                {ROUTE_LABELS[primarySegment] || primarySegment}
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {segments.slice(1).map((seg, index) => {
          const isLast = index === segments.length - 2;
          const label = ROUTE_LABELS[seg] || (seg.startsWith("list-") || seg.startsWith("agent-") ? `Detail (${seg})` : seg);

          return (
            <React.Fragment key={seg + index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize font-semibold text-foreground">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={`/${segments.slice(0, index + 2).join("/")}`} className="capitalize font-medium">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
