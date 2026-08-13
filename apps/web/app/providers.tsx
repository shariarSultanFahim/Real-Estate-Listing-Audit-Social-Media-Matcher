"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/components/auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
