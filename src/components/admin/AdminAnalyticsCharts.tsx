import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const AdminAnalyticsCharts = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_get_analytics", {});
      if (error) throw error;
      return ((data as any[]) || []).map((d: any) => ({
        ...d,
        date: new Date(d.recorded_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-card/30 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!analytics?.length) {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-card/30">
        <p className="text-muted-foreground font-mono text-sm">
          No analytics data yet. Data will appear as purchases are made.
        </p>
      </div>
    );
  }

  const chartStyle = {
    fontSize: 11,
    fontFamily: "JetBrains Mono, monospace",
    fill: "hsl(215, 12%, 50%)",
  };

  const tooltipStyle = {
    backgroundColor: "hsl(220, 18%, 7%)",
    border: "1px solid hsl(220, 16%, 16%)",
    borderRadius: "8px",
    fontSize: 12,
    fontFamily: "JetBrains Mono, monospace",
  };

  return (
    <div className="space-y-6">
      {/* Revenue chart */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Revenue Over Time
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={analytics}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
            <XAxis dataKey="date" tick={chartStyle} axisLine={false} tickLine={false} />
            <YAxis tick={chartStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "hsl(210, 20%, 92%)" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="total_revenue"
              stroke="hsl(160, 100%, 50%)"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Purchases & Views chart */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Purchases & Views
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={analytics}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
            <XAxis dataKey="date" tick={chartStyle} axisLine={false} tickLine={false} />
            <YAxis tick={chartStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "hsl(210, 20%, 92%)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
            />
            <Bar
              dataKey="total_purchases"
              name="Purchases"
              fill="hsl(160, 100%, 50%)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="total_views"
              name="Views"
              fill="hsl(270, 80%, 65%)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalyticsCharts;
