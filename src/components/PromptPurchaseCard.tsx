import { motion } from "framer-motion";
import { Star, ShoppingCart, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PromptPurchaseCardProps {
  price: number;
  avgRating: number;
  reviewCount: number;
  creator: { username: string; profile_bio: string | null } | null;
  hasPurchased: boolean;
  isPurchasing: boolean;
  onBuy: () => void;
}

const PromptPurchaseCard = ({
  price, avgRating, reviewCount, creator, hasPurchased, isPurchasing, onBuy,
}: PromptPurchaseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="sticky top-24 rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 glow-green">
        <div className="text-4xl font-bold font-mono text-primary mb-2">
          ${price.toFixed(2)}
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
              {avgRating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}

        {hasPurchased ? (
          <Button disabled className="w-full h-12 text-base font-semibold mb-3 bg-accent text-accent-foreground">
            <Check className="h-4 w-4 mr-2" />
            Purchased
          </Button>
        ) : (
          <Button
            onClick={onBuy}
            disabled={isPurchasing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green h-12 text-base font-semibold mb-3"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isPurchasing ? "Processing..." : "Buy Now"}
          </Button>
        )}

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
  );
};

export default PromptPurchaseCard;
