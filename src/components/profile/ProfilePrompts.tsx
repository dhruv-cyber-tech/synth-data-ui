import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface Prompt {
  prompt_id: number;
  title: string;
  description: string | null;
  price: number;
  status: string;
  created_at: string;
  ai_model_target: string | null;
}

const ProfilePrompts = ({ prompts, isLoading }: { prompts: Prompt[] | undefined; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-card/30 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!prompts?.length) {
    return (
      <div className="text-center py-12 rounded-xl border border-border bg-card/30">
        <p className="text-muted-foreground font-mono text-sm">You haven't published any prompts yet.</p>
        <Link to="/sell" className="text-primary text-sm mt-2 inline-block hover:underline">
          Create your first prompt →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prompts.map((p) => (
        <Link
          key={p.prompt_id}
          to={`/prompt/${p.prompt_id}`}
          className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 hover:border-primary/30 transition-all"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {p.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <Badge variant={p.status === "published" ? "default" : "secondary"} className="font-mono text-xs">
              {p.status}
            </Badge>
            <span className="text-primary font-mono font-bold">${p.price.toFixed(2)}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProfilePrompts;
