-- All feedback writes now go through the server action. The anon key is public,
-- so leaving the old RPC executable would let callers bypass the server-verified
-- rate limit and the action's friendly form response.
--
-- This supersedes 20260901000000_feedback.sql where they differ: guests no
-- longer call submit_feedback() themselves, and it no longer reads auth.uid();
-- the server action passes the sender in.
--
-- Deploy order: set SUPABASE_SERVICE_ROLE_KEY on both sites first, then apply
-- this migration and deploy the app together. The old app calls the old
-- signature, which this drops; until the new app is live, feedback is refused
-- (with a generic sentence, not the database's text).

alter table public.feedback
  add column guest_fingerprint text check (guest_fingerprint ~ '^[0-9a-f]{64}$');

create index feedback_guest_fingerprint_recent_idx
  on public.feedback (guest_fingerprint, created_at desc)
  where guest_fingerprint is not null;

drop function public.submit_feedback(text, text, text);

create function public.submit_feedback(
  feedback_kind text,
  message text,
  contact text,
  submitter_id uuid,
  guest_fingerprint_arg text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  said       text := left(btrim(coalesce(message, '')), 2000);
  reply_to   text := left(btrim(coalesce(contact, '')), 254);
  recent     int;
begin
  if feedback_kind is null or feedback_kind not in ('bug', 'idea', 'confusing', 'praise', 'other') then
    raise exception 'Pilih dulu jenis masukannya.' using errcode = '22023';
  end if;
  if char_length(said) < 10 then
    raise exception 'Ceritakan masukanmu sedikit lebih panjang.' using errcode = '22023';
  end if;
  if (submitter_id is null) = (guest_fingerprint_arg is null) then
    raise exception 'Feedback sender identity is invalid.' using errcode = '22023';
  end if;

  if submitter_id is not null then
    -- Serialize simultaneous submissions for one account so the fifth write
    -- cannot race another request past the cap.
    perform pg_advisory_xact_lock(hashtextextended('feedback:user:' || submitter_id::text, 0));

    select count(*) into recent
    from public.feedback f
    where f.author_id = submitter_id and f.created_at > now() - interval '1 hour';
  else
    if guest_fingerprint_arg !~ '^[0-9a-f]{64}$' then
      raise exception 'Guest feedback identity is invalid.' using errcode = '22023';
    end if;

    -- The fingerprint is an HMAC of Netlify's client IP (its /64 on IPv6),
    -- created only by the server action. The raw address is never stored.
    perform pg_advisory_xact_lock(hashtextextended('feedback:guest:' || guest_fingerprint_arg, 0));

    select count(*) into recent
    from public.feedback f
    where f.guest_fingerprint = guest_fingerprint_arg and f.created_at > now() - interval '1 hour';
  end if;

  if recent >= 5 then
    raise exception 'Feedback rate limit reached.' using errcode = '53400';
  end if;

  insert into public.feedback (author_id, kind, message, contact, guest_fingerprint)
  values (
    submitter_id,
    feedback_kind,
    said,
    reply_to,
    case when submitter_id is null then guest_fingerprint_arg else null end
  );
end;
$$;

revoke all on function public.submit_feedback(text, text, text, uuid, text) from public, anon, authenticated;
grant execute on function public.submit_feedback(text, text, text, uuid, text) to service_role;

comment on column public.feedback.guest_fingerprint is
  'HMAC of the guest''s connection (IPv4 address or IPv6 /64) for the hourly rate limit. Cleared once it no longer counts; the raw IP is never stored.';

-- A fingerprint only matters while it still counts toward the hour. Past that
-- it is nothing but a way back to an address — an IPv4 HMAC can be reversed by
-- whoever holds the key, by trying them all — so it is not kept.
create extension if not exists pg_cron;
select cron.schedule(
  'forget-feedback-guest-fingerprints',
  '*/15 * * * *',
  $$ update public.feedback set guest_fingerprint = null
     where guest_fingerprint is not null and created_at < now() - interval '1 hour' $$
);
