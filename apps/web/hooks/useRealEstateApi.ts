import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Listing, Agent, Discrepancy, MatchResult, User } from "@real-estate/types";
import { ListingSchema, AgentSchema, DiscrepancySchema, MatchResultSchema, UserSchema } from "@real-estate/validation";
import { z } from "zod";

// ─── Listings ──────────────────────────────────────────────────
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

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Listing>) => {
      const res = await apiClient.post("/listings", payload);
      return ListingSchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Listing> }) => {
      const res = await apiClient.patch(`/listings/${id}`, data);
      return ListingSchema.parse(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings", variables.id] });
    },
  });
}

// ─── Agents ────────────────────────────────────────────────────
export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await apiClient.get("/agents");
      return z.array(AgentSchema).parse(res.data);
    },
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: ["agents", id],
    queryFn: async () => {
      const res = await apiClient.get(`/agents/${id}`);
      return AgentSchema.parse(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Agent>) => {
      const res = await apiClient.post("/agents", payload);
      return AgentSchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
      const res = await apiClient.patch(`/agents/${id}`, data);
      return AgentSchema.parse(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agents", variables.id] });
    },
  });
}

// ─── Discrepancies ─────────────────────────────────────────────
export function useDiscrepancies(listingId?: string) {
  return useQuery<Discrepancy[]>({
    queryKey: ["discrepancies", listingId],
    queryFn: async () => {
      const url = listingId ? `/discrepancies?listingId=${listingId}&includeResolved=true` : "/discrepancies?includeResolved=true";
      const res = await apiClient.get(url);
      return z.array(DiscrepancySchema).parse(res.data);
    },
  });
}

export function useDiscrepancy(id: string) {
  return useQuery<Discrepancy>({
    queryKey: ["discrepancies", "detail", id],
    queryFn: async () => {
      const res = await apiClient.get(`/discrepancies/${id}`);
      return DiscrepancySchema.parse(res.data);
    },
    enabled: !!id,
  });
}

export function useDiscrepancyHistory(discrepancyId: string) {
  return useQuery<any[]>({
    queryKey: ["discrepancies", discrepancyId, "history"],
    queryFn: async () => {
      const res = await apiClient.get(`/discrepancies/${discrepancyId}/history`);
      return res.data;
    },
    enabled: !!discrepancyId,
  });
}

export function useUpdateDiscrepancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; status?: "open" | "in_progress" | "resolved" | "ignored"; note?: string; changedBy?: string }) => {
      const res = await apiClient.patch("/discrepancies", payload);
      return DiscrepancySchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
    },
  });
}

export function useAddDiscrepancyNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content, authorId }: { id: string; content: string; authorId?: string }) => {
      const res = await apiClient.post(`/discrepancies/${id}/notes`, { content, authorId });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
      queryClient.invalidateQueries({ queryKey: ["discrepancies", variables.id, "history"] });
    },
  });
}

export function useApprovePhotoArrangement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes, approvedBy }: { id: string; notes?: string; approvedBy?: string }) => {
      const res = await apiClient.post(`/discrepancies/${id}/approve-photo-arrangement`, { notes, approvedBy });
      return DiscrepancySchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// ─── Social Matcher ────────────────────────────────────────────
export function useMatchAgents() {
  return useMutation<MatchResult[], Error, { city: string; price: number }>({
    mutationFn: async (payload) => {
      const res = await apiClient.post("/social-matcher", payload);
      return z.array(MatchResultSchema).parse(res.data);
    },
  });
}

// ─── Users & Employees ─────────────────────────────────────────
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiClient.get("/users");
      return z.array(UserSchema).parse(res.data);
    },
  });
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${id}`);
      return UserSchema.parse(res.data);
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User> & { password?: string }) => {
      const res = await apiClient.post("/users", payload);
      return UserSchema.parse(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) => {
      const res = await apiClient.patch(`/users/${id}`, data);
      return UserSchema.parse(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; email?: string; password?: string } }) => {
      const res = await apiClient.patch(`/users/${id}`, data);
      return UserSchema.parse(res.data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
    },
  });
}

// ─── Audit Runs & Snapshots ────────────────────────────────────
export function useAuditRuns() {
  return useQuery<any[]>({
    queryKey: ["audit-runs"],
    queryFn: async () => {
      const res = await apiClient.get("/audit/runs");
      return res.data;
    },
  });
}

export function useSiteSnapshots(listingId: string) {
  return useQuery<any[]>({
    queryKey: ["site-snapshots", listingId],
    queryFn: async () => {
      const res = await apiClient.get(`/audit/snapshots/${listingId}`);
      return res.data;
    },
    enabled: !!listingId,
  });
}

export function useTriggerAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload?: { platform?: string; listingId?: string }) => {
      const res = await apiClient.post("/audit/run", payload || {});
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["audit-runs"] });
      queryClient.invalidateQueries({ queryKey: ["discrepancies"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      if (variables?.listingId) {
        queryClient.invalidateQueries({ queryKey: ["site-snapshots", variables.listingId] });
      }
    },
  });
}
