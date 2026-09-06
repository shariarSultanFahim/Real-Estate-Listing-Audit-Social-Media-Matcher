"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/hooks/useRealEstateApi";
import { AddressLookupStep } from "@/components/listings/AddressLookupStep";
import { ListingEssentialsForm } from "@/components/listings/ListingEssentialsForm";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

import { RequirePermission } from "@/components/auth/RequirePermission";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function NewListingPage() {
  const router = useRouter();
  const { data: agents = [] } = useAgents();
  const [step, setStep] = useState<1 | 2>(1);
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
        />

        {step === 1 && (
          <AddressLookupStep onSelectAddress={handleSelectAddress} />
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
      </div>
    </RequirePermission>
  );
}
