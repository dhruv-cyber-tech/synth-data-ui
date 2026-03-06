import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/PromptCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const Prompts = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*");
      return data || [];
    },
  });

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["all-prompts", categoryFilter, search],
    queryFn: async () => {
      let query = supabase
        .from("prompts")
        .select("*, categories(name, icon_url)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (categoryFilter) {
        query = query.eq("category_id", parseInt(categoryFilter));
      }
      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data: promptsData, error } = await query;
      if (error) throw error;

      const promptIds = promptsData.map((p) => p.prompt_id);
      const creatorIds = [...new Set(promptsData.map((p) => p.creator_id))];

      const [{ data: reviews }, { data: creators }] = await Promise.all([
        supabase.from("reviews").select("prompt_id, rating").in("prompt_id", promptIds),
        supabase.from("public_profiles" as any).select("user_id, username").in("user_id", creatorIds),
      ]);

      const ratingMap: Record<number, { sum: number; count: number }> = {};
      reviews?.forEach((r: any) => {
        if (!ratingMap[r.prompt_id]) ratingMap[r.prompt_id] = { sum: 0, count: 0 };
        ratingMap[r.prompt_id].sum += r.rating;
        ratingMap[r.prompt_id].count += 1;
      });

      const creatorMap: Record<number, string> = {};
      (creators as any[])?.forEach((c: any) => { creatorMap[c.user_id] = c.username; });

      return promptsData.map((p) => ({
        ...p,
        category_name: (p.categories as any)?.name,
        category_icon: (p.categories as any)?.icon_url,
        avg_rating: ratingMap[p.prompt_id] ? ratingMap[p.prompt_id].sum / ratingMap[p.prompt_id].count : 0,
        review_count: ratingMap[p.prompt_id]?.count || 0,
        creator_name: creatorMap[p.creator_id] || "Anonymous",
      }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">// EXPLORE</p>
            <h1 className="text-4xl font-bold text-foreground mb-6">Prompt Marketplace</h1>

            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={activeTag === null ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setActiveTag(null)}
              >
                All
              </Badge>
              {tags?.map((tag) => (
                <Badge
                  key={tag.tag_id}
                  variant={activeTag === tag.slug ? "default" : "secondary"}
                  className="cursor-pointer font-mono text-xs"
                  onClick={() => setActiveTag(activeTag === tag.slug ? null : tag.slug)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 rounded-xl bg-card/30 animate-pulse border border-border" />
              ))}
            </div>
          ) : prompts?.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-mono">No prompts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts?.map((prompt, i) => (
                <PromptCard key={prompt.prompt_id} prompt={prompt} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Prompts;
