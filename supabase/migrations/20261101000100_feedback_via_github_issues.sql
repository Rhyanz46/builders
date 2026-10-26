-- The feedback form opens a prefilled GitHub issue instead of writing here
-- (app/lib/feedback.ts), so nothing calls submit_feedback() any more.
--
-- Dropping it is what closes the box: the anon key is public, and a function
-- granted to anon would keep taking rows nobody reads — with none of GitHub's
-- spam handling in front of it. This replaces the hourly cap of
-- 20260901000000_feedback.sql rather than tightening it (issue #126).
--
-- The table stays, read-only, so whatever was already sent can still be read
-- and exported from the dashboard. Drop it in a later migration once that is
-- done.

drop function if exists public.submit_feedback(text, text, text);

comment on table public.feedback is
  'Feedback sent before the form moved to GitHub issues. Nothing writes here any more; kept until exported.';
