import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CategoryCard from "./CategoryCard";
import { motion } from "framer-motion";

const CategoriesSection = () => {
  const { data: categories } = useQuery({
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
    <section className="py-24 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">// CATEGORIES</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Browse by Category</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories?.map((cat, i) => (
            <CategoryCard key={cat.category_id} category={cat} promptCount={cat.promptCount} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
