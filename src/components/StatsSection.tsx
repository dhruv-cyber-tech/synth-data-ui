import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatsSection = () => {
  const { data: stats } = useQuery({
    queryKey: ["marketplace-stats"],
    queryFn: async () => {
      const [promptsRes, usersRes, reviewsRes] = await Promise.all([
        supabase.from("prompts").select("prompt_id", { count: "exact", head: true }),
        supabase.from("users").select("user_id", { count: "exact", head: true }),
        supabase.from("reviews").select("review_id", { count: "exact", head: true }),
      ]);
      return {
        prompts: promptsRes.count || 0,
        users: usersRes.count || 0,
        reviews: reviewsRes.count || 0,
      };
    },
  });

  const items = [
    { label: "Prompts Listed", value: stats?.prompts || 0, suffix: "+" },
    { label: "Active Users", value: stats?.users || 0, suffix: "+" },
    { label: "Verified Reviews", value: stats?.reviews || 0, suffix: "+" },
  ];

  return (
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl font-bold font-mono text-primary text-glow-green mb-2">
                {item.value}{item.suffix}
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
