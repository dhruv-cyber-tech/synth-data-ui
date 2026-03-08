import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingCart, FileText, Users, Clock } from "lucide-react";

const statCards = [
  { key: "total_prompts", label: "Published Prompts", icon: FileText, color: "text-primary" },
  { key: "total_users", label: "Total Users", icon: Users, color: "text-accent" },
  { key: "total_purchases", label: "Total Purchases", icon: ShoppingCart, color: "text-primary" },
  { key: "total_revenue", label: "Total Revenue", icon: DollarSign, color: "text-primary" },
  { key: "pending_reviews", label: "Pending Reviews", icon: Clock, color: "text-destructive" },
];

const AdminStats = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_get_summary", {});
      if (error) throw error;
      return (data as any[])?.[0] || {};
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-card/30 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {statCards.map((card) => {
        const value = summary?.[card.key] ?? 0;
        const display = card.key === "total_revenue" ? `$${Number(value).toFixed(2)}` : value;
        return (
          <div
            key={card.key}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground font-mono">{display}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;
