import { Badge } from "@/components/ui/badge";

interface PromptVersionsProps {
  versions: Array<{
    version_id: number;
    version_number: number;
    change_notes: string | null;
    created_at: string;
  }> | undefined;
}

const PromptVersions = ({ versions }: PromptVersionsProps) => {
  if (!versions || versions.length === 0) return null;

  return (
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
  );
};

export default PromptVersions;
