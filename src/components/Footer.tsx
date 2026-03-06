import { Terminal } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Prompt<span className="text-primary">Lab</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground font-mono">
            © 2026 PromptLab. Crafted with 💚 by <span className="text-primary font-semibold">Dhruv</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
