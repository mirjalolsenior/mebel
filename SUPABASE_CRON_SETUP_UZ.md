# Supabase Cron to'liq sozlash (Netlify/Cloudflare/Verceldan mustaqil)

## 1) ENV lar
App (hosting platform):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- CRON_SECRET

Supabase Edge Function secrets:
- CRON_SECRET
- APP_URL  (masalan: https://mebel.pages.dev yoki https://your-site.netlify.app)

## 2) SQL migratsiyalar
Supabase SQL Editor'da ketma-ket:
1. scripts/001_create_tables.sql
2. scripts/002_create_triggers.sql
3. scripts/003_push_notifications_migration.sql
4. scripts/004_add_tovarlar_izoh.sql
5. scripts/006_create_ombor_tables.sql
6. scripts/007_supabase_cron_setup.sql

`007` ichida `YOUR_PROJECT_REF` va `YOUR_CRON_SECRET` ni almashtiring.

## 3) Edge Function deploy
Terminal:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set CRON_SECRET=YOUR_CRON_SECRET
supabase secrets set APP_URL=https://YOUR_APP_DOMAIN
supabase functions deploy push-cron --no-verify-jwt
```

## 4) Test
Manual call:
```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/push-cron" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source":"manual-test"}'
```

## 5) Cron monitoring
SQL:
```sql
select jobid, jobname, schedule, active from cron.job order by jobid desc;
select * from cron.job_run_details order by start_time desc limit 20;
```

## 6) Ishga tushgach
- Avval `push_cron_every_5m` bilan test qiling.
- Hammasi yaxshi bo'lsa, test jobni o'chiring:
```sql
select cron.unschedule(jobid) from cron.job where jobname='push_cron_every_5m';
```
- `push_cron_daily_9_tashkent`ni qoldiring.
