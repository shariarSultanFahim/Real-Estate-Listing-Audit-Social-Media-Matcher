"use client";

import { useState } from "react";
import { useMatchAgents } from "@/hooks/useRealEstateApi";
import { SocialCrossPostForm } from "./components/SocialCrossPostForm";
import { MatchAgentTable } from "./components/MatchAgentTable";
import { MatchResult } from "@real-estate/types";

import { RequirePermission } from "@/components/auth/RequirePermission";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function SocialMatcherPage() {
  const matchAgents = useMatchAgents();

  const [queryCity, setQueryCity] = useState("Covington");
  const [queryPrice, setQueryPrice] = useState(450000);
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);

  const handleSearch = (data: { city: string; price: number }) => {
    setQueryCity(data.city);
    setQueryPrice(data.price);

    matchAgents.mutate(data, {
      onSuccess: (results) => {
        setMatchResults(results);
      },
    });
  };

  return (
    <RequirePermission permission="socialMatcher:use">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Social Media Cross-Posting Matcher"
          description="Automating agent selection for social media cross-posting based on saved preferences, service areas & price thresholds."
        />

        {/* Search Form */}
        <SocialCrossPostForm onSearch={handleSearch} isLoading={matchAgents.isPending} />

        {/* Match Results Table */}
        {matchResults && (
          <MatchAgentTable
            results={matchResults}
            queryCity={queryCity}
            queryPrice={queryPrice}
          />
        )}
      </div>
    </RequirePermission>
  );
}
