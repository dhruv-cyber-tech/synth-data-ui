import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Eye, Ban, CheckCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const AdminPrompts = () => {
  const queryClient = useQueryClient();

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["admin-prompts"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("admin_get_prompts", {});
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ promptId, status }: { promptId: number; status: string }) => {
      const { error } = await (supabase.rpc as any)("admin_update_prompt_status", {
        p_prompt_id: promptId,
        p_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Prompt status updated!");
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
    },
    onError: () => toast.error("Failed to update status."),
  });

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
      <div className="text-center py-16 rounded-xl border border-border bg-card/30">
        <p className="text-muted-foreground font-mono text-sm">No prompts in the system yet.</p>
      </div>
    );
  }

  const statusColor = (s: string) => {
    if (s === "published") return "default";
    if (s === "removed") return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {prompts.length} total prompt{prompts.length !== 1 && "s"}
      </p>
      {prompts.map((p: any) => (
        <div
          key={p.prompt_id}
          className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/prompt/${p.prompt_id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors truncate"
                >
                  {p.title}
                </Link>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span>by {p.creator_username}</span>
                <span>${p.price.toFixed(2)}</span>
                {p.ai_model_target && <span>{p.ai_model_target}</span>}
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusColor(p.status) as any} className="font-mono text-xs">
                {p.status}
              </Badge>
              {p.status !== "published" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => statusMutation.mutate({ promptId: p.prompt_id, status: "published" })}
                  disabled={statusMutation.isPending}
                  className="gap-1 border-border text-foreground hover:text-primary"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Publish
                </Button>
              )}
              {p.status !== "removed" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => statusMutation.mutate({ promptId: p.prompt_id, status: "removed" })}
                  disabled={statusMutation.isPending}
                  className="gap-1"
                >
                  <Ban className="h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPrompts;
