-- Admin picks: catalogue repos and members' products a site admin puts
-- first in the directory.
--
-- A yes or no, not a ranking: within the picks the directory still orders by
-- how ready each one is for a pull request, and a pick not taking PRs does
-- not rise.
--
-- Its own table rather than a column on projects and oss_repos. A product's
-- owner may update their own row, and row level security cannot keep them
-- off a single column, so a `featured` column there would let anybody pick
-- their own product. Here only admins write.

create table public.admin_picks (
  id         bigint      generated always as identity primary key,
  repo_id    bigint      references public.oss_repos (id) on delete cascade,
  project_id bigint      references public.projects (id) on delete cascade,
  picked_by  uuid        default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint admin_picks_one_target check (num_nonnulls(repo_id, project_id) = 1),
  constraint admin_picks_repo_once unique (repo_id),
  constraint admin_picks_project_once unique (project_id)
);

comment on table public.admin_picks is
  'Catalogue repos and products a site admin puts first in the directory; one row per pick, written only by admins.';

alter table public.admin_picks enable row level security;

-- Public: the directory shows the badge to everybody.
create policy "admin picks are public"
  on public.admin_picks for select
  to anon, authenticated
  using (true);

create policy "admins pick"
  on public.admin_picks for insert
  to authenticated
  with check ((select public.is_site_admin()));

create policy "admins unpick"
  on public.admin_picks for delete
  to authenticated
  using ((select public.is_site_admin()));

grant select on public.admin_picks to anon, authenticated;
grant insert, delete on public.admin_picks to authenticated;
