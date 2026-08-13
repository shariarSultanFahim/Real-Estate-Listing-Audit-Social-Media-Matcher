"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentSchema } from "@real-estate/validation";
import { Agent } from "@real-estate/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { X, Save, UserCheck } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

type FormData = z.infer<typeof AgentSchema>;

interface AgentFormProps {
  initialValues?: Partial<Agent>;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export function AgentForm({ initialValues, onClose, onSubmit }: AgentFormProps) {
  const [serviceAreasInput, setServiceAreasInput] = useState(
    initialValues?.serviceAreas ? initialValues.serviceAreas.join(", ") : "New Orleans, Metairie"
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(AgentSchema),
    defaultValues: {
      id: initialValues?.id || `agent-${Date.now()}`,
      name: initialValues?.name || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      officeState: initialValues?.officeState || "LA",
      serviceAreas: initialValues?.serviceAreas || ["New Orleans"],
      facebookPageUrl: initialValues?.facebookPageUrl || "",
      instagramPageUrl: initialValues?.instagramPageUrl || "",
      crossPostPreference: initialValues?.crossPostPreference || "areaAndPrice",
      priceRangeMin: initialValues?.priceRangeMin || 250000,
      priceRangeMax: initialValues?.priceRangeMax || 850000,
    },
  });

  const preference = watch("crossPostPreference");

  const handleFormSubmit = (data: FormData) => {
    const areas = serviceAreasInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({ ...data, serviceAreas: areas });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-xl glass-panel border-slate-800 shadow-2xl relative">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <UserCheck className="size-5 text-indigo-400" />
              {initialValues ? "Edit Agent Preferences" : "Enroll New Agent"}
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Set standing social cross-posting rules &amp; service area boundaries.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="size-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Agent Full Name</label>
                <Input {...register("name")} className="bg-slate-900 border-slate-800 text-xs" />
                {errors.name && <p className="text-[10px] text-rose-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Email Address</label>
                <Input type="email" {...register("email")} className="bg-slate-900 border-slate-800 text-xs" />
                {errors.email && <p className="text-[10px] text-rose-400">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Office Location</label>
                <select {...register("officeState")} className="h-9 w-full rounded-md bg-slate-900 border border-slate-800 text-xs px-2 text-white">
                  <option value="LA">Louisiana (LA Office)</option>
                  <option value="MS">Mississippi (MS Office)</option>
                  <option value="AL">Alabama (AL Office)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Phone (Optional)</label>
                <Input {...register("phone")} className="bg-slate-900 border-slate-800 text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Service Areas (Comma separated)</label>
              <Input
                value={serviceAreasInput}
                onChange={(e) => setServiceAreasInput(e.target.value)}
                placeholder="Covington, Mandeville, Slidell"
                className="bg-slate-900 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1 border-t border-slate-800 pt-3">
              <label className="text-xs font-semibold text-indigo-300">Social Cross-Post Preference</label>
              <select {...register("crossPostPreference")} className="h-9 w-full rounded-md bg-slate-900 border border-slate-800 text-xs px-2 text-white">
                <option value="all">Duplicate All New Brokerage Postings</option>
                <option value="areaAndPrice">Only Specific Service Area &amp; Price Threshold</option>
                <option value="byRequest">Only by Special Request (Manual)</option>
                <option value="never">Never Cross-Post Automatically</option>
              </select>
            </div>

            {preference === "areaAndPrice" && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Price Min ($)</label>
                  <Input type="number" {...register("priceRangeMin", { valueAsNumber: true })} className="bg-slate-900 border-slate-800 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Price Max ($)</label>
                  <Input type="number" {...register("priceRangeMax", { valueAsNumber: true })} className="bg-slate-900 border-slate-800 text-xs" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Facebook Page URL</label>
                <Input {...register("facebookPageUrl")} placeholder="https://facebook.com/..." className="bg-slate-900 border-slate-800 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Instagram Handle URL</label>
                <Input {...register("instagramPageUrl")} placeholder="https://instagram.com/..." className="bg-slate-900 border-slate-800 text-xs" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-slate-800 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs border-slate-800">
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5">
              <Save className="size-3.5" /> Save Agent Profile
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
