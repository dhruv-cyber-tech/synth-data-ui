import { Lock, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PromptContentProps {
  hasPurchased: boolean;
  content: string | undefined;
  title: string;
}

const PromptContent = ({ hasPurchased, content, title }: PromptContentProps) => {
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success("Prompt copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPurchased) {
    return (
      <div className="rounded-xl border border-border bg-card/30 p-8 text-center">
        <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-mono text-muted-foreground">
          Purchase this prompt to view its full content.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-card/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-primary uppercase tracking-widest">// PROMPT CONTENT</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1" /> Download
          </Button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-background/50 rounded-lg p-4 border border-border">
        {content}
      </pre>
    </div>
  );
};

export default PromptContent;
