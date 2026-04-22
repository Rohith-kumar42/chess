-- ═══════════════════════════════════════
-- Chess Academy Database Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════

-- TABLE 1: profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role        TEXT NOT NULL CHECK (role IN ('admin', 'student', 'parent')),
  full_name   TEXT,
  email       TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: students
CREATE TABLE IF NOT EXISTS students (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES profiles(id),
  full_name        TEXT NOT NULL,
  date_of_birth    DATE,
  skill_level      TEXT CHECK (skill_level IN
                     ('beginner','intermediate','advanced','competitive')),
  chess_rating     INT,
  parent_id        UUID REFERENCES profiles(id),
  parent_name      TEXT,
  parent_phone     TEXT,
  parent_email     TEXT,
  school           TEXT,
  notes            TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  enrolled_date    DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: fees
CREATE TABLE IF NOT EXISTS fees (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month            DATE NOT NULL,
  amount_due       NUMERIC(10,2) NOT NULL,
  amount_paid      NUMERIC(10,2) DEFAULT 0,
  balance          NUMERIC(10,2) GENERATED ALWAYS AS
                     (amount_due - amount_paid) STORED,
  status           TEXT GENERATED ALWAYS AS (
                     CASE
                       WHEN amount_paid >= amount_due    THEN 'paid'
                       WHEN amount_paid > 0              THEN 'partially_paid'
                       ELSE 'unpaid'
                     END
                   ) STORED,
  due_date         DATE,
  paid_date        DATE,
  payment_method   TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, month)
);

-- TABLE 4: sessions (scheduled classes)
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  session_date     DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME,
  zoom_link        TEXT,
  zoom_password    TEXT,
  description      TEXT,
  is_recurring     BOOLEAN DEFAULT FALSE,
  recurrence_rule  TEXT,
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: session students
CREATE TABLE IF NOT EXISTS session_students (
  session_id   UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, student_id)
);

-- TABLE 5: progress_entries
CREATE TABLE IF NOT EXISTS progress_entries (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  entry_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  skill_level      TEXT,
  rating_before    INT,
  rating_after     INT,
  game_result      TEXT CHECK (game_result IN ('win','loss','draw','n/a')),
  openings_studied TEXT[],
  tactics_topics   TEXT[],
  coach_remarks    TEXT NOT NULL,
  areas_to_improve TEXT,
  homework         TEXT,
  coach_id         UUID REFERENCES profiles(id),
  session_id       UUID REFERENCES sessions(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 6: recordings
CREATE TABLE IF NOT EXISTS recordings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id       UUID REFERENCES sessions(id),
  title            TEXT NOT NULL,
  recording_url    TEXT NOT NULL,
  recording_date   DATE,
  duration_minutes INT,
  description      TEXT,
  is_public        BOOLEAN DEFAULT FALSE,
  uploaded_by      UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: recording access
CREATE TABLE IF NOT EXISTS recording_access (
  recording_id UUID REFERENCES recordings(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (recording_id, student_id)
);

-- TABLE 7: tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  organizer        TEXT,
  location         TEXT,
  tournament_date  DATE NOT NULL,
  end_date         DATE,
  format           TEXT,
  registration_url TEXT,
  description      TEXT,
  status           TEXT DEFAULT 'upcoming'
                       CHECK (status IN ('upcoming','ongoing','completed')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: tournament participants + results
CREATE TABLE IF NOT EXISTS tournament_participants (
  tournament_id    UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  student_id       UUID REFERENCES students(id) ON DELETE CASCADE,
  rank             INT,
  score            NUMERIC(5,1),
  performance_rating INT,
  medal            TEXT CHECK (medal IN ('gold','silver','bronze','none')),
  notes            TEXT,
  PRIMARY KEY (tournament_id, student_id)
);

-- ═══════════════════════════════════════
-- ROW-LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "own_profile" ON profiles FOR SELECT USING (id = auth.uid());

-- Students RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_students" ON students FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "student_own" ON students FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "parent_child" ON students FOR SELECT USING (parent_id = auth.uid());

-- Fees RLS
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_fees" ON fees FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "own_fees_read" ON fees FOR SELECT USING (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid() OR parent_id = auth.uid()
  )
);

-- Sessions RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_sessions" ON sessions FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "student_sessions" ON sessions FOR SELECT USING (
  id IN (
    SELECT session_id FROM session_students
    WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  )
);

-- Session Students RLS
ALTER TABLE session_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_session_students" ON session_students FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "own_session_students" ON session_students FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

-- Progress Entries RLS
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_progress" ON progress_entries FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "student_parent_progress" ON progress_entries FOR SELECT USING (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid() OR parent_id = auth.uid()
  )
);

-- Recordings RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_recordings" ON recordings FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "public_recordings" ON recordings FOR SELECT USING (is_public = true);
CREATE POLICY "student_recordings" ON recordings FOR SELECT USING (
  id IN (
    SELECT recording_id FROM recording_access
    WHERE student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  )
);

-- Recording Access RLS
ALTER TABLE recording_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_recording_access" ON recording_access FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Tournaments RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_tournaments" ON tournaments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "everyone_read_tournaments" ON tournaments FOR SELECT USING (true);

-- Tournament Participants RLS
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_participants" ON tournament_participants FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "everyone_read_participants" ON tournament_participants FOR SELECT USING (true);

-- ═══════════════════════════════════════
-- TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ═══════════════════════════════════════
-- VIEWS
-- ═══════════════════════════════════════

CREATE OR REPLACE VIEW fee_summary AS
  SELECT
    s.full_name,
    s.id AS student_id,
    SUM(f.balance) AS total_outstanding,
    COUNT(CASE WHEN f.status = 'unpaid' THEN 1 END) AS unpaid_months
  FROM students s
  LEFT JOIN fees f ON f.student_id = s.id
  GROUP BY s.id, s.full_name;
