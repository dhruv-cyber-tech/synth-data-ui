import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting: boolean;
}

const ReviewForm = ({ onSubmit, isSubmitting }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;
    onSubmit(rating, comment);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card/30 p-6 space-y-4">
      <h4 className="text-sm font-mono text-primary uppercase tracking-widest">// WRITE A REVIEW</h4>

      {/* Star rating */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Your comment (optional)</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this prompt..."
          className="bg-background/50 border-border resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground font-mono">
          ⓘ Reviews are published after admin approval
        </p>
        <Button
          type="submit"
          disabled={rating < 1 || isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          size="sm"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
