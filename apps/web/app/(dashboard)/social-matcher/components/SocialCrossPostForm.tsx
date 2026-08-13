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
    <Card className="glass-panel border-indigo-500/30 glow-border-indigo">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Sparkles className="size-5 text-indigo-400" />
          Social Cross-Posting Agent Matcher
        </CardTitle>
        <p className="text-xs text-slate-400">
          Instantly matches live listing area &amp; price against standing agent preferences across ~150 brokerage agents.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSearch)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* City / Area Combobox Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-indigo-400" />
              Listing City / Service Area
            </label>
            <select
              {...register("city")}
              className="h-10 w-full rounded-lg bg-slate-900 border border-slate-800 text-sm px-3 text-white focus:ring-1 focus:ring-indigo-500"
            >
              {SERVICE_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-[10px] text-rose-400">{errors.city.message}</p>}
          </div>

          {/* Listing Price Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-indigo-400" />
              Listing Price ($)
            </label>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="h-10 bg-slate-900 border-slate-800 text-sm font-semibold text-indigo-300"
            />
            {errors.price && <p className="text-[10px] text-rose-400">{errors.price.message}</p>}
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-2 shadow-lg shadow-indigo-600/25"
          >
            <Search className="size-4" />
            {isLoading ? "Matching Agents..." : "Run Matcher Algorithm"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
