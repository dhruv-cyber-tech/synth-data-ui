import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import { motion } from "framer-motion";

const Categories = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories-with-counts"],
    queryFn: async () => {
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .is("parent_category_id", null);

      const { data: prompts } = await supabase
        .from("prompts")
        .select("category_id")
        .eq("status", "published");

      const countMap: Record<number, number> = {};
      prompts?.forEach((p) => {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      });

      return cats?.map((c) => ({ ...c, promptCount: countMap[c.category_id] || 0 })) || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">// CATEGORIES</p>
            <h1 className="text-4xl font-bold text-foreground mb-2">Browse by Category</h1>
            <p className="text-muted-foreground font-mono text-sm">
              Find the perfect prompt for your use case
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-card/30 animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.map((cat, i) => (
                <CategoryCard key={cat.category_id} category={cat} promptCount={cat.promptCount} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
