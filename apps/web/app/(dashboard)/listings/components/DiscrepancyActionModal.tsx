"use client";

import { useState } from "react";
import { Discrepancy } from "@real-estate/types";
import { useUpdateDiscrepancy } from "@/hooks/useRealEstateApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, EyeOff, MessageSquare, Send, User, X } from "lucide-react";
import { toast } from "sonner";

interface DiscrepancyActionModalProps {
  discrepancy: Discrepancy;
  onClose: () => void;
}

interface NoteItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export function DiscrepancyActionModal({ discrepancy, onClose }: DiscrepancyActionModalProps) {
  const updateDiscrepancy = useUpdateDiscrepancy();
  const [newNote, setNewNote] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"open" | "in_progress" | "resolved" | "ignored">(
    discrepancy.status as "open" | "in_progress" | "resolved" | "ignored"
  );

  // Initial mock history timeline items based on existing discrepancy note and detected date
  const [notesHistory, setNotesHistory] = useState<NoteItem[]>([
    ...(discrepancy.note
      ? [
        {
          id: "note-1",
          author: "John (Listing Ops)",
          text: discrepancy.note,
          date: "Aug 20, 2026, 11:15 AM",
        },
      ]
      : []),
    {
      id: "note-2",
      author: "Sarah (Syndication Lead)",
      text: "Flagged during automated syndication audit cycle. Verifying with feed provider.",
      date: "Aug 21, 2026, 02:40 PM",
    },
  ]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const added: NoteItem = {
      id: `note-${Date.now()}`,
      author: "Current User (Staff)",
      text: newNote.trim(),
      date: "Just now",
    };
    setNotesHistory((prev) => [...prev, added]);
    setNewNote("");
    toast.success("Note added to discrepancy history.");
  };

  const handleSetStatus = (status: "open" | "in_progress" | "resolved" | "ignored") => {
    const combinedNotes = notesHistory.map((n) => `[${n.author} - ${n.date}]: ${n.text}`).join(" | ");
    updateDiscrepancy.mutate(
      {
        id: discrepancy.id,
        status,
        note: newNote.trim() ? `${combinedNotes} | [Staff]: ${newNote.trim()}` : combinedNotes,
      },
      {
        onSuccess: () => {
          setCurrentStatus(status);
          if (status === "resolved") {
            toast.success(`Discrepancy on ${discrepancy.site} marked as Resolved!`);
          } else if (status === "in_progress") {
            toast.info(`Discrepancy on ${discrepancy.site} marked as In Progress.`);
          } else {
            toast.info(`Discrepancy status updated to ${status}.`);
          }
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-xl max-h-[90vh] flex flex-col border-border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-card-foreground">Audit Discrepancy Action &amp; History</CardTitle>
              {currentStatus === "resolved" && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  Resolved
                </Badge>
              )}
              {currentStatus === "in_progress" && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                  In Progress
                </Badge>
              )}
              {currentStatus === "open" && (
                <Badge variant="destructive" className="text-[10px]">
                  Open
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Field: <span className="font-semibold text-foreground capitalize">{discrepancy.field}</span> on portal{" "}
              <span className="uppercase font-mono font-semibold text-foreground">{discrepancy.site}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 overflow-y-auto flex-1">
          {/* Status Workflow Progress Indicator */}
          <div className="p-3 rounded-lg bg-card border border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Discrepancy Workflow
            </span>
            <div className="flex items-center justify-between text-xs font-medium">
              <div className={`flex items-center gap-1.5 ${currentStatus === "open" ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                <AlertCircle className="size-3.5" />
                <span>1. Open (Detected)</span>
              </div>
              <span className="text-muted-foreground/40 font-mono">→</span>
              <div className={`flex items-center gap-1.5 ${currentStatus === "in_progress" ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
                <Clock className="size-3.5" />
                <span>2. In Progress</span>
              </div>
              <span className="text-muted-foreground/40 font-mono">→</span>
              <div className={`flex items-center gap-1.5 ${currentStatus === "resolved" ? "text-emerald-500 font-bold" : "text-muted-foreground"}`}>
                <CheckCircle2 className="size-3.5" />
                <span>3. Resolved</span>
              </div>
            </div>
          </div>

          {/* Value comparison */}
          <div className="p-3 rounded-lg bg-muted/60 border border-border space-y-2 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Source Value (Brokerage Engine):</span>
              <span className="text-primary font-semibold">{discrepancy.sourceValue}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>External Site Found ({discrepancy.site}):</span>
              <span className="text-destructive font-semibold">{discrepancy.siteValue}</span>
            </div>
          </div>

          {/* Notes & Activity History Timeline */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="size-3.5 text-primary" />
                Discrepancy Notes &amp; Activity Timeline
              </span>
              <span className="text-[11px] text-muted-foreground">{notesHistory.length + 1} recorded events</span>
            </div>

            <div className="space-y-2.5 pl-3 border-l-2 border-border/80">
              {/* Event 1: Creation */}
              <div className="space-y-0.5 relative">
                <div className="size-2 rounded-full bg-destructive absolute -left-[17px] top-1.5" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground">Discrepancy Created</span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {new Date(discrepancy.detectedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Automated audit detected mismatch between Brokerage Engine and {discrepancy.site}.
                </p>
              </div>

              {/* User Notes */}
              {notesHistory.map((n) => (
                <div key={n.id} className="space-y-0.5 relative pt-1">
                  <div className="size-2 rounded-full bg-primary absolute -left-[17px] top-2.5" />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <User className="size-3 text-muted-foreground" />
                      Note added by <strong className="text-foreground">{n.author}</strong>
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">{n.date}</span>
                  </div>
                  <p className="text-xs text-foreground bg-card p-2 rounded border border-border italic">
                    &ldquo;{n.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* Add New Note Box */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                type="text"
                placeholder="Add audit note (e.g. Contacted listing agent, waiting for syndication sync)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                className="bg-background border-input text-xs"
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddNote} className="text-xs shrink-0 gap-1">
                <Send className="size-3" />
                Add Note
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => handleSetStatus("ignored")} className="text-xs text-muted-foreground">
            <EyeOff className="size-3.5 mr-1" />
            Ignore
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSetStatus("in_progress")}
              className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
            >
              <Clock className="size-3.5 mr-1" />
              Mark In Progress
            </Button>
            <Button
              size="sm"
              onClick={() => handleSetStatus("resolved")}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Mark Resolved
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
