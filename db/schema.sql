-- PhaseRoll product schema for PostgreSQL 16+.
--
-- Better Auth owns public."user", public."session", public."account", and
-- public."verification". This migration intentionally does not create or alter
-- those tables. Run Better Auth migrations before this file.
--
-- Azure PostgreSQL must allow the pgcrypto and vector extensions. Personal
-- media bytes remain on the device/iCloud; GCS-backed objects are represented
-- by metadata rows only.
--
-- Mobile clients should supply UUIDv7 identifiers. gen_random_uuid() defaults
-- are retained as a server-side fallback for jobs and administrative writes.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_purge_after()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.deleted_at IS NULL THEN
    NEW.purge_after := NULL;
  ELSIF TG_OP = 'INSERT'
    OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    OR NEW.purge_after IS NULL
    OR NEW.purge_after < NEW.deleted_at + interval '30 days'
  THEN
    NEW.purge_after := NEW.deleted_at + interval '30 days';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profile (
  user_id text PRIMARY KEY REFERENCES public."user"(id) ON DELETE CASCADE,
  handle text,
  display_name text,
  bio text,
  locale text NOT NULL DEFAULT 'en',
  time_zone text NOT NULL DEFAULT 'UTC',
  country_code text,
  week_starts_on smallint NOT NULL DEFAULT 1,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT profile_handle_format CHECK (
    handle IS NULL OR handle ~ '^[a-z0-9_]{3,30}$'
  ),
  CONSTRAINT profile_country_code_format CHECK (
    country_code IS NULL OR country_code ~ '^[A-Z]{2}$'
  ),
  CONSTRAINT profile_week_starts_on_range CHECK (week_starts_on BETWEEN 0 AND 6)
);

CREATE UNIQUE INDEX IF NOT EXISTS profile_handle_active_uq
  ON public.profile (lower(handle))
  WHERE handle IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.device (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  installation_id text NOT NULL,
  platform text NOT NULL,
  name text,
  app_version text,
  os_version text,
  public_key text,
  push_token_ciphertext bytea,
  sync_cursor bigint NOT NULL DEFAULT 0,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT device_platform_valid CHECK (platform IN ('ios', 'android', 'web')),
  CONSTRAINT device_sync_cursor_nonnegative CHECK (sync_cursor >= 0),
  CONSTRAINT device_user_installation_uq UNIQUE (user_id, installation_id)
);

