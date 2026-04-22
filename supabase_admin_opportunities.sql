CREATE TABLE IF NOT EXISTS admin_opportunity_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  idea_name text NOT NULL,
  industry text NOT NULL,
  one_sentence_concept text NOT NULL,
  problem_solved text NOT NULL,
  target_user text NOT NULL,
  product_type text NOT NULL,
  buyer text,
  business_model_guess text,
  geography text,
  why_now text,
  workflow_state text NOT NULL,
  recommendation text NOT NULL,
  confidence text NOT NULL,
  best_wedge text NOT NULL,
  strongest_reason_to_build text NOT NULL,
  strongest_reason_not_to_build text NOT NULL,
  biggest_risk text NOT NULL,
  next_validation_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  memo_summary text NOT NULL,
  memo_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  research_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  scorecard_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  disposition text NOT NULL DEFAULT 'active',
  promoted_app_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_opportunity_ideas_updated_at
  ON admin_opportunity_ideas(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_opportunity_ideas_disposition
  ON admin_opportunity_ideas(disposition);
CREATE INDEX IF NOT EXISTS idx_admin_opportunity_ideas_workflow_state
  ON admin_opportunity_ideas(workflow_state);

CREATE TABLE IF NOT EXISTS admin_future_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  bucket text NOT NULL,
  stage text NOT NULL,
  status text NOT NULL,
  owner text NOT NULL DEFAULT 'Bub',
  summary text NOT NULL,
  problem_statement text NOT NULL,
  target_users jsonb NOT NULL DEFAULT '[]'::jsonb,
  prior_research_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_blocker text NOT NULL,
  next_milestone text NOT NULL,
  next_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  progress_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  evaluation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_future_apps_updated_at
  ON admin_future_apps(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_future_apps_stage
  ON admin_future_apps(stage);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_admin_opportunity_ideas_updated_at ON admin_opportunity_ideas;
CREATE TRIGGER set_admin_opportunity_ideas_updated_at
  BEFORE UPDATE ON admin_opportunity_ideas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_admin_future_apps_updated_at ON admin_future_apps;
CREATE TRIGGER set_admin_future_apps_updated_at
  BEFORE UPDATE ON admin_future_apps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
