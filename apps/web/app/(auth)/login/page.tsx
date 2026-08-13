"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, Building2, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { loginByEmail } = useAuth();
  const [email, setEmail] = useState("admin@cresentsothebys.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const user = loginByEmail(email);
      setIsLoading(false);
      toast.success(`Welcome back, ${user.name}! Signed in as ${user.accountType === "superAdmin" ? "Super Admin" : "Employee"}`);
      router.push("/");
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md border-border shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-3 pb-6 border-b border-border">
          <div className="mx-auto size-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Building2 className="size-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Crescent Sotheby&apos;s
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Listing Audit &amp; Social Cross-Post Matcher Portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Staff Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cresentsothebys.com"
                  required
                  className="bg-background border-input text-foreground pl-9"
                />
                <ShieldCheck className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background border-input text-foreground pl-9"
                />
                <Lock className="size-4 text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-medium py-2 rounded-lg transition-all mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In to Dashboard"}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-border pt-4 text-xs text-muted-foreground">
          Internal Brokerage System • Read-Only Detection Mode
        </CardFooter>
      </Card>
    </div>
  );
}
