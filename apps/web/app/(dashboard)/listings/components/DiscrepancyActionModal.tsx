"use client";

import { useState } from "react";
import { Discrepancy } from "@real-estate/types";
import { useUpdateDiscrepancy } from "@/hooks/useRealEstateApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, EyeOff, X } from "lucide-react";
import { toast } from "sonner";

interface DiscrepancyActionModalProps {
  discrepancy: Discrepancy;
  onClose: () => void;
}

export function DiscrepancyActionModal({ discrepancy, onClose }: DiscrepancyActionModalProps) {
  const updateDiscrepancy = useUpdateDiscrepancy();
  const [note, setNote] = useState(discrepancy.note || "");

  const handleResolve = () => {
    updateDiscrepancy.mutate(
      { id: discrepancy.id, status: "resolved", note },
      {
        onSuccess: () => {
          toast.success(`Discrepancy on ${discrepancy.site} marked as resolved!`);
          onClose();
        },
      }
    );
  };

  const handleIgnore = () => {
    updateDiscrepancy.mutate(
      { id: discrepancy.id, status: "ignored", note },
      {
        onSuccess: () => {
          toast.info(`Discrepancy on ${discrepancy.site} ignored.`);
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-lg text-card-foreground">Resolve Discrepancy</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Field: <span className="text-destructive capitalize">{discrepancy.field}</span> on{" "}
              <span className="uppercase font-mono text-foreground">{discrepancy.site}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="p-3 rounded-lg bg-muted border border-border space-y-2 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Source Value:</span>
              <span className="text-primary">{discrepancy.sourceValue}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Site Found Value:</span>
              <span className="text-destructive">{discrepancy.siteValue}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Staff Audit Note (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. Verified with MLS team, price feed sync expected within 2 hours"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-background border-input text-xs"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
          <Button variant="outline" onClick={handleIgnore} className="text-xs">
            <EyeOff className="size-3.5 mr-1" />
            Ignore Discrepancy
          </Button>
          <Button onClick={handleResolve} className="text-xs">
            <CheckCircle2 className="size-3.5 mr-1" />
            Mark Resolved
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