CREATE INDEX IF NOT EXISTS device_user_active_idx
  ON public.device (user_id, last_seen_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.gcs_object (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  object_kind text NOT NULL,
  bucket text NOT NULL,
  object_key text NOT NULL,
  generation bigint,
  mime_type text,
  byte_size bigint,
  sha256 text,
  encryption_key_version text,
  storage_class text,
  state text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT gcs_object_kind_valid CHECK (
    object_kind IN (
      'roll_call_media',
      'capsule_media',
      'memory_book_pdf',
      'recap_artifact',
      'recovery_manifest',
      'other'
    )
  ),
  CONSTRAINT gcs_object_state_valid CHECK (
    state IN ('pending', 'ready', 'quarantined', 'missing', 'deleted')
  ),
  CONSTRAINT gcs_object_generation_nonnegative CHECK (generation IS NULL OR generation >= 0),
  CONSTRAINT gcs_object_byte_size_nonnegative CHECK (byte_size IS NULL OR byte_size >= 0),
  CONSTRAINT gcs_object_location_uq UNIQUE (bucket, object_key)
);

CREATE INDEX IF NOT EXISTS gcs_object_owner_kind_idx
  ON public.gcs_object (owner_user_id, object_kind, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.phase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  parent_phase_id uuid REFERENCES public.phase(id) ON DELETE SET NULL,
  title text NOT NULL,
  story text,
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'private',
  start_date date,
  end_date date,
  time_zone text NOT NULL DEFAULT 'UTC',
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  recap_enabled boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT phase_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT phase_status_valid CHECK (
    status IN ('draft', 'active', 'completed', 'archived')
  ),
  CONSTRAINT phase_visibility_valid CHECK (visibility IN ('private', 'shared')),
  CONSTRAINT phase_dates_ordered CHECK (
    start_date IS NULL OR end_date IS NULL OR end_date >= start_date
  ),
  CONSTRAINT phase_not_own_parent CHECK (parent_phase_id IS NULL OR parent_phase_id <> id)
);

CREATE INDEX IF NOT EXISTS phase_owner_status_idx
  ON public.phase (owner_user_id, status, start_date DESC NULLS LAST)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS phase_parent_idx
  ON public.phase (parent_phase_id, sort_order)
  WHERE parent_phase_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.phase_member (
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'active',
  invited_by_user_id text REFERENCES public."user"(id) ON DELETE SET NULL,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  PRIMARY KEY (phase_id, user_id),
  CONSTRAINT phase_member_role_valid CHECK (role IN ('owner', 'editor', 'viewer')),
  CONSTRAINT phase_member_status_valid CHECK (status IN ('invited', 'active', 'removed'))
);

CREATE INDEX IF NOT EXISTS phase_member_user_idx
  ON public.phase_member (user_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.phase_invite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  invited_by_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  invited_email text,
  token_hash text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_by_user_id text REFERENCES public."user"(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT phase_invite_role_valid CHECK (role IN ('editor', 'viewer')),
  CONSTRAINT phase_invite_status_valid CHECK (
    status IN ('pending', 'accepted', 'revoked', 'expired')
  ),
  CONSTRAINT phase_invite_token_hash_uq UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS phase_invite_phase_status_idx
  ON public.phase_invite (phase_id, status, expires_at)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.media_asset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  media_kind text NOT NULL,
  source text NOT NULL DEFAULT 'library',
  original_filename text,
  mime_type text,
  byte_size bigint,
  width integer,
  height integer,
  duration_ms bigint,
  captured_at timestamptz,
  captured_time_zone text,
  captured_utc_offset_minutes smallint,
  content_sha256 text,
  perceptual_hash text,
  live_photo_pair_asset_id uuid REFERENCES public.media_asset(id) ON DELETE SET NULL,
  exif jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT media_asset_kind_valid CHECK (
    media_kind IN ('photo', 'video', 'audio', 'live_photo', 'document')
  ),
  CONSTRAINT media_asset_source_valid CHECK (
    source IN ('camera', 'library', 'roll_call', 'journal', 'capsule', 'generated', 'import')
  ),
  CONSTRAINT media_asset_byte_size_nonnegative CHECK (byte_size IS NULL OR byte_size >= 0),
  CONSTRAINT media_asset_width_positive CHECK (width IS NULL OR width > 0),
  CONSTRAINT media_asset_height_positive CHECK (height IS NULL OR height > 0),
  CONSTRAINT media_asset_duration_nonnegative CHECK (duration_ms IS NULL OR duration_ms >= 0),
  CONSTRAINT media_asset_offset_range CHECK (
    captured_utc_offset_minutes IS NULL OR captured_utc_offset_minutes BETWEEN -900 AND 900
  ),
  CONSTRAINT media_asset_not_own_pair CHECK (
    live_photo_pair_asset_id IS NULL OR live_photo_pair_asset_id <> id
  )
);

CREATE INDEX IF NOT EXISTS media_asset_owner_captured_idx
  ON public.media_asset (owner_user_id, captured_at DESC NULLS LAST)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS media_asset_owner_hash_idx
  ON public.media_asset (owner_user_id, content_sha256)
  WHERE content_sha256 IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.asset_copy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.media_asset(id) ON DELETE CASCADE,
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  storage_provider text NOT NULL,
  device_id uuid REFERENCES public.device(id) ON DELETE SET NULL,
  gcs_object_id uuid REFERENCES public.gcs_object(id) ON DELETE SET NULL,
  external_id_hash text,
  locator_ciphertext bytea,
  locator_key_version text,
  availability text NOT NULL DEFAULT 'unknown',
  is_original boolean NOT NULL DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT asset_copy_provider_valid CHECK (
    storage_provider IN ('local', 'icloud', 'gcs')
  ),
  CONSTRAINT asset_copy_availability_valid CHECK (
    availability IN ('unknown', 'available', 'uploading', 'missing', 'deleted')
  ),
  CONSTRAINT asset_copy_provider_location CHECK (
    (storage_provider = 'gcs' AND gcs_object_id IS NOT NULL AND device_id IS NULL)
    OR
    (storage_provider IN ('local', 'icloud') AND device_id IS NOT NULL AND gcs_object_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS asset_copy_gcs_object_uq
  ON public.asset_copy (gcs_object_id)
  WHERE gcs_object_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS asset_copy_external_location_uq
  ON public.asset_copy (asset_id, storage_provider, device_id, external_id_hash)
  WHERE external_id_hash IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS asset_copy_asset_idx
  ON public.asset_copy (asset_id, availability, is_original DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.recovery_manifest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  source_device_id uuid REFERENCES public.device(id) ON DELETE SET NULL,
  gcs_object_id uuid REFERENCES public.gcs_object(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  asset_count integer NOT NULL DEFAULT 0,
  payload_ciphertext bytea,
  encryption_algorithm text NOT NULL DEFAULT 'AES-256-GCM',
  encryption_key_version text NOT NULL,
  checksum_sha256 text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT recovery_manifest_version_positive CHECK (version > 0),
  CONSTRAINT recovery_manifest_asset_count_nonnegative CHECK (asset_count >= 0),
  CONSTRAINT recovery_manifest_payload_present CHECK (
    payload_ciphertext IS NOT NULL OR gcs_object_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS recovery_manifest_owner_latest_idx
  ON public.recovery_manifest (owner_user_id, created_at DESC)
  WHERE deleted_at IS NULL AND superseded_at IS NULL;

ALTER TABLE public.phase
  ADD COLUMN IF NOT EXISTS cover_asset_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'phase_cover_asset_fk'
      AND conrelid = 'public.phase'::regclass
  ) THEN
    ALTER TABLE public.phase
      ADD CONSTRAINT phase_cover_asset_fk
      FOREIGN KEY (cover_asset_id)
      REFERENCES public.media_asset(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.phase_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  author_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  kind text NOT NULL,
  occurred_at timestamptz NOT NULL,
  local_date date NOT NULL,
  time_zone text NOT NULL DEFAULT 'UTC',
  utc_offset_minutes smallint,
  sort_key bigint NOT NULL DEFAULT 0,
  title text,
  summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT phase_entry_kind_valid CHECK (
    kind IN ('media', 'journal', 'milestone', 'capsule', 'recap')
  ),
  CONSTRAINT phase_entry_offset_range CHECK (
    utc_offset_minutes IS NULL OR utc_offset_minutes BETWEEN -900 AND 900
  )
);

CREATE INDEX IF NOT EXISTS phase_entry_timeline_idx
  ON public.phase_entry (phase_id, local_date DESC, occurred_at DESC, sort_key DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS phase_entry_author_idx
  ON public.phase_entry (author_user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.phase_entry_media (
  entry_id uuid NOT NULL REFERENCES public.phase_entry(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.media_asset(id) ON DELETE CASCADE,
  position smallint NOT NULL DEFAULT 0,
  role text NOT NULL DEFAULT 'primary',
  crop jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entry_id, asset_id),
  CONSTRAINT phase_entry_media_position_nonnegative CHECK (position >= 0),
  CONSTRAINT phase_entry_media_role_valid CHECK (
    role IN ('primary', 'supporting', 'cover')
  ),
  CONSTRAINT phase_entry_media_position_uq UNIQUE (entry_id, position)
);

CREATE INDEX IF NOT EXISTS phase_entry_media_asset_idx
  ON public.phase_entry_media (asset_id);

CREATE TABLE IF NOT EXISTS public.behind_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  entry_id uuid REFERENCES public.phase_entry(id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES public.media_asset(id) ON DELETE CASCADE,
  body_text text,
  voice_asset_id uuid REFERENCES public.media_asset(id) ON DELETE SET NULL,
  transcript_text text,
  transcript_status text NOT NULL DEFAULT 'not_requested',
  transcript_language text,
  occurred_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT behind_memory_content_present CHECK (
    NULLIF(btrim(body_text), '') IS NOT NULL OR voice_asset_id IS NOT NULL
  ),
  CONSTRAINT behind_memory_transcript_status_valid CHECK (
    transcript_status IN ('not_requested', 'pending', 'processing', 'ready', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS behind_memory_media_idx
  ON public.behind_memory (media_asset_id, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS behind_memory_phase_idx
  ON public.behind_memory (phase_id, occurred_at DESC NULLS LAST)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.journal_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL UNIQUE REFERENCES public.phase_entry(id) ON DELETE CASCADE,
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  journal_date date NOT NULL,
  title text,
  raw_transcript text,
  polished_text text,
  user_edited_text text,
  status text NOT NULL DEFAULT 'in_progress',
  language text,
  conversation_started_at timestamptz,
  conversation_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT journal_entry_status_valid CHECK (
    status IN ('in_progress', 'generating', 'ready', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS journal_entry_phase_date_idx
  ON public.journal_entry (phase_id, journal_date DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.journal_turn (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES public.journal_entry(id) ON DELETE CASCADE,
  sequence_number integer NOT NULL,
  speaker text NOT NULL,
  prompt_key text,
  text_content text,
  audio_asset_id uuid REFERENCES public.media_asset(id) ON DELETE SET NULL,
  transcript_text text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT journal_turn_sequence_positive CHECK (sequence_number > 0),
  CONSTRAINT journal_turn_speaker_valid CHECK (speaker IN ('assistant', 'user')),
  CONSTRAINT journal_turn_content_present CHECK (
    NULLIF(btrim(text_content), '') IS NOT NULL
    OR audio_asset_id IS NOT NULL
    OR NULLIF(btrim(transcript_text), '') IS NOT NULL
  ),
  CONSTRAINT journal_turn_sequence_uq UNIQUE (journal_entry_id, sequence_number)
);

CREATE TABLE IF NOT EXISTS public.milestone (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL UNIQUE REFERENCES public.phase_entry(id) ON DELETE CASCADE,
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  title text NOT NULL,
  story text,
  milestone_date date NOT NULL,
  icon text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT milestone_title_not_blank CHECK (btrim(title) <> '')
);

CREATE INDEX IF NOT EXISTS milestone_phase_date_idx
  ON public.milestone (phase_id, milestone_date DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.roll_call (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  destination_phase_id uuid REFERENCES public.phase(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  contribution_deadline_at timestamptz,
  time_zone text NOT NULL DEFAULT 'UTC',
  cover_asset_id uuid REFERENCES public.media_asset(id) ON DELETE SET NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT roll_call_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT roll_call_status_valid CHECK (
    status IN ('draft', 'open', 'closed', 'archived')
  ),
  CONSTRAINT roll_call_dates_ordered CHECK (
    starts_at IS NULL OR ends_at IS NULL OR ends_at >= starts_at
  )
);

CREATE INDEX IF NOT EXISTS roll_call_host_status_idx
  ON public.roll_call (host_user_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.roll_call_member (
  roll_call_id uuid NOT NULL REFERENCES public.roll_call(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor',
  status text NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  PRIMARY KEY (roll_call_id, user_id),
  CONSTRAINT roll_call_member_role_valid CHECK (role IN ('host', 'moderator', 'contributor')),
  CONSTRAINT roll_call_member_status_valid CHECK (status IN ('active', 'removed', 'left'))
);

CREATE INDEX IF NOT EXISTS roll_call_member_user_idx
  ON public.roll_call_member (user_id, joined_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.roll_call_invite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_call_id uuid NOT NULL REFERENCES public.roll_call(id) ON DELETE CASCADE,
  created_by_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  max_uses integer,
  use_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT roll_call_invite_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT roll_call_invite_use_count_nonnegative CHECK (use_count >= 0),
  CONSTRAINT roll_call_invite_use_count_bounded CHECK (
    max_uses IS NULL OR use_count <= max_uses
  ),
  CONSTRAINT roll_call_invite_token_hash_uq UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS roll_call_invite_active_idx
  ON public.roll_call_invite (roll_call_id, expires_at)
  WHERE revoked_at IS NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.roll_call_contribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_call_id uuid NOT NULL REFERENCES public.roll_call(id) ON DELETE CASCADE,
  contributor_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  caption text,
  occurred_at timestamptz,
  status text NOT NULL DEFAULT 'submitted',
  moderation_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT roll_call_contribution_status_valid CHECK (
    status IN ('draft', 'submitted', 'approved', 'rejected')
  )
);

CREATE INDEX IF NOT EXISTS roll_call_contribution_feed_idx
  ON public.roll_call_contribution (roll_call_id, status, occurred_at DESC NULLS LAST, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.roll_call_contribution_asset (
  contribution_id uuid NOT NULL REFERENCES public.roll_call_contribution(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.media_asset(id) ON DELETE CASCADE,
  position smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contribution_id, asset_id),
  CONSTRAINT roll_call_contribution_asset_position_nonnegative CHECK (position >= 0),
  CONSTRAINT roll_call_contribution_asset_position_uq UNIQUE (contribution_id, position)
);

CREATE TABLE IF NOT EXISTS public.future_capsule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.phase(id) ON DELETE SET NULL,
  entry_id uuid UNIQUE REFERENCES public.phase_entry(id) ON DELETE SET NULL,
  title text NOT NULL,
  message_text text,
  status text NOT NULL DEFAULT 'draft',
  delivery_at timestamptz NOT NULL,
  delivery_time_zone text NOT NULL DEFAULT 'UTC',
  sealed_at timestamptz,
  delivered_at timestamptz,
  failure_reason text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT future_capsule_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT future_capsule_status_valid CHECK (
    status IN ('draft', 'scheduled', 'sealed', 'delivering', 'delivered', 'failed', 'cancelled')
  )
);

CREATE INDEX IF NOT EXISTS future_capsule_delivery_idx
  ON public.future_capsule (delivery_at, status)
  WHERE status IN ('scheduled', 'sealed', 'failed') AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS future_capsule_owner_idx
  ON public.future_capsule (owner_user_id, delivery_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.capsule_recipient (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid NOT NULL REFERENCES public.future_capsule(id) ON DELETE CASCADE,
  recipient_user_id text REFERENCES public."user"(id) ON DELETE SET NULL,
  email text,
  display_name text,
  relationship text,
  delivery_status text NOT NULL DEFAULT 'pending',
  delivery_attempts integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT capsule_recipient_destination_present CHECK (
    recipient_user_id IS NOT NULL OR NULLIF(btrim(email), '') IS NOT NULL
  ),
  CONSTRAINT capsule_recipient_delivery_status_valid CHECK (
    delivery_status IN ('pending', 'queued', 'sent', 'failed', 'cancelled')
  ),
  CONSTRAINT capsule_recipient_attempts_nonnegative CHECK (delivery_attempts >= 0)
);

CREATE INDEX IF NOT EXISTS capsule_recipient_capsule_idx
  ON public.capsule_recipient (capsule_id, delivery_status)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.capsule_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id uuid NOT NULL REFERENCES public.future_capsule(id) ON DELETE CASCADE,
  item_kind text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  media_asset_id uuid REFERENCES public.media_asset(id) ON DELETE SET NULL,
  gcs_object_id uuid REFERENCES public.gcs_object(id) ON DELETE SET NULL,
  source_entry_id uuid REFERENCES public.phase_entry(id) ON DELETE SET NULL,
  text_content text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT capsule_item_kind_valid CHECK (
    item_kind IN ('media', 'message', 'journal', 'milestone', 'memory')
  ),
  CONSTRAINT capsule_item_position_nonnegative CHECK (position >= 0),
  CONSTRAINT capsule_item_content_present CHECK (
    media_asset_id IS NOT NULL
    OR gcs_object_id IS NOT NULL
    OR source_entry_id IS NOT NULL
    OR NULLIF(btrim(text_content), '') IS NOT NULL
    OR snapshot <> '{}'::jsonb
  ),
  CONSTRAINT capsule_item_position_uq UNIQUE (capsule_id, position)
);

CREATE TABLE IF NOT EXISTS public.embedding_model (
  id text PRIMARY KEY,
  provider text NOT NULL DEFAULT 'azure_openai',
  deployment_name text NOT NULL,
  model_name text NOT NULL,
  dimensions integer NOT NULL,
  distance_metric text NOT NULL DEFAULT 'cosine',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT embedding_model_dimensions_positive CHECK (dimensions > 0),
  CONSTRAINT embedding_model_distance_metric_valid CHECK (
    distance_metric IN ('cosine', 'inner_product', 'l2')
  )
);

CREATE TABLE IF NOT EXISTS public.search_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.phase(id) ON DELETE CASCADE,
  source_kind text NOT NULL,
  source_id uuid NOT NULL,
  title text,
  body text NOT NULL,
  language text NOT NULL DEFAULT 'und',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || body)
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT search_document_source_kind_valid CHECK (
    source_kind IN (
      'phase',
      'behind_memory',
      'journal',
      'milestone',
      'roll_call_contribution',
      'capsule',
      'recap'
    )
  ),
  CONSTRAINT search_document_body_not_blank CHECK (btrim(body) <> ''),
  CONSTRAINT search_document_source_uq UNIQUE (owner_user_id, source_kind, source_id)
);

CREATE INDEX IF NOT EXISTS search_document_fts_idx
  ON public.search_document USING gin (search_vector)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS search_document_owner_phase_idx
  ON public.search_document (owner_user_id, phase_id, source_kind, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.search_embedding (
  document_id uuid NOT NULL REFERENCES public.search_document(id) ON DELETE CASCADE,
  model_id text NOT NULL REFERENCES public.embedding_model(id) ON DELETE RESTRICT,
  dimensions integer NOT NULL,
  embedding vector NOT NULL,
  content_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (document_id, model_id),
  CONSTRAINT search_embedding_dimensions_positive CHECK (dimensions > 0),
  CONSTRAINT search_embedding_dimensions_match CHECK (vector_dims(embedding) = dimensions)
);

COMMENT ON COLUMN public.search_embedding.embedding IS
  'Unbounded until an embedding deployment is selected. After model selection, add a model-specific HNSW partial index using embedding::vector(N).';

-- Example after choosing a 1536-dimensional cosine model:
-- CREATE INDEX search_embedding_model_hnsw_idx
--   ON public.search_embedding
--   USING hnsw ((embedding::vector(1536)) vector_cosine_ops)
--   WHERE model_id = 'your-model-id';

CREATE TABLE IF NOT EXISTS public.generation_job (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.phase(id) ON DELETE CASCADE,
  job_kind text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  provider text,
  model_name text,
  prompt_version text,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb,
  error_code text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  queued_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT generation_job_kind_valid CHECK (
    job_kind IN ('transcription', 'embedding', 'journal', 'recap', 'memory_book', 'capsule_delivery')
  ),
  CONSTRAINT generation_job_status_valid CHECK (
    status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')
  ),
  CONSTRAINT generation_job_attempts_nonnegative CHECK (attempts >= 0)
);

CREATE INDEX IF NOT EXISTS generation_job_queue_idx
  ON public.generation_job (status, queued_at)
  WHERE status IN ('queued', 'failed');

CREATE INDEX IF NOT EXISTS generation_job_owner_idx
  ON public.generation_job (owner_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.phase_recap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  entry_id uuid UNIQUE REFERENCES public.phase_entry(id) ON DELETE SET NULL,
  generation_job_id uuid REFERENCES public.generation_job(id) ON DELETE SET NULL,
  period_start date,
  period_end date,
  title text NOT NULL,
  body text NOT NULL,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT phase_recap_dates_ordered CHECK (
    period_start IS NULL OR period_end IS NULL OR period_end >= period_start
  ),
  CONSTRAINT phase_recap_version_positive CHECK (version > 0),
  CONSTRAINT phase_recap_status_valid CHECK (
    status IN ('draft', 'generating', 'ready', 'published', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS phase_recap_phase_period_idx
  ON public.phase_recap (phase_id, period_end DESC NULLS LAST, version DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.memory_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  generation_job_id uuid REFERENCES public.generation_job(id) ON DELETE SET NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  format text NOT NULL DEFAULT 'pdf',
  layout_version text,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_gcs_object_id uuid REFERENCES public.gcs_object(id) ON DELETE SET NULL,
  final_gcs_object_id uuid REFERENCES public.gcs_object(id) ON DELETE SET NULL,
  permanent_copy_purchased_at timestamptz,
  generated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT memory_book_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT memory_book_status_valid CHECK (
    status IN ('draft', 'queued', 'generating', 'preview_ready', 'ready', 'failed', 'expired')
  ),
  CONSTRAINT memory_book_format_valid CHECK (format IN ('pdf'))
);

CREATE INDEX IF NOT EXISTS memory_book_owner_idx
  ON public.memory_book (owner_user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.memory_book_phase (
  memory_book_id uuid NOT NULL REFERENCES public.memory_book(id) ON DELETE CASCADE,
  phase_id uuid NOT NULL REFERENCES public.phase(id) ON DELETE CASCADE,
  position smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (memory_book_id, phase_id),
  CONSTRAINT memory_book_phase_position_nonnegative CHECK (position >= 0),
  CONSTRAINT memory_book_phase_position_uq UNIQUE (memory_book_id, position)
);

CREATE TABLE IF NOT EXISTS public.plan (
  id text PRIMARY KEY,
  name text NOT NULL,
  billing_interval text NOT NULL,
  market text NOT NULL DEFAULT 'global',
  currency char(3),
  unit_amount_minor integer,
  provider_price_id text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_billing_interval_valid CHECK (
    billing_interval IN ('free', 'month', 'year', 'lifetime', 'one_time')
  ),
  CONSTRAINT plan_market_valid CHECK (market IN ('global', 'india')),
  CONSTRAINT plan_amount_nonnegative CHECK (
    unit_amount_minor IS NULL OR unit_amount_minor >= 0
  ),
  CONSTRAINT plan_currency_amount_pair CHECK (
    (currency IS NULL AND unit_amount_minor IS NULL)
    OR (currency IS NOT NULL AND unit_amount_minor IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS plan_provider_price_uq
  ON public.plan (provider_price_id)
  WHERE provider_price_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.plan_feature (
  plan_id text NOT NULL REFERENCES public.plan(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  limit_value bigint,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_id, feature_key),
  CONSTRAINT plan_feature_limit_nonnegative CHECK (limit_value IS NULL OR limit_value >= 0)
);

CREATE TABLE IF NOT EXISTS public.subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.plan(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_customer_id text,
  provider_subscription_id text,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancelled_at timestamptz,
  trial_ends_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT subscription_provider_valid CHECK (
    provider IN ('stripe', 'app_store', 'play_store', 'manual')
  ),
  CONSTRAINT subscription_status_valid CHECK (
    status IN ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired')
  ),
  CONSTRAINT subscription_period_ordered CHECK (
    current_period_start IS NULL
    OR current_period_end IS NULL
    OR current_period_end >= current_period_start
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS subscription_provider_id_uq
  ON public.subscription (provider, provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS subscription_user_status_idx
  ON public.subscription (user_id, status, current_period_end DESC NULLS LAST)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.purchase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  product_kind text NOT NULL,
  product_id uuid,
  plan_id text REFERENCES public.plan(id) ON DELETE RESTRICT,
  provider text NOT NULL,
  provider_transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  currency char(3) NOT NULL,
  amount_minor integer NOT NULL,
  market text NOT NULL DEFAULT 'global',
  purchased_at timestamptz,
  refunded_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT purchase_product_kind_valid CHECK (
    product_kind IN ('founder_pass', 'roll_call', 'memory_book', 'subscription', 'other')
  ),
  CONSTRAINT purchase_provider_valid CHECK (
    provider IN ('stripe', 'app_store', 'play_store', 'manual')
  ),
  CONSTRAINT purchase_status_valid CHECK (
    status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')
  ),
  CONSTRAINT purchase_amount_nonnegative CHECK (amount_minor >= 0),
  CONSTRAINT purchase_market_valid CHECK (market IN ('global', 'india'))
);

CREATE UNIQUE INDEX IF NOT EXISTS purchase_provider_transaction_uq
  ON public.purchase (provider, provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS purchase_user_idx
  ON public.purchase (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.entitlement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  source_kind text NOT NULL,
  source_id text,
  status text NOT NULL DEFAULT 'active',
  limit_value bigint,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  deleted_at timestamptz,
  purge_after timestamptz,
  CONSTRAINT entitlement_source_kind_valid CHECK (
    source_kind IN ('plan', 'subscription', 'purchase', 'promotion', 'admin')
  ),
  CONSTRAINT entitlement_status_valid CHECK (
    status IN ('active', 'expired', 'revoked')
  ),
  CONSTRAINT entitlement_limit_nonnegative CHECK (limit_value IS NULL OR limit_value >= 0),
  CONSTRAINT entitlement_dates_ordered CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS entitlement_user_feature_idx
  ON public.entitlement (user_id, feature_key, status, ends_at DESC NULLS FIRST)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.usage_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  quantity bigint NOT NULL DEFAULT 1,
  resource_kind text,
  resource_id uuid,
  idempotency_key text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usage_event_quantity_positive CHECK (quantity > 0),
  CONSTRAINT usage_event_idempotency_uq UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS usage_event_meter_idx
  ON public.usage_event (user_id, feature_key, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.client_mutation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.device(id) ON DELETE SET NULL,
  idempotency_key text NOT NULL,
  operation text NOT NULL,
  request_hash text,
  status text NOT NULL DEFAULT 'processing',
  result_resource_kind text,
  result_resource_id uuid,
  response jsonb,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT client_mutation_status_valid CHECK (
    status IN ('processing', 'succeeded', 'failed')
  ),
  CONSTRAINT client_mutation_idempotency_uq UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS client_mutation_device_idx
  ON public.client_mutation (device_id, created_at DESC)
  WHERE device_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.sync_change (
  sequence_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  entity_kind text NOT NULL,
  entity_id uuid NOT NULL,
  operation text NOT NULL,
  mutation_id uuid REFERENCES public.client_mutation(id) ON DELETE SET NULL,
  changed_fields jsonb,
  changed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sync_change_operation_valid CHECK (operation IN ('upsert', 'delete'))
);

CREATE INDEX IF NOT EXISTS sync_change_user_cursor_idx
  ON public.sync_change (owner_user_id, sequence_id);

CREATE TABLE IF NOT EXISTS public.outbox_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text REFERENCES public."user"(id) ON DELETE CASCADE,
  aggregate_kind text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_kind text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT outbox_event_status_valid CHECK (
    status IN ('pending', 'processing', 'processed', 'failed', 'dead_letter')
  ),
  CONSTRAINT outbox_event_attempts_nonnegative CHECK (attempts >= 0)
);

CREATE INDEX IF NOT EXISTS outbox_event_dispatch_idx
  ON public.outbox_event (available_at, created_at)
  WHERE status IN ('pending', 'failed');

CREATE TABLE IF NOT EXISTS public.deletion_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'account',
  resource_kind text,
  resource_id uuid,
  status text NOT NULL DEFAULT 'scheduled',
  requested_at timestamptz NOT NULL DEFAULT now(),
  scheduled_purge_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  cancelled_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT deletion_request_scope_valid CHECK (scope IN ('account', 'resource')),
  CONSTRAINT deletion_request_resource_valid CHECK (
    (scope = 'account' AND resource_kind IS NULL AND resource_id IS NULL)
    OR
    (scope = 'resource' AND resource_kind IS NOT NULL AND resource_id IS NOT NULL)
  ),
  CONSTRAINT deletion_request_status_valid CHECK (
    status IN ('scheduled', 'cancelled', 'processing', 'completed', 'failed')
  ),
  CONSTRAINT deletion_request_purge_delay CHECK (
    scheduled_purge_at >= requested_at + interval '30 days'
  )
);

CREATE INDEX IF NOT EXISTS deletion_request_due_idx
  ON public.deletion_request (scheduled_purge_at)
  WHERE status IN ('scheduled', 'failed');

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profile',
    'device',
    'gcs_object',
    'phase',
    'phase_member',
    'phase_invite',
    'media_asset',
    'asset_copy',
    'recovery_manifest',
    'phase_entry',
    'behind_memory',
    'journal_entry',
    'milestone',
    'roll_call',
    'roll_call_member',
    'roll_call_invite',
    'roll_call_contribution',
    'future_capsule',
    'capsule_recipient',
    'capsule_item',
    'search_document',
    'phase_recap',
    'memory_book',
    'subscription',
    'entitlement'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'set_purge_after', table_name);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE INSERT OR UPDATE OF deleted_at, purge_after ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_purge_after()',
      'set_purge_after',
      table_name
    );
  END LOOP;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profile',
    'device',
    'gcs_object',
    'phase',
    'phase_member',
    'phase_invite',
    'media_asset',
    'asset_copy',
    'recovery_manifest',
    'phase_entry',
    'behind_memory',
    'journal_entry',
    'milestone',
    'roll_call',
    'roll_call_member',
    'roll_call_invite',
    'roll_call_contribution',
    'future_capsule',
    'capsule_recipient',
    'capsule_item',
    'embedding_model',
    'search_document',
    'search_embedding',
    'generation_job',
    'phase_recap',
    'memory_book',
    'plan',
    'plan_feature',
    'subscription',
    'purchase',
    'entitlement',
    'deletion_request'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 'set_updated_at', table_name);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      'set_updated_at',
      table_name
    );
  END LOOP;
END;
$$;

COMMENT ON TABLE public.phase IS
  'A meaningful period of a user''s life. Parent links support sub-phases.';
COMMENT ON TABLE public.phase_entry IS
  'The unified, day-by-day Phase timeline. Feature tables own kind-specific content.';
COMMENT ON TABLE public.asset_copy IS
  'A physical copy locator for canonical media metadata. Locators for local/iCloud copies are encrypted.';
COMMENT ON TABLE public.behind_memory IS
  'Text or voice context explaining why a particular photo or video mattered.';
COMMENT ON TABLE public.journal_turn IS
  'Immutable source conversation turns retained separately from generated journal prose.';
COMMENT ON TABLE public.sync_change IS
  'Server-assigned cursor stream for future multi-device synchronization.';

COMMIT;