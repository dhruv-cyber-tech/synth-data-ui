import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePrompts from "@/components/profile/ProfilePrompts";
import ProfilePurchases from "@/components/profile/ProfilePurchases";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Package, ShoppingBag } from "lucide-react";

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const { data: myPrompts, isLoading: loadingPrompts } = useQuery({
    queryKey: ["my-prompts", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("get_my_prompts", {});
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  const { data: myPurchases, isLoading: loadingPurchases } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("get_my_purchases", {});
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6">
          <div className="h-48 rounded-xl bg-card/30 animate-pulse border border-border" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center py-20">
          <p className="text-muted-foreground font-mono mb-4">Sign in to view your profile.</p>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Sign In
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ProfileHeader profile={profile} userId={user.id} />

            <Tabs defaultValue="prompts" className="mt-8">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="prompts" className="gap-2 font-mono text-xs">
                  <Package className="h-3.5 w-3.5" /> My Prompts
                </TabsTrigger>
                <TabsTrigger value="purchases" className="gap-2 font-mono text-xs">
                  <ShoppingBag className="h-3.5 w-3.5" /> Purchases
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prompts" className="mt-6">
                <ProfilePrompts prompts={myPrompts} isLoading={loadingPrompts} />
              </TabsContent>

              <TabsContent value="purchases" className="mt-6">
                <ProfilePurchases purchases={myPurchases} isLoading={loadingPurchases} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
