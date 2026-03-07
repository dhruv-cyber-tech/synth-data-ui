import { Star, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PromptReviewsProps {
  reviews: Array<{
    review_id: number;
    buyer_id: number;
    rating: number;
    comment: string | null;
    is_verified: boolean;
  }> | undefined;
}

const PromptReviews = ({ reviews }: PromptReviewsProps) => {
  const verifiedReviews = reviews?.filter((r) => r.is_verified) || [];
  const pendingCount = (reviews?.length || 0) - verifiedReviews.length;

  return (
    <div>
      <h3 className="text-sm font-mono text-primary uppercase tracking-widest mb-4">
        // REVIEWS ({verifiedReviews.length})
      </h3>
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground font-mono bg-accent/10 border border-border rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5" />
          {pendingCount} review{pendingCount > 1 ? "s" : ""} pending admin approval
        </div>
      )}
      {verifiedReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No verified reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {verifiedReviews.map((review) => (
            <div key={review.review_id} className="rounded-xl border border-border bg-card/30 p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Buyer #{review.buyer_id}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Verified</Badge>
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
  );
};

export default PromptReviews;
