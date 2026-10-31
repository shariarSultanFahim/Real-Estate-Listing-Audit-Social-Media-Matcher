"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowRight,
  FileText,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  soldOrWithdrawn: number;
  resolvedDiscrepancies: number;
  errors: Array<{ row: number; mlsNumber?: string; error: string }>;
  details: Array<{ mlsNumber: string; address: string; action: string; status: string }>;
}

export function BulkImportModal({
  open,
  onOpenChange,
  onImportComplete,
}: BulkImportModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [autoResolveSold, setAutoResolveSold] = useState(true);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setHeaders([]);
    setIsParsing(false);
    setIsUploading(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const processFile = async (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Please upload a valid .xlsx, .xls, or .csv spreadsheet file.");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setImportResult(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error("Spreadsheet contains no sheets.");
      }

      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (rows.length === 0) {
        toast.error("The selected file has no data rows.");
        setIsParsing(false);
        return;
      }

      const keys = Object.keys(rows[0] || {});
      setHeaders(keys);
      setParsedRows(rows);
      toast.success(`Successfully analyzed ${rows.length} listing records from ${selectedFile.name}`);
    } catch (err: any) {
      toast.error(`Failed to parse spreadsheet: ${err.message || "Invalid file format"}`);
      setFile(null);
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async (format: "csv" | "xlsx") => {
    try {
      const res = await apiClient.get(`/listings/template?format=${format}`, {
        responseType: "blob",
      });
      const blob = new Blob([res.data], {
        type:
          format === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Brokerage_Engine_Listings_Template.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded sample ${format.toUpperCase()} template`);
    } catch {
      toast.error("Failed to download template. Please try again.");
    }
  };

  const handleUploadListings = async () => {
    if (!parsedRows || parsedRows.length === 0) {
      toast.error("No listings loaded to import.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await apiClient.post("/listings/import", {
        items: parsedRows,
        autoResolveSold,
      });

      setImportResult(res.data);

      // Invalidate relevant react-query caches
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      await queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
      await queryClient.invalidateQueries({ queryKey: ["agents"] });

      toast.success(
        `Import completed: ${res.data.created} created, ${res.data.updated} updated.`
      );

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to import listings.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => (val ? onOpenChange(val) : handleClose())}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-6 border-border shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Import Listings from Excel or CSV
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Upload your Brokerage Engine, MLS export, or spreadsheet to create or sync all authoritative listings in seconds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* STEP 1: Upload & Drag Drop if no file or not imported yet */}
        {!importResult ? (
          <div className="space-y-5 pt-3">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : file
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div
                  className={`size-12 rounded-2xl flex items-center justify-center transition-transform ${
                    file ? "bg-emerald-500/10 text-emerald-600 scale-110" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {file ? (
                    <FileSpreadsheet className="size-6 text-emerald-600" />
                  ) : (
                    <Upload className="size-6" />
                  )}
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} listing rows detected
                    </p>
                    <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1 mt-1">
                      <Check className="size-3" /> Ready for Import
                    </Badge>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Click to upload or drag & drop your spreadsheet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports Brokerage Engine exports, standard MLS sheets (.xlsx, .xls, or .csv)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Template Download & Help Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/50 border border-border text-xs">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  Need the standard format? Download a pre-formatted template:
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate("xlsx")}
                  className="h-7 text-xs gap-1"
                >
                  <Download className="size-3" /> Excel (.xlsx)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate("csv")}
                  className="h-7 text-xs gap-1"
                >
                  <Download className="size-3" /> CSV (.csv)
                </Button>
              </div>
            </div>

            {/* Preview of Parsed Rows */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Data Preview (First 5 of {parsedRows.length} rows)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetState}
                    className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                  >
                    <X className="size-3" /> Clear file
                  </Button>
                </div>

                <div className="rounded-xl border border-border overflow-hidden bg-card text-xs shadow-xs max-h-56 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/70 sticky top-0 border-b border-border">
                      <tr>
                        <th className="p-2.5 font-semibold text-foreground">MLS ID</th>
                        <th className="p-2.5 font-semibold text-foreground">Address</th>
                        <th className="p-2.5 font-semibold text-foreground">City</th>
                        <th className="p-2.5 font-semibold text-foreground">Price</th>
                        <th className="p-2.5 font-semibold text-foreground">Beds/Baths</th>
                        <th className="p-2.5 font-semibold text-foreground">Status</th>
                        <th className="p-2.5 font-semibold text-foreground">Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.slice(0, 5).map((row, i) => {
                        const mls = row["MLS ID"] || row["MLS Number"] || row["mlsNumber"] || row["id"] || "-";
                        const addr = row["Listing Address"] || row["Street Address"] || row["Address"] || row["street"] || "-";
                        const city = row["City"] || row["city"] || "-";
                        const price = row["Price"] || row["Listing Price"] || row["price"] || "-";
                        const beds = row["Bedrooms"] || row["Beds"] || "0";
                        const baths = row["Full Bath"] || row["Full Baths"] || "0";
                        const status = row["ListingStatus"] || row["Status"] || "Active";
                        const agent = row["Agent Information"] || row["Agent Name"] || row["Agent"] || "-";

                        return (
                          <tr key={i} className="hover:bg-muted/40 transition-colors">
                            <td className="p-2.5 font-mono font-medium text-primary">{mls}</td>
                            <td className="p-2.5 font-medium text-foreground truncate max-w-[180px]">{addr}</td>
                            <td className="p-2.5 text-muted-foreground">{city}</td>
                            <td className="p-2.5 font-semibold text-foreground">{price}</td>
                            <td className="p-2.5 text-muted-foreground">{beds}bd / {baths}ba</td>
                            <td className="p-2.5">
                              <Badge
                                variant={
                                  String(status).toLowerCase().includes("active")
                                    ? "default"
                                    : String(status).toLowerCase().includes("sold")
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-[10px] capitalize"
                              >
                                {status}
                              </Badge>
                            </td>
                            <td className="p-2.5 text-muted-foreground truncate max-w-[140px]">{agent}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Auto-Sync Sold & Withdrawn Setting */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoResolveSold}
                      onChange={(e) => setAutoResolveSold(e.target.checked)}
                      className="mt-0.5 rounded border-primary text-primary focus:ring-primary size-4"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-primary" />
                        Auto-Resolve Audit Discrepancies for Sold & Withdrawn Listings
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        When a listing status in your Brokerage Engine export is <strong>Sold</strong>, <strong>Withdrawn</strong>, or <strong>Canceled</strong>, it will automatically update in your database and close out open discrepancies so they immediately fall off your active audit.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUploadListings}
                disabled={!parsedRows.length || isUploading || isParsing}
                className="gap-2 text-xs font-semibold"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Importing & Syncing Listings...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    Import All {parsedRows.length > 0 ? `${parsedRows.length} Listings` : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Results Summary View */
          <div className="space-y-5 pt-3">
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Import & Audit Sync Complete!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                All records from your spreadsheet have been successfully processed, validated, and synchronized with your audit engine.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
                <span className="text-xs font-medium text-muted-foreground">Total Processed</span>
                <p className="text-2xl font-black text-foreground mt-0.5">{importResult.total}</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
                <span className="text-xs font-medium text-muted-foreground">New Listings</span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">+{importResult.created}</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
                <span className="text-xs font-medium text-muted-foreground">Updated / Synced</span>
                <p className="text-2xl font-black text-blue-600 mt-0.5">{importResult.updated}</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border shadow-xs">
                <span className="text-xs font-medium text-muted-foreground">Discrepancies Resolved</span>
                <p className="text-2xl font-black text-purple-600 mt-0.5">{importResult.resolvedDiscrepancies}</p>
              </div>
            </div>

            {importResult.soldOrWithdrawn > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs">
                <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-foreground">
                    {importResult.soldOrWithdrawn} Sold or Withdrawn Listing(s) Detected
                  </span>
                  <p className="text-muted-foreground">
                    Their status was updated and {importResult.resolvedDiscrepancies} related audit discrepancies were automatically marked resolved, removing them from your active audit queue.
                  </p>
                </div>
              </div>
            )}

            {/* Details Table */}
            {importResult.details.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sync Log Details ({importResult.details.length} records)
                </span>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-card divide-y divide-border text-xs">
                  {importResult.details.map((d, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-primary">#{d.mlsNumber}</span>
                        <span className="text-muted-foreground truncate max-w-[260px]">{d.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={d.action === "created" ? "default" : "secondary"}
                          className="text-[10px] uppercase font-mono"
                        >
                          {d.action}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {d.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors if any */}
            {importResult.errors.length > 0 && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs space-y-1">
                <span className="font-semibold text-destructive">
                  Warnings / Skipped Rows ({importResult.errors.length}):
                </span>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {importResult.errors.map((e, idx) => (
                    <li key={idx}>
                      Row {e.row}: {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Final Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={resetState} className="text-xs">
                Upload Another File
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleClose}
                className="gap-1.5 text-xs font-semibold"
              >
                View Updated Dashboard <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
