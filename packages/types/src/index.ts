import { z } from "zod";
import {
  SyndicationSiteEnum,
  DiscrepancyFieldEnum,
  DiscrepancyStatusEnum,
  ListingStatusEnum,
  CrossPostPreferenceEnum,
  OfficeStateEnum,
  UserRoleEnum,
  AddressSchema,
  MapCoordinatesSchema,
  PhotoSchema,
  ListingSchema,
  SiteSnapshotSchema,
  DiscrepancySchema,
  AgentSchema,
  MatchQuerySchema,
  MatchResultSchema,
  UserSchema,
} from "@real-estate/validation";

export type SyndicationSite = z.infer<typeof SyndicationSiteEnum>;
export type DiscrepancyField = z.infer<typeof DiscrepancyFieldEnum>;
export type DiscrepancyStatus = z.infer<typeof DiscrepancyStatusEnum>;
export type ListingStatus = z.infer<typeof ListingStatusEnum>;
export type CrossPostPreference = z.infer<typeof CrossPostPreferenceEnum>;
export type OfficeState = z.infer<typeof OfficeStateEnum>;
export type UserRole = z.infer<typeof UserRoleEnum>;

export type Address = z.infer<typeof AddressSchema>;
export type MapCoordinates = z.infer<typeof MapCoordinatesSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type SiteSnapshot = z.infer<typeof SiteSnapshotSchema>;
export type Discrepancy = z.infer<typeof DiscrepancySchema>;
export type Agent = z.infer<typeof AgentSchema>;
export type MatchQuery = z.infer<typeof MatchQuerySchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
export type User = z.infer<typeof UserSchema>;
