import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, ShoppingCart, User, Clock, Layers } from "lucide-react";
import { motion } from "framer-motion";

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: prompt, isLoading } = useQuery({
    queryKey: ["prompt-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*, categories(name, icon_url)")
        .eq("prompt_id", parseInt(id!))
        .single();
      if (error) throw error;

      // Fetch creator info from secure view
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

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Link to="/prompts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to prompts
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
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

              {/* Versions */}
              {versions && versions.length > 0 && (
                <div className="rounded-xl border border-border bg-card/30 p-6">
                  <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">// VERSION HISTORY</h3>
                  <div className="space-y-4">
                    {versions.map((v) => (
                      <div key={v.version_id} className="flex items-start gap-4 border-l-2 border-primary/20 pl-4">
                        <Badge variant="secondary" className="font-mono text-xs shrink-0">v{v.version_number}</Badge>
                        <div>
                          <p className="text-sm text-foreground">{v.change_notes}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {new Date(v.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">
                  // REVIEWS ({reviews?.length || 0})
                </h3>
                {reviews?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews?.map((review) => (
                      <div key={review.review_id} className="rounded-xl border border-border bg-card/30 p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              Buyer #{review.buyer_id}
                            </span>
                            {review.is_verified && (
                              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Sidebar: Purchase card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="sticky top-24 rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 glow-green">
                <div className="text-4xl font-bold font-mono text-primary mb-2">
                  ${prompt.price.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mb-6">One-time purchase</p>

                {avgRating > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-primary text-primary" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {avgRating.toFixed(1)} ({reviews?.length})
                    </span>
                  </div>
                )}

                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green h-12 text-base font-semibold mb-3">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>

                {/* Creator info */}
                {creator && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Created by</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{creator.username}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{creator.profile_bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromptDetail;
