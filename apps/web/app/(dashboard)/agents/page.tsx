"use client";

import { useState } from "react";
import { useAgents } from "@/hooks/useRealEstateApi";
import { AgentForm } from "./components/AgentForm";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Agent } from "@real-estate/types";
import { Plus, Edit2, Facebook, Instagram, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

import { Combobox } from "@/components/ui/combobox";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";

const STATE_OPTIONS = [
  { value: "all", label: "All States (LA / MS / AL)" },
  { value: "LA", label: "Louisiana (LA)" },
  { value: "MS", label: "Mississippi (MS)" },
  { value: "AL", label: "Alabama (AL)" },
];

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useAgents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const filteredAgents = agents.filter((agent) => {
    if (selectedState !== "all" && agent.officeState !== selectedState) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = agent.name.toLowerCase().includes(q);
      const matchesEmail = agent.email.toLowerCase().includes(q);
      const matchesArea = agent.serviceAreas.some((a) => a.toLowerCase().includes(q));
      if (!matchesName && !matchesEmail && !matchesArea) return false;
    }
    return true;
  });

  const handleSaveAgent = (agentData: any) => {
    toast.success(`Agent ${agentData.name} saved successfully!`);
    setIsFormOpen(false);
    setEditingAgent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Brokerage Agent Directory"
        description="Managing standing cross-posting preferences & service area coverage across ~150 agents."
        actions={
          <Button
            onClick={() => {
              setEditingAgent(null);
              setIsFormOpen(true);
            }}
            className="text-xs gap-1.5"
          >
            <Plus className="size-3.5" /> Enroll Agent
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="size-4 text-muted-foreground absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search agent name, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-input text-xs"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">Filter Office:</span>
          <div className="w-56">
            <Combobox
              options={STATE_OPTIONS}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="Filter state..."
              searchPlaceholder="Search state..."
              className="h-9 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Agents Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent Name &amp; Email</TableHead>
              <TableHead>Office State</TableHead>
              <TableHead>Service Areas Covered</TableHead>
              <TableHead>Cross-Post Preference</TableHead>
              <TableHead>Social Links</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-semibold text-foreground">
                  <Link href={`/agents/${agent.id}`} className="hover:text-primary">
                    {agent.name}
                  </Link>
                  <div className="text-xs text-muted-foreground font-normal">{agent.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {agent.officeState}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.serviceAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="text-[10px]">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {agent.crossPostPreference === "all" && (
                    <Badge variant="success" className="text-[10px]">Duplicate All</Badge>
                  )}
                  {agent.crossPostPreference === "areaAndPrice" && (
                    <div className="space-y-0.5">
                      <Badge variant="default" className="text-[10px]">Area &amp; Price</Badge>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ${(agent.priceRangeMin || 0) / 1000}k - ${(agent.priceRangeMax || 0) / 1000}k
                      </div>
                    </div>
                  )}
                  {agent.crossPostPreference === "byRequest" && (
                    <Badge variant="warning" className="text-[10px]">By Request Only</Badge>
                  )}
                  {agent.crossPostPreference === "never" && (
                    <Badge variant="destructive" className="text-[10px]">Never</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {agent.facebookPageUrl && <Facebook className="size-4 text-primary" />}
                    {agent.instagramPageUrl && <Instagram className="size-4 text-primary" />}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingAgent(agent);
                      setIsFormOpen(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <AgentForm
          initialValues={editingAgent || undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAgent(null);
          }}
          onSubmit={handleSaveAgent}
        />
      )}
    </div>
  );
}
