import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: { id: string; username: string; avatar_url: string | null; bio: string | null } | null;
  userId: string;
}

const ProfileHeader = ({ profile, userId }: ProfileHeaderProps) => {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (username.trim().length < 3 || username.length > 30) {
        throw new Error("Username must be 3–30 characters.");
      }
      if (bio && bio.length > 500) {
        throw new Error("Bio must be 500 characters or fewer.");
      }
      const { error } = await supabase
        .from("profiles")
        .update({ username, bio, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditing(false);
      // Refresh auth context profile
      window.location.reload();
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update profile."),
  });

  const handleCancel = () => {
    setUsername(profile?.username || "");
    setBio(profile?.bio || "");
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <div className="flex items-start gap-5">
        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-8 w-8 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">
                  Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={30}
                  className="bg-background border-border max-w-xs"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block">
                  Bio
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  placeholder="Tell us about yourself..."
                  className="bg-background border-border max-w-md min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel} className="text-muted-foreground gap-1">
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {profile?.username || "Anonymous"}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(true)}
                  className="text-muted-foreground hover:text-primary gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {profile?.bio || "No bio yet."}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
