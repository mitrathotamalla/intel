
-- ============================================
-- 1. ENUM for roles
-- ============================================
CREATE TYPE public.app_role AS ENUM ('student', 'admin');

-- ============================================
-- 2. BASE TABLES
-- ============================================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  department TEXT DEFAULT '',
  year TEXT DEFAULT '',
  college TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tests table
CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('aptitude', 'technical', 'verbal')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit INTEGER NOT NULL DEFAULT 30,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Test attempts table
CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Coding problems table
CREATE TABLE public.coding_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT DEFAULT '',
  company_tags JSONB DEFAULT '[]'::jsonb,
  solution JSONB DEFAULT '{}'::jsonb,
  test_cases JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coding submissions table
CREATE TABLE public.coding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.coding_problems(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected', 'error')),
  score INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. HELPER FUNCTIONS (security definer)
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- ============================================
-- 4. AUTO-CREATE PROFILE & STUDENT ROLE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.email, '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. UPDATE TIMESTAMPS TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coding_problems_updated_at
  BEFORE UPDATE ON public.coding_problems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. LEADERBOARD VIEW
-- ============================================

CREATE OR REPLACE VIEW public.leaderboard WITH (security_invoker = on) AS
SELECT
  p.user_id,
  p.name,
  p.department,
  p.avatar_url,
  COALESCE(cs.problems_solved, 0) AS problems_solved,
  COALESCE(ta.test_score, 0) + COALESCE(cs.coding_score, 0) AS total_score,
  COALESCE(cs.problems_solved, 0) + COALESCE(ta.tests_completed, 0) AS activity_count
FROM public.profiles p
LEFT JOIN (
  SELECT user_id,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS tests_completed,
    COALESCE(SUM(score) FILTER (WHERE completed_at IS NOT NULL), 0) AS test_score
  FROM public.test_attempts
  GROUP BY user_id
) ta ON ta.user_id = p.user_id
LEFT JOIN (
  SELECT user_id,
    COUNT(*) FILTER (WHERE status = 'accepted') AS problems_solved,
    COALESCE(SUM(score) FILTER (WHERE status = 'accepted'), 0) AS coding_score
  FROM public.coding_submissions
  GROUP BY user_id
) cs ON cs.user_id = p.user_id
ORDER BY total_score DESC;

-- ============================================
-- 7. ENABLE RLS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "System creates profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- user_roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- tests policies (public read, admin write)
CREATE POLICY "Anyone can view tests"
  ON public.tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create tests"
  ON public.tests FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update tests"
  ON public.tests FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete tests"
  ON public.tests FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- test_attempts policies
CREATE POLICY "Users can view own attempts"
  ON public.test_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create own attempts"
  ON public.test_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts"
  ON public.test_attempts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- coding_problems policies (public read, admin write)
CREATE POLICY "Anyone can view problems"
  ON public.coding_problems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create problems"
  ON public.coding_problems FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update problems"
  ON public.coding_problems FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete problems"
  ON public.coding_problems FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- coding_submissions policies
CREATE POLICY "Users can view own submissions"
  ON public.coding_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create submissions"
  ON public.coding_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own submissions"
  ON public.coding_submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 9. INDEXES
-- ============================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_test_attempts_user_id ON public.test_attempts(user_id);
CREATE INDEX idx_test_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX idx_coding_submissions_user_id ON public.coding_submissions(user_id);
CREATE INDEX idx_coding_submissions_problem_id ON public.coding_submissions(problem_id);
CREATE INDEX idx_coding_problems_difficulty ON public.coding_problems(difficulty);
CREATE INDEX idx_coding_problems_topic ON public.coding_problems(topic);
