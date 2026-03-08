import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Download } from "lucide-react";

interface Purchase {
  purchase_id: number;
  prompt_id: number;
  prompt_title: string;
  amount_paid: number;
  purchased_at: string;
  payment_status: string;
}

const ProfilePurchases = ({ purchases, isLoading }: { purchases: Purchase[] | undefined; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-card/30 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!purchases?.length) {
    return (
      <div className="text-center py-12 rounded-xl border border-border bg-card/30">
        <p className="text-muted-foreground font-mono text-sm">You haven't purchased any prompts yet.</p>
        <Link to="/prompts" className="text-primary text-sm mt-2 inline-block hover:underline">
          Explore the marketplace →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {purchases.map((p) => (
        <Link
          key={p.purchase_id}
          to={`/prompt/${p.prompt_id}`}
          className="group flex items-center justify-between rounded-lg border border-border bg-card/50 p-4 hover:border-primary/30 transition-all"
        >
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {p.prompt_title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(p.purchased_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <Badge variant="outline" className="font-mono text-xs border-border">
              {p.payment_status}
            </Badge>
            <span className="text-primary font-mono font-bold">${p.amount_paid.toFixed(2)}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProfilePurchases;
