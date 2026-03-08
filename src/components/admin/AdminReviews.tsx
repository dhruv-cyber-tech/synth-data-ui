import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star } from "lucide-react";
import { toast } from "sonner";

const AdminReviews = () => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-pending-reviews"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_get_pending_reviews", {});
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const { error } = await (supabase.rpc as any)("admin_approve_review", { p_review_id: reviewId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review approved!");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-reviews"] });
    },
    onError: () => toast.error("Failed to approve review."),
  });

  const rejectMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const { error } = await (supabase.rpc as any)("admin_reject_review", { p_review_id: reviewId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review rejected and removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-reviews"] });
    },
    onError: () => toast.error("Failed to reject review."),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-card/30 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div className="text-center py-16 rounded-xl border border-border bg-card/30">
        <Check className="h-10 w-10 text-primary mx-auto mb-3" />
        <p className="text-muted-foreground font-mono text-sm">No pending reviews. All caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {reviews.length} pending review{reviews.length !== 1 && "s"}
      </p>
      {reviews.map((r: any) => (
        <div
          key={r.review_id}
          className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-foreground">{r.prompt_title}</span>
                <Badge variant="outline" className="font-mono text-xs border-border">
                  by {r.buyer_username}
                </Badge>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              )}
              <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => approveMutation.mutate(r.review_id)}
                disabled={approveMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
              >
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => rejectMutation.mutate(r.review_id)}
                disabled={rejectMutation.isPending}
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminReviews;
