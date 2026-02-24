-- Run this in Supabase SQL editor

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text default '',
  column_name text not null check (column_name in ('Do Now', 'Do Next', 'Later')),
  votes integer not null default 0,
  owner text default '',
  due_date date null,
  impact integer not null default 3 check (impact between 1 and 5),
  revenue integer not null default 3 check (revenue between 1 and 5),
  urgency integer not null default 3 check (urgency between 1 and 5),
  confidence integer not null default 3 check (confidence between 1 and 5),
  effort integer not null default 3 check (effort between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ideas_updated_at on public.ideas;
create trigger trg_ideas_updated_at
before update on public.ideas
for each row execute procedure public.set_updated_at();

alter table public.ideas enable row level security;

-- Demo mode policy (open board). Tighten later if needed.
drop policy if exists "ideas_select_all" on public.ideas;
create policy "ideas_select_all" on public.ideas for select using (true);

drop policy if exists "ideas_insert_all" on public.ideas;
create policy "ideas_insert_all" on public.ideas for insert with check (true);

drop policy if exists "ideas_update_all" on public.ideas;
create policy "ideas_update_all" on public.ideas for update using (true) with check (true);

drop policy if exists "ideas_delete_all" on public.ideas;
create policy "ideas_delete_all" on public.ideas for delete using (true);

-- Seed rows
insert into public.ideas (title, notes, column_name, impact, revenue, urgency, confidence, effort)
values
('AI phone answering with calendar scheduling', 'Answer calls, qualify lead/client need, and book directly on calendar.', 'Do Now', 5,5,5,4,3),
('Upload bank/credit card statements and auto-post to QuickBooks', 'Auto-categorize transactions and generate entries with review queue.', 'Do Now', 5,5,4,4,4),
('Extract W-2/1099 data and enter into UltraTax', 'Document intake + structured extraction + prefill workflow.', 'Do Now', 5,4,4,3,4),
('Search master Excel list and add custom fields into GoFileRoom', 'Fields: tax preparer, staff preparer, entity type, tax software.', 'Do Now', 4,4,4,4,3),
('Check UltraTax for events and move project along in GoFileRoom', 'Event-triggered workflow automation between UltraTax and GFR.', 'Do Next', 4,4,4,3,3),
('Sort emails automatically', 'Route by urgency/type/owner and create follow-up tasks where needed.', 'Do Next', 4,3,4,4,2),
('Monthly podcast/business article digest to client list', 'Curate content and email by segment each month.', 'Do Next', 3,3,2,4,2),
('Build social media for brand', 'Content pipeline, posting cadence, and lead capture hooks.', 'Later', 3,3,2,3,3)
on conflict do nothing;
