-- Allow public read access to prompts, categories, tags, reviews, users, prompt_versions, prompt_tags, analytics
CREATE POLICY "Public read prompts" ON public.prompts FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read prompt_versions" ON public.prompt_versions FOR SELECT USING (true);
CREATE POLICY "Public read prompt_tags" ON public.prompt_tags FOR SELECT USING (true);
CREATE POLICY "Public read analytics" ON public.analytics FOR SELECT USING (true);
