"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Building2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cresentsothebys.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome back! Signed in as Brokerage Admin");
      router.push("/");
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md glass-panel border-slate-800 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-3 pb-6 border-b border-slate-800/80">
          <div className="mx-auto size-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 glow-border-indigo">
            <Building2 className="size-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Crescent Sotheby&apos;s
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Listing Audit &amp; Social Cross-Post Matcher Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Staff Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cresentsothebys.com"
                  required
                  className="bg-slate-900/80 border-slate-800 text-white pl-9"
                />
                <ShieldCheck className="size-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/80 border-slate-800 text-white pl-9"
                />
                <Lock className="size-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-all glow-border-indigo mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In to Dashboard"}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-800/80 pt-4 text-xs text-slate-500">
          Internal Brokerage System • Read-Only Detection Mode
        </CardFooter>
      </Card>
    </div>
  );
}
