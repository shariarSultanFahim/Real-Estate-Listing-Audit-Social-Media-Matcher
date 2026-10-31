"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/hooks/useRealEstateApi";
import { AddressLookupStep } from "@/components/listings/AddressLookupStep";
import { ListingEssentialsForm } from "@/components/listings/ListingEssentialsForm";
import { BulkImportModal } from "@/components/listings/BulkImportModal";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

import { RequirePermission } from "@/components/auth/RequirePermission";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function NewListingPage() {
  const router = useRouter();
  const { data: agents = [] } = useAgents();
  const [step, setStep] = useState<1 | 2>(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<{
    street: string;
    city: string;
    state: string;
    zip: string;
  } | null>(null);

  const handleSelectAddress = (addr: { street: string; city: string; state: string; zip: string }) => {
    setSelectedAddress(addr);
    setStep(2);
  };

  const handleCreateListing = async (formData: any) => {
    try {
      const res = await apiClient.post("/listings", formData);
      toast.success("Authoritative MLS listing created successfully!");
      router.push(`/listings/${res.data.id}`);
    } catch (err) {
      toast.error("Failed to save listing.");
    }
  };

  return (
    <RequirePermission permission="listings:create">
      <div className="space-y-6 max-w-6xl mx-auto">
        <PageHeader
          title="Create MLS Listing"
          description={
            step === 1
              ? "Step 1 of 2 — Property Location & Address Entry"
              : "Source of Truth — This listing information is used as the authoritative source for external platform audits."
          }
          showBackButton={step === 2}
          onBack={() => setStep(1)}
          actions={
            step === 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="gap-1.5 h-9 border-primary/20 hover:border-primary/40 text-xs font-semibold"
              >
                <FileSpreadsheet className="size-3.5 text-emerald-600" />
                Bulk Import Excel / CSV
              </Button>
            ) : undefined
          }
        />

        {step === 1 && (
          <AddressLookupStep
            onSelectAddress={handleSelectAddress}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        )}

        {step === 2 && (
          <ListingEssentialsForm
            initialValues={{
              address: selectedAddress || undefined,
            }}
            agents={agents}
            onSubmit={handleCreateListing}
            onBack={() => setStep(1)}
          />
        )}

        {/* Bulk Import Modal */}
        <BulkImportModal
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          onImportComplete={() => router.push("/listings")}
        />
      </div>
    </RequirePermission>
  );
}
