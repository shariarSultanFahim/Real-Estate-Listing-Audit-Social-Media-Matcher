import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Listing, Agent, Discrepancy, MatchResult } from "@real-estate/types";
import { ListingSchema, AgentSchema, DiscrepancySchema, MatchResultSchema } from "@real-estate/validation";
import { z } from "zod";

export function useListings() {
  return useQuery<Listing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      const res = await apiClient.get("/listings");
      return z.array(ListingSchema).parse(res.data);
    },
  });
}

export function useListing(id: string) {
  return useQuery<Listing>({
    queryKey: ["listings", id],
    queryFn: async () => {
      const res = await apiClient.get(`/listings/${id}`);
      return ListingSchema.parse(res.data);
    },
    enabled: !!id,
  });
}

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await apiClient.get("/agents");
      return z.array(AgentSchema).parse(res.data);
    },
  });
}

export function useDiscrepancies(listingId?: string) {
  return useQuery<Discrepancy[]>({
    queryKey: ["discrepancies", listingId],
    queryFn: async () => {
      const url = listingId ? `/discrepancies?listingId=${listingId}` : "/discrepancies";
      const res = await apiClient.get(url);
      return z.array(DiscrepancySchema).parse(res.data);
    },
  });
}

export function useUpdateDiscrepancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; status?: "open" | "resolved" | "ignored"; note?: string }) => {
      const res = await apiClient.patch("/discrepancies", payload);
      return DiscrepancySchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
    },
  });
}

export function useMatchAgents() {
  return useMutation<MatchResult[], Error, { city: string; price: number }>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/social-matcher", payload);
      return z.array(MatchResultSchema).parse(res.data);
    },
  });
}
