import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PromptCard from "./PromptCard";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FeaturedPrompts = () => {
  const { data: prompts, isLoading } = useQuery({
    queryKey: ["featured-prompts"],
    queryFn: async () => {
      const { data: promptsData, error } = await supabase
        .from("prompts")
        .select("*, categories(name, icon_url)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Get avg ratings
      const promptIds = promptsData.map((p) => p.prompt_id);
      const { data: reviews } = await supabase
        .from("reviews")
        .select("prompt_id, rating")
        .in("prompt_id", promptIds);

      const ratingMap: Record<number, { sum: number; count: number }> = {};
      reviews?.forEach((r) => {
        if (!ratingMap[r.prompt_id]) ratingMap[r.prompt_id] = { sum: 0, count: 0 };
        ratingMap[r.prompt_id].sum += r.rating;
        ratingMap[r.prompt_id].count += 1;
      });

      return promptsData.map((p) => ({
        ...p,
        category_name: (p.categories as any)?.name,
        category_icon: (p.categories as any)?.icon_url,
        avg_rating: ratingMap[p.prompt_id]
          ? ratingMap[p.prompt_id].sum / ratingMap[p.prompt_id].count
          : 0,
        review_count: ratingMap[p.prompt_id]?.count || 0,
      }));
    },
  });

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">// FEATURED</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Top Prompts
            </h2>
          </div>
          <Link to="/prompts">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-card/30 animate-pulse border border-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts?.map((prompt, i) => (
              <PromptCard key={prompt.prompt_id} prompt={prompt} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedPrompts;
