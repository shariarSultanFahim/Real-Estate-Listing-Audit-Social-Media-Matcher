"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  showBackButton,
  onBack,
  backHref,
  actions,
  className = "",
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="size-8 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {icon}
            {title}
          </h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-3 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
