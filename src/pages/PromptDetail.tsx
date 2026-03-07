import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptPurchaseCard from "@/components/PromptPurchaseCard";
import PromptContent from "@/components/PromptContent";
import PromptVersions from "@/components/PromptVersions";
import PromptReviews from "@/components/PromptReviews";
import ReviewForm from "@/components/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: prompt, isLoading } = useQuery({
    queryKey: ["prompt-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*, categories(name, icon_url)")
        .eq("prompt_id", parseInt(id!))
        .single();
      if (error) throw error;

      const { data: creator } = await supabase
        .from("public_profiles" as any)
        .select("username, profile_bio")
        .eq("user_id", data.creator_id)
        .single();

      return { ...data, creator };
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["prompt-reviews", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("prompt_id", parseInt(id!))
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: versions } = useQuery({
    queryKey: ["prompt-versions", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompt_versions")
        .select("*")
        .eq("prompt_id", parseInt(id!))
        .order("version_number", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: hasPurchased } = useQuery({
    queryKey: ["has-purchased", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_purchased", {
        p_prompt_id: parseInt(id!),
      });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!id && !!user,
  });

  const { data: hasReviewed } = useQuery({
    queryKey: ["has-reviewed", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_reviewed", {
        p_prompt_id: parseInt(id!),
      });
      if (error) return false;
      return data as boolean;
    },
    enabled: !!id && !!user && !!hasPurchased,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("purchase_prompt", {
        p_prompt_id: parseInt(id!),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Prompt purchased successfully!");
      queryClient.invalidateQueries({ queryKey: ["has-purchased", id] });
    },
    onError: (error: any) => {
      if (error.message?.includes("Already purchased")) {
        toast.info("You already own this prompt.");
      } else {
        toast.error("Purchase failed. Please try again.");
      }
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      const { data, error } = await supabase.rpc("submit_review", {
        p_prompt_id: parseInt(id!),
        p_rating: rating as unknown as number,
        p_comment: comment || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted! It will appear after admin approval.");
      queryClient.invalidateQueries({ queryKey: ["has-reviewed", id] });
      queryClient.invalidateQueries({ queryKey: ["prompt-reviews", id] });
    },
    onError: (error: any) => {
      if (error.message?.includes("already reviewed")) {
        toast.info("You have already reviewed this prompt.");
      } else {
        toast.error("Failed to submit review.");
      }
    },
  });

  const handleBuy = () => {
    if (!user) {
      toast.error("Please sign in to purchase prompts.");
      return;
    }
    purchaseMutation.mutate();
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    reviewMutation.mutate({ rating, comment });
  };

  const avgRating = reviews?.length
    ? reviews.filter(r => r.is_verified).reduce((sum, r) => sum + r.rating, 0) / (reviews.filter(r => r.is_verified).length || 1)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6">
          <div className="h-96 rounded-xl bg-card/30 animate-pulse border border-border" />
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center">
          <p className="text-muted-foreground font-mono">Prompt not found.</p>
        </div>
      </div>
    );
  }

  const creator = (prompt as any).creator;
  const category = prompt.categories as any;
  const latestContent = versions?.[0]?.content;
  const showReviewForm = hasPurchased && !hasReviewed;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/prompts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to prompts
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{category?.icon_url}</span>
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{category?.name}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{prompt.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{prompt.description}</p>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-3">
                {prompt.ai_model_target && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {prompt.ai_model_target}
                  </Badge>
                )}
                <Badge variant="outline" className="font-mono text-xs border-border">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(prompt.created_at).toLocaleDateString()}
                </Badge>
                {versions && versions.length > 0 && (
                  <Badge variant="outline" className="font-mono text-xs border-border">
                    <Layers className="h-3 w-3 mr-1" />
                    v{versions[0].version_number}
                  </Badge>
                )}
              </div>

              {/* Prompt Content */}
              <PromptContent
                hasPurchased={!!hasPurchased}
                content={latestContent}
                title={prompt.title}
              />

              {/* Versions */}
              <PromptVersions versions={versions} />

              {/* Review Form (only for buyers who haven't reviewed yet) */}
              {showReviewForm && (
                <ReviewForm
                  onSubmit={handleReviewSubmit}
                  isSubmitting={reviewMutation.isPending}
                />
              )}

              {/* Reviews */}
              <PromptReviews reviews={reviews} />
            </motion.div>

            {/* Sidebar */}
            <PromptPurchaseCard
              price={prompt.price}
              avgRating={avgRating}
              reviewCount={reviews?.filter(r => r.is_verified).length || 0}
              creator={creator}
              hasPurchased={!!hasPurchased}
              isPurchasing={purchaseMutation.isPending}
              onBuy={handleBuy}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromptDetail;
