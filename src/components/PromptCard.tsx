import { motion } from "framer-motion";
import { Star, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface PromptCardProps {
  prompt: {
    prompt_id: number;
    title: string;
    description: string | null;
    price: number;
    ai_model_target: string | null;
    category_name?: string;
    category_icon?: string;
    avg_rating?: number;
    review_count?: number;
    creator_name?: string;
  };
  index?: number;
}

const PromptCard = ({ prompt, index = 0 }: PromptCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={`/prompt/${prompt.prompt_id}`}>
        <div className="group relative rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/30 transition-all duration-300 hover:glow-green h-full flex flex-col">
          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {prompt.category_icon && (
                <span className="text-lg">{prompt.category_icon}</span>
              )}
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {prompt.category_name || "Prompt"}
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {/* Title & desc */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {prompt.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-2">
            {prompt.description}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              {prompt.ai_model_target && (
                <Badge variant="secondary" className="text-xs font-mono bg-secondary text-secondary-foreground">
                  {prompt.ai_model_target}
                </Badge>
              )}
              {prompt.avg_rating !== undefined && prompt.avg_rating > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span>{prompt.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <span className="text-lg font-bold text-primary font-mono">
              ${prompt.price.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PromptCard;
