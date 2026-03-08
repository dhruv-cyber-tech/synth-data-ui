import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminPrompts from "@/components/admin/AdminPrompts";
import AdminStats from "@/components/admin/AdminStats";
import AdminAnalyticsCharts from "@/components/admin/AdminAnalyticsCharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, MessageSquare, FileText, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("is_admin", {});
      return data as boolean;
    },
    enabled: !!user,
  });

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 rounded-xl bg-card/30 animate-pulse border border-border" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground font-mono text-sm mb-4">You don't have admin privileges.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-background/80 backdrop-blur-xl">
            <SidebarTrigger className="mr-3" />
            <Shield className="h-5 w-5 text-primary mr-2" />
            <h1 className="text-lg font-bold text-foreground">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
          </header>

          <main className="flex-1 p-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AdminStats />

              <Tabs defaultValue="analytics">
                <TabsList className="bg-card border border-border mb-6">
                  <TabsTrigger value="analytics" className="gap-2 font-mono text-xs">
                    <BarChart3 className="h-3.5 w-3.5" /> Analytics
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="gap-2 font-mono text-xs">
                    <MessageSquare className="h-3.5 w-3.5" /> Pending Reviews
                  </TabsTrigger>
                  <TabsTrigger value="prompts" className="gap-2 font-mono text-xs">
                    <FileText className="h-3.5 w-3.5" /> All Prompts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics">
                  <AdminAnalyticsCharts />
                </TabsContent>
                <TabsContent value="reviews">
                  <AdminReviews />
                </TabsContent>
                <TabsContent value="prompts">
                  <AdminPrompts />
                </TabsContent>
              </Tabs>
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
