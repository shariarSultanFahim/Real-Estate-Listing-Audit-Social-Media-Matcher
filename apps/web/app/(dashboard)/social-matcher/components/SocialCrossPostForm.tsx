"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MatchQuerySchema } from "@real-estate/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Sparkles, MapPin, DollarSign } from "lucide-react";
import { z } from "zod";

type FormData = z.infer<typeof MatchQuerySchema>;

const SERVICE_CITIES = [
  "New Orleans",
  "Covington",
  "Mandeville",
  "Slidell",
  "Bush",
  "Gulfport",
  "Biloxi",
  "Bay St. Louis",
  "Mobile",
  "Fairhope",
  "Daphne",
];

interface SocialCrossPostFormProps {
  onSearch: (data: FormData) => void;
  isLoading?: boolean;
}

export function SocialCrossPostForm({ onSearch, isLoading }: SocialCrossPostFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(MatchQuerySchema),
    defaultValues: {
      city: "Covington",
      price: 450000,
    },
  });

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
            <select
              {...register("city")}
              className="h-10 w-full rounded-lg bg-background border border-input text-sm px-3 text-foreground focus:ring-1 focus:ring-ring"
            >
              {SERVICE_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
