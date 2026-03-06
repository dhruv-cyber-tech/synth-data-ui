import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 scanline pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-mono text-primary mb-8"
          >
            <Sparkles className="h-3 w-3" />
            AI-POWERED PROMPT MARKETPLACE
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-6">
            <span className="text-foreground">Ship Better</span>
            <br />
            <span className="text-primary text-glow-green">AI Prompts</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground mb-10 leading-relaxed">
            Discover, buy, and sell production-ready prompts for GPT-4, Claude, Midjourney and more. 
            Built by engineers, for engineers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/prompts">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green h-12 px-8 text-base font-semibold">
                Explore Prompts
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button size="lg" variant="outline" className="border-border hover:border-primary/40 hover:bg-primary/5 h-12 px-8 text-base">
                <Terminal className="h-4 w-4 mr-1" />
                Sell Your Prompts
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Terminal snippet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 mx-auto max-w-2xl"
        >
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden glow-green">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-accent/40" />
              <div className="h-3 w-3 rounded-full bg-primary/60" />
              <span className="ml-2 text-xs font-mono text-muted-foreground">promptlab.sh</span>
            </div>
            <div className="p-6 font-mono text-sm text-left space-y-2">
              <p><span className="text-primary">$</span> <span className="text-muted-foreground">promptlab search</span> <span className="text-accent">"python bug fixer"</span></p>
              <p className="text-muted-foreground/60">→ Found 12 results in 0.03s</p>
              <p><span className="text-primary">$</span> <span className="text-muted-foreground">promptlab install</span> <span className="text-accent">prompt-id-4</span></p>
              <p className="text-terminal-green">✓ Python Bug Fixer v1.0 installed — $12.99</p>
              <p className="text-muted-foreground/40 animate-pulse-glow">█</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
