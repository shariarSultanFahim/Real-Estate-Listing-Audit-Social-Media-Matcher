"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useListing, useAgents } from "@/hooks/useRealEstateApi";
import { ListingEssentialsForm } from "@/components/listings/ListingEssentialsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";

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
      <PageHeader
        title="Edit Listing Essentials"
        description={`${listing.address.street}, ${listing.address.city} (${listing.mlsNumber})`}
        showBackButton
        backHref={`/listings/${id}`}
      />

      <ListingEssentialsForm
        initialValues={listing}
        agents={agents}
        onSubmit={handleUpdateListing}
      />
    </div>
  );
}
