"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgents } from "@/hooks/useRealEstateApi";
import { AddressLookupStep } from "@/components/listings/AddressLookupStep";
import { ListingEssentialsForm } from "@/components/listings/ListingEssentialsForm";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

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
      toast.success("New listing saved to Brokerage Engine source of truth mirror!");
      router.push(`/listings/${res.data.id}`);
    } catch (err) {
      toast.error("Failed to save listing.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Add New Property Listing
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Step {step} of 2 — {step === 1 ? "Address Autocomplete Lookup" : "Listing Essentials Form"}
        </p>
      </div>

      {step === 1 && (
        <AddressLookupStep onSelectAddress={handleSelectAddress} />
      )}

      {step === 2 && (
        <ListingEssentialsForm
          initialValues={{
            address: selectedAddress || { street: "104 Magnolia Lane", city: "Covington", state: "LA", zip: "70433" },
          }}
          agents={agents}
          onSubmit={handleCreateListing}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
