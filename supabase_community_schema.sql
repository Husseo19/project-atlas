-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.question_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    content text NOT NULL,
    parent_id uuid REFERENCES public.question_comments(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Optional: Enable RLS (Row Level Security) if you have authentication enabled
ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
ON public.question_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON public.question_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);
