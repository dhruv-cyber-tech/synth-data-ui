import { Link, useNavigate, useLocation } from "react-router-dom";
import { Terminal, Zap, LogOut, User, Plus, Shield, Menu, X, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/prompts", label: "Explore" },
  { to: "/categories", label: "Categories" },
];

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("is_admin", {});
      return data as boolean;
    },
    enabled: !!user,
  });

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const displayName = profile?.username || user?.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_-10px_hsl(160_100%_50%/0.15)]"
          : "border-b border-transparent bg-background/40 backdrop-blur-md"
      }`}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/60 transition-colors">
              <Terminal className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Prompt<span className="text-primary text-glow-green">Lab</span>
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider text-primary border border-primary/30 bg-primary/5">
            <Sparkles className="h-2.5 w-2.5" /> Beta
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 bg-card/40 border border-border/50 rounded-full px-1.5 py-1 backdrop-blur-sm">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-primary/10 border border-primary/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/sell"
            className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${
              isActive("/sell")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive("/sell") && (
              <motion.div
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-primary/10 border border-primary/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Plus className="relative h-3.5 w-3.5" />
            <span className="relative">Sell</span>
          </Link>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 pl-1 pr-3 h-9 rounded-full border border-border/50 hover:border-primary/40 hover:bg-primary/5 text-foreground"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {initial || <User className="h-3.5 w-3.5" />}
                  </div>
                  <span className="hidden sm:inline text-sm font-mono max-w-[100px] truncate">
                    {displayName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/sell")} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Sell a Prompt
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer text-primary">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex text-muted-foreground hover:text-primary hover:bg-primary/5"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="relative bg-primary text-primary-foreground hover:bg-primary/90 glow-green font-semibold group overflow-hidden"
                onClick={() => navigate("/auth")}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="relative h-4 w-4" />
                <span className="relative">Get Started</span>
              </Button>
            </>
          )}

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {[...navItems, { to: "/sell", label: "Sell" }].map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {!user && (
                <Button
                  variant="ghost"
                  className="justify-start mt-2 sm:hidden"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
