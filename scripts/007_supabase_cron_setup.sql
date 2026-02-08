-- 007_supabase_cron_setup.sql
-- Supabase Cron + pg_net setup for calling /functions/v1/push-cron
-- 1) Replace YOUR_PROJECT_REF and YOUR_CRON_SECRET below before running.
-- 2) If job exists, it will be unscheduled first.
-- 3) Adds both test (every 5 min) and daily 09:00 Asia/Tashkent (04:00 UTC) jobs.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare r record;
begin
  for r in
    select jobid
    from cron.job
    where jobname in ('push_cron_every_5m', 'push_cron_daily_9_tashkent')
  loop
    perform cron.unschedule(r.jobid);
  end loop;
end $$;

-- TEST job: every 5 minutes
select cron.schedule(
  'push_cron_every_5m',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://gnjiffwwfbdievpgaaod.supabase.co/functions/v1/push-cron',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer YOUR_CRON_SECRET'
    ),
    body := jsonb_build_object('source','supabase-cron-test')
  );
  $$
);

-- PRODUCTION job: every day 09:00 Asia/Tashkent = 04:00 UTC
select cron.schedule(
  'push_cron_daily_9_tashkent',
  '0 4 * * *',
  $$
  select net.http_post(
    url := 'https://gnjiffwwfbdievpgaaod.supabase.co/functions/v1/push-cron',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer YOUR_CRON_SECRET'
    ),
    body := jsonb_build_object('source','supabase-cron-daily')
  );
  $$
);

-- View jobs
-- select jobid, jobname, schedule, active from cron.job order by jobid desc;
-- select * from cron.job_run_details order by start_time desc limit 20;
