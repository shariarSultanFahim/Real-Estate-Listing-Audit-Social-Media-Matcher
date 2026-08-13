"use client";

import { useState } from "react";
import { useMatchAgents } from "@/hooks/useRealEstateApi";
import { SocialCrossPostForm } from "./components/SocialCrossPostForm";
import { MatchAgentTable } from "./components/MatchAgentTable";
import { MatchResult } from "@real-estate/types";

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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Social Media Cross-Posting Matcher
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automating agent selection for social media cross-posting based on saved preferences, service areas &amp; price thresholds.
        </p>
      </div>

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
  );
}
