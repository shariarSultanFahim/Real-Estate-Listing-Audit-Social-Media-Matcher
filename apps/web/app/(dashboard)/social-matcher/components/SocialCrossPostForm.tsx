"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MatchQuerySchema } from "@real-estate/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Sparkles, MapPin, DollarSign } from "lucide-react";
import { z } from "zod";

import { Combobox } from "@/components/ui/combobox";

import { useAgents } from "@/hooks/useRealEstateApi";

type FormData = z.infer<typeof MatchQuerySchema>;

const PRESET_SERVICE_CITIES = [
  "New Orleans",
  "Uptown New Orleans",
  "French Quarter",
  "Downtown New Orleans",
  "Garden District",
  "Marigny",
  "Bywater",
  "Gentilly",
  "Lakeview",
  "Metairie",
  "Kenner",
  "Baton Rouge",
  "Lafayette",
  "Covington",
  "Mandeville",
  "Madisonville",
  "Abita Springs",
  "Slidell",
  "Bush",
  "Hammond",
  "Ponchatoula",
  "Northshore",
  "Gulfport",
  "Biloxi",
  "Ocean Springs",
  "Pascagoula",
  "Bay St. Louis",
  "Pass Christian",
  "Long Beach",
  "Diamondhead",
  "Saucier",
  "Hattiesburg",
  "Jackson",
  "Mobile",
  "Fairhope",
  "Daphne",
  "Spanish Fort",
  "Foley",
  "Orange Beach",
  "Gulf Shores",
  "Pensacola",
];

interface SocialCrossPostFormProps {
  onSearch: (data: FormData) => void;
  isLoading?: boolean;
}

export function SocialCrossPostForm({ onSearch, isLoading }: SocialCrossPostFormProps) {
  const { data: agents = [] } = useAgents();

  // Combine preset cities with all live agent service areas from the database
  const agentAreas = agents.flatMap((a) => a.serviceAreas || []);
  const allCities = Array.from(new Set([...PRESET_SERVICE_CITIES, ...agentAreas])).sort((a, b) =>
    a.localeCompare(b)
  );
  const cityOptions = allCities.map((c) => ({ value: c, label: c }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(MatchQuerySchema),
    defaultValues: {
      city: "Covington",
      price: 450000,
    },
  });

  const selectedCity = watch("city");

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Social Cross-Posting Agent Matcher
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Instantly matches live listing area &amp; price against standing agent preferences across ~150 brokerage agents.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* City / Area Combobox Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              Listing City / Service Area
            </label>
            <Combobox
              options={cityOptions}
              value={selectedCity}
              onChange={(val) => setValue("city", val, { shouldValidate: true })}
              placeholder="Select city..."
              searchPlaceholder="Search city..."
            />
            {errors.city && <p className="text-[10px] text-destructive">{errors.city.message}</p>}
          </div>

          {/* Listing Price Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-primary" />
              Listing Price ($)
            </label>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="h-10 bg-background border-input text-sm font-semibold text-primary"
            />
            {errors.price && <p className="text-[10px] text-destructive">{errors.price.message}</p>}
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 font-medium gap-2 shadow-md"
          >
            <Search className="size-4" />
            {isLoading ? "Matching Agents..." : "Run Matcher Algorithm"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
