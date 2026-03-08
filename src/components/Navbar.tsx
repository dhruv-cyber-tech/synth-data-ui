import { Link, useNavigate } from "react-router-dom";
import { Terminal, Zap, LogOut, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-green">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Prompt<span className="text-primary">Lab</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
          <Link to="/prompts" className="text-sm text-muted-foreground hover:text-primary transition-colors">Explore</Link>
          <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">Categories</Link>
          <Link to="/sell" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Sell
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-sm font-mono">
                    {profile?.username || user.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem className="text-muted-foreground text-xs font-mono cursor-default">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green" onClick={() => navigate("/auth")}>
                <Zap className="h-4 w-4" />
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
