"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useListing, useAgents } from "@/hooks/useRealEstateApi";
import { ListingEssentialsForm } from "@/components/listings/ListingEssentialsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: listing, isLoading: isLoadingListing } = useListing(id);
  const { data: agents = [] } = useAgents();

  if (isLoadingListing) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  if (!listing) {
    return <div className="p-8 text-center text-destructive">Listing not found</div>;
  }

  const handleUpdateListing = async (formData: any) => {
    toast.success("Listing updated successfully!");
    router.push(`/listings/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Edit Listing Essentials
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {listing.address.street}, {listing.address.city} ({listing.mlsNumber})
        </p>
      </div>

      <ListingEssentialsForm
        initialValues={listing}
        agents={agents}
        onSubmit={handleUpdateListing}
      />
    </div>
  );
}
