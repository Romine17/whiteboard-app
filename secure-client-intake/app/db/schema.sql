create extension if not exists pgcrypto;

create table if not exists intake_magic_links (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists intake_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token_hash text not null unique,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists intake_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists sensitive_payloads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references intake_submissions(id) on delete cascade,
  field_name text not null,
  iv text not null,
  ciphertext text not null,
  tag text not null,
  alg text not null,
  key_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null,
  actor_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  ip text,
  metadata_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists api_rate_limits (
  key text not null,
  bucket bigint not null,
  count integer not null default 0,
  primary key (key, bucket)
);

create index if not exists idx_api_rate_limits_bucket on api_rate_limits(bucket);
