import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Eye, Ban, CheckCircle, ArrowUpRight, FolderPlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const AdminPrompts = () => {
  const queryClient = useQueryClient();
  const [approveDialog, setApproveDialog] = useState<{ promptId: number; suggestedName: string } | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("📁");

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

  const approveCategoryMutation = useMutation({
    mutationFn: async ({ promptId, name, icon }: { promptId: number; name: string; icon: string }) => {
      const { error } = await (supabase.rpc as any)("admin_approve_custom_category", {
        p_prompt_id: promptId,
        p_category_name: name,
        p_category_icon: icon,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category created & prompt published!");
      queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setApproveDialog(null);
    },
    onError: () => toast.error("Failed to approve category."),
  });

  const openApproveDialog = (promptId: number, suggestedName: string) => {
    setCategoryName(suggestedName);
    setCategoryIcon("📁");
    setApproveDialog({ promptId, suggestedName });
  };

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
    if (s === "pending") return "outline";
    return "secondary";
  };

  const pendingCount = prompts.filter((p: any) => p.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {prompts.length} total prompt{prompts.length !== 1 && "s"}
        </p>
        {pendingCount > 0 && (
          <Badge variant="outline" className="font-mono text-xs border-yellow-500/50 text-yellow-500">
            <Sparkles className="h-3 w-3 mr-1" /> {pendingCount} pending review
          </Badge>
        )}
      </div>

      {prompts.map((p: any) => (
        <div
          key={p.prompt_id}
          className={`rounded-xl border bg-card/50 backdrop-blur-sm p-5 ${
            p.status === "pending" ? "border-yellow-500/30 bg-yellow-500/5" : "border-border"
          }`}
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
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono flex-wrap">
                <span>by {p.creator_username}</span>
                <span>${p.price.toFixed(2)}</span>
                {p.ai_model_target && <span>{p.ai_model_target}</span>}
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              {p.suggested_category && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs border-yellow-500/50 text-yellow-400">
                    <FolderPlus className="h-3 w-3 mr-1" /> Suggested: {p.suggested_category}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              <Badge variant={statusColor(p.status) as any} className="font-mono text-xs">
                {p.status}
              </Badge>
              {p.status === "pending" && p.suggested_category && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openApproveDialog(p.prompt_id, p.suggested_category)}
                  className="gap-1 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                >
                  <FolderPlus className="h-3.5 w-3.5" /> Approve Category
                </Button>
              )}
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

      {/* Approve Custom Category Dialog */}
      <Dialog open={!!approveDialog} onOpenChange={(open) => !open && setApproveDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Approve Custom Category</DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono text-sm">
              The user suggested: <strong className="text-foreground">"{approveDialog?.suggestedName}"</strong>.
              You can edit the name or icon before creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Category Name
              </label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="bg-background border-border"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Icon (emoji)
              </label>
              <Input
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                className="bg-background border-border w-24 text-2xl text-center"
                maxLength={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)} className="border-border">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!categoryName.trim() || !approveDialog) return;
                approveCategoryMutation.mutate({
                  promptId: approveDialog.promptId,
                  name: categoryName.trim(),
                  icon: categoryIcon || "📁",
                });
              }}
              disabled={!categoryName.trim() || approveCategoryMutation.isPending}
              className="bg-primary text-primary-foreground gap-1"
            >
              <FolderPlus className="h-4 w-4" />
              {approveCategoryMutation.isPending ? "Creating..." : "Create & Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPrompts;
