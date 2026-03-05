import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for the reset link!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-green">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Prompt<span className="text-primary">Lab</span>
          </span>
        </Link>

        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8">
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">// PASSWORD RECOVERY</p>
          <h1 className="text-2xl font-bold text-foreground mb-1">Reset password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a reset link.</p>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Reset link sent! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="bg-background border-border focus:border-primary" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green h-11 font-semibold">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <Link to="/auth" className="flex items-center justify-center gap-1 mt-6 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
