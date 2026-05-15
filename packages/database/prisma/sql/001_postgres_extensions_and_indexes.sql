-- Run after `prisma migrate deploy` for PostgreSQL-specific search and realtime performance.
-- These indexes intentionally live outside Prisma because Prisma cannot express every
-- GIN/trigram/full-text construct needed by SwasthAI's patient memory search.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE INDEX IF NOT EXISTS users_email_trgm_idx
  ON users USING gin (email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS users_full_name_trgm_idx
  ON users USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS medications_search_text_fts_idx
  ON medications USING gin (
    to_tsvector('english', unaccent(coalesce(name, '') || ' ' || coalesce(generic_name, '') || ' ' || coalesce(search_text, '')))
  );

CREATE INDEX IF NOT EXISTS patient_timeline_search_fts_idx
  ON patient_timeline_events USING gin (
    to_tsvector('english', unaccent(coalesce(summary, '') || ' ' || coalesce(search_text, '')))
  );

CREATE INDEX IF NOT EXISTS search_documents_content_fts_idx
  ON search_documents USING gin (
    to_tsvector('english', unaccent(coalesce(title, '') || ' ' || coalesce(content, '')))
  );

CREATE INDEX IF NOT EXISTS soap_reports_search_fts_idx
  ON soap_reports USING gin (
    to_tsvector(
      'english',
      unaccent(
        coalesce(subjective, '') || ' ' ||
        coalesce(objective, '') || ' ' ||
        coalesce(assessment, '') || ' ' ||
        coalesce(plan, '') || ' ' ||
        coalesce(search_text, '')
      )
    )
  );

CREATE INDEX IF NOT EXISTS audit_logs_sensitive_access_idx
  ON audit_logs (patient_profile_id, created_at DESC)
  WHERE patient_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS realtime_outbox_pending_idx
  ON realtime_event_outbox (created_at ASC)
  WHERE delivery_status = 'PENDING';

CREATE INDEX IF NOT EXISTS active_refresh_tokens_idx
  ON refresh_tokens (session_id, expires_at DESC)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS active_sessions_idx
  ON sessions (role, expires_at DESC)
  WHERE revoked_at IS NULL AND status = 'ACTIVE';
