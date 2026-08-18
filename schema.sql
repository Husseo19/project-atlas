-- Project Atlas Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLE: certifications
-- ==========================================
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    version TEXT NOT NULL,
    exam_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE: study_objectives
-- ==========================================
CREATE TABLE IF NOT EXISTS study_objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    weight NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE: questions
-- ==========================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES study_objectives(id),
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'MultipleChoice', 'MultipleResponse'
    options JSONB NOT NULL, -- Array of objects: [{id: 'A', text: '...'}, ...]
    correct_answers JSONB NOT NULL, -- Array of ids: ['A', 'C']
    explanation TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    tags JSONB DEFAULT '[]'::jsonb,
    source TEXT DEFAULT 'official',
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'unverified',
    verification_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE: exam_blueprints
-- ==========================================
CREATE TABLE IF NOT EXISTS exam_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    passing_score INTEGER NOT NULL,
    time_limit INTEGER NOT NULL, -- minutes
    distribution JSONB NOT NULL, -- {objective_id: percentage}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- TABLE: sessions (Exam & Training combined)
-- ==========================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    type TEXT, -- 'Exam', 'Training'
    mode TEXT, -- 'Adaptive', 'Sequential' (for training)
    status TEXT,
    metadata JSONB,
    blueprint_id UUID REFERENCES exam_blueprints(id), -- (for exam)
    questions JSONB NOT NULL, -- Array of question ids
    answers JSONB DEFAULT '{}'::jsonb, -- Map of question_id -> answer
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    score NUMERIC,
    passed BOOLEAN
);

-- ==========================================
-- TABLE: mastery_profiles
-- ==========================================
CREATE TABLE IF NOT EXISTS mastery_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    objective_mastery JSONB DEFAULT '{}'::jsonb, -- Map of objective_id -> mastery_level (0.0 to 1.0)
    overall_mastery NUMERIC DEFAULT 0.0,
    readiness_score NUMERIC DEFAULT 0.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, certification_id)
);

-- ==========================================
-- TABLE: user_progress
-- ==========================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
    sessions_completed INTEGER DEFAULT 0,
    average_score NUMERIC DEFAULT 0.0,
    streak INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, certification_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for curriculum data
DROP POLICY IF EXISTS "Public read certifications" ON certifications;
CREATE POLICY "Public read certifications"
ON certifications FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public read objectives" ON study_objectives;
CREATE POLICY "Public read objectives"
ON study_objectives FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public read questions" ON questions;
CREATE POLICY "Public read questions"
ON questions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public read blueprints" ON exam_blueprints;
CREATE POLICY "Public read blueprints"
ON exam_blueprints FOR SELECT
USING (true);

-- Authenticated user access for their own data
DROP POLICY IF EXISTS "Users can manage their sessions" ON sessions;
CREATE POLICY "Users can manage their sessions"
ON sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their mastery" ON mastery_profiles;
CREATE POLICY "Users can manage their mastery"
ON mastery_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their progress" ON user_progress;
CREATE POLICY "Users can manage their progress"
ON user_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- SEED DATA (Mock Data for Dashboard)
-- ==========================================
INSERT INTO certifications (name, provider, version, exam_code) VALUES
('Microsoft Azure Fundamentals', 'Microsoft', '2023', 'AZ-900'),
('Microsoft Azure Administrator', 'Microsoft', '2023', 'AZ-104'),
('Designing Microsoft Azure Infrastructure Solutions', 'Microsoft', '2023', 'AZ-305'),
('Microsoft Security, Compliance, and Identity Fundamentals', 'Microsoft', '2023', 'SC-900')
ON CONFLICT (exam_code) DO NOTHING;

-- ==========================================
-- TABLE: profiles
-- ==========================================
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('Free', 'Pro', 'Enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_plan subscription_plan DEFAULT 'Free',
    dark_mode_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their profile" ON profiles;
CREATE POLICY "Users can manage their profile"
ON profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- TABLE: question_comments
-- ==========================================
CREATE TABLE IF NOT EXISTS question_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES question_comments(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE question_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read comments" ON question_comments;
CREATE POLICY "Public read comments"
ON question_comments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can manage their comments" ON question_comments;
CREATE POLICY "Users can manage their comments"
ON question_comments FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- TABLE: question_scores
-- ==========================================
CREATE TABLE question_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(question_id, user_id)
);

ALTER TABLE question_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can score questions" ON question_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read all scores" ON question_scores FOR SELECT USING (true);