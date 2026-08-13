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

import { Combobox } from "@/components/ui/combobox";

type FormData = z.infer<typeof AgentSchema>;

const OFFICE_OPTIONS = [
  { value: "LA", label: "Louisiana (LA Office)" },
  { value: "MS", label: "Mississippi (MS Office)" },
  { value: "AL", label: "Alabama (AL Office)" },
];

const PREFERENCE_OPTIONS = [
  { value: "all", label: "Duplicate All New Brokerage Postings" },
  { value: "areaAndPrice", label: "Only Specific Service Area & Price Threshold" },
  { value: "byRequest", label: "Only by Special Request (Manual)" },
  { value: "never", label: "Never Cross-Post Automatically" },
];

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
  const officeState = watch("officeState");

  const handleFormSubmit = (data: FormData) => {
    const areas = serviceAreasInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({ ...data, serviceAreas: areas });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-border shadow-2xl relative">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              {initialValues ? "Edit Agent Preferences" : "Enroll New Agent"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set standing social cross-posting rules &amp; service area boundaries.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Agent Full Name</label>
                <Input {...register("name")} className="bg-background border-input text-xs" />
                {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email Address</label>
                <Input type="email" {...register("email")} className="bg-background border-input text-xs" />
                {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Office Location</label>
                <Combobox
                  options={OFFICE_OPTIONS}
                  value={officeState}
                  onChange={(val) => setValue("officeState", val as any, { shouldValidate: true })}
                  placeholder="Select office..."
                  searchPlaceholder="Search office..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Phone (Optional)</label>
                <Input {...register("phone")} className="bg-background border-input text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Service Areas (Comma separated)</label>
              <Input
                value={serviceAreasInput}
                onChange={(e) => setServiceAreasInput(e.target.value)}
                placeholder="Covington, Mandeville, Slidell"
                className="bg-background border-input text-xs"
              />
            </div>

            <div className="space-y-1 border-t border-border pt-3">
              <label className="text-xs font-semibold text-primary">Social Cross-Post Preference</label>
              <Combobox
                options={PREFERENCE_OPTIONS}
                value={preference}
                onChange={(val) => setValue("crossPostPreference", val as any, { shouldValidate: true })}
                placeholder="Select preference..."
                searchPlaceholder="Search preference..."
                className="h-9 text-xs"
              />
            </div>

            {preference === "areaAndPrice" && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Price Min ($)</label>
                  <Input type="number" {...register("priceRangeMin", { valueAsNumber: true })} className="bg-background border-input text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Price Max ($)</label>
                  <Input type="number" {...register("priceRangeMax", { valueAsNumber: true })} className="bg-background border-input text-xs" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Facebook Page URL</label>
                <Input {...register("facebookPageUrl")} placeholder="https://facebook.com/..." className="bg-background border-input text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Instagram Handle URL</label>
                <Input {...register("instagramPageUrl")} placeholder="https://instagram.com/..." className="bg-background border-input text-xs" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" className="text-xs gap-1.5">
              <Save className="size-3.5" /> Save Agent Profile
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
