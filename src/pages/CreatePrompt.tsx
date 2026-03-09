import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Rocket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  price: z.coerce.number().min(0, "Price must be 0 or more").max(9999),
  category_id: z.string().min(1, "Select a category"),
  ai_model_target: z.string().optional(),
  content: z.string().trim().min(10, "Prompt content must be at least 10 characters").max(10000),
  suggested_category: z.string().trim().max(100).optional(),
}).refine((data) => {
  if (data.category_id === "other") {
    return data.suggested_category && data.suggested_category.length >= 3;
  }
  return true;
}, {
  message: "Custom category name must be at least 3 characters",
  path: ["suggested_category"],
});

type FormValues = z.infer<typeof schema>;

const AI_MODELS = ["GPT-4", "GPT-3.5", "Claude", "Gemini", "Midjourney", "DALL-E", "Stable Diffusion", "Other"];

const CreatePrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category_id: "",
      ai_model_target: "",
      content: "",
      suggested_category: "",
    },
  });

  const selectedCategoryId = form.watch("category_id");

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setSubmitting(true);
    try {
      const isOther = values.category_id === "other";
      // Use first category as fallback for "other" (admin will reassign)
      const fallbackCategoryId = categories?.[0]?.category_id || 1;

      const { data, error } = await supabase.rpc("create_prompt", {
        p_title: values.title,
        p_description: values.description,
        p_price: values.price,
        p_category_id: isOther ? fallbackCategoryId : parseInt(values.category_id),
        p_ai_model_target: values.ai_model_target || null,
        p_content: values.content,
        p_suggested_category: isOther ? values.suggested_category || null : null,
      });

      if (error) throw error;

      toast({
        title: isOther ? "Prompt submitted for review!" : "Prompt published!",
        description: isOther
          ? "Your prompt with a custom category is pending admin approval."
          : "Your prompt is now live on the marketplace.",
      });
      navigate(isOther ? "/profile" : `/prompt/${data}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-6 text-center py-20">
          <p className="text-muted-foreground font-mono mb-4">You need to sign in to sell prompts.</p>
          <Button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <Link to="/prompts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to marketplace
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">// SELL</p>
            <h1 className="text-3xl font-bold text-foreground mb-8">Create a Prompt</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ultimate Blog Post Generator" className="bg-card border-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe what your prompt does and why it's valuable..." className="bg-card border-border min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-border">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                                {cat.icon_url} {cat.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">🆕 Other (suggest new)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ai_model_target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">AI Model</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-card border-border">
                              <SelectValue placeholder="Target model (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AI_MODELS.map((model) => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {selectedCategoryId === "other" && (
                  <FormField
                    control={form.control}
                    name="suggested_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">Custom Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Music Production, Legal, Data Science..." className="bg-card border-border" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground font-mono">⚠️ Your prompt will be reviewed by an admin before publishing.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">Price (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" className="bg-card border-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-mono text-xs uppercase tracking-wider">Prompt Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your full prompt template here. This is what buyers will receive..."
                          className="bg-card border-border min-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green h-12 text-base font-semibold"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  {submitting ? "Publishing..." : "Publish Prompt"}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatePrompt;
