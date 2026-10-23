# D0: the site gets its own database

Until this change the site bound CloudFlip's production database (`cloudflip-db`). That gave a public marketing site read
and write access to every CloudFlip table: identity, billing and customer data. The site only ever needed five tables of
its own, and they now live in `mrtechsys-site-db`:

| Table | Written by | Rows copied 2026-10-22 |
|---|---|---|
| `telemetry_events` | `functions/_middleware.ts` (every request) | 65,925 |
| `audit_logs` | `api/cloudflip/consult-submit.ts`, `blueprint-submit.ts` (read by `leads.ts`) | 12 |
| `business_technology_profiles` | `api/assessment-advisor.ts` | 8 |
| `booking_availability` | read by `api/booking-availability.ts` | 6 |
| `bookings` | `api/booking-submit.ts`, `booking-cancel.ts` | 0 |

CloudFlip never queries these tables, and no CloudFlip migration created them. The schema in
`migrations/0001_site_tables.sql` is copied exactly from `cloudflip-db`, so the data moved unchanged.

## Release steps

1. **Done before this PR:** created `mrtechsys-site-db`, applied `0001_site_tables.sql` with
   `wrangler d1 migrations apply`, and copied the data with `node scripts/d0-copy-tables.mjs --mode replace`. The counts
   matched.
2. **Merge.** Cloudflare Pages deploys `main` automatically, and the site switches to its own database on that deploy.
3. **Right after the deploy:** run `node scripts/d0-copy-tables.mjs --mode ignore`. It adds rows written to
   `cloudflip-db` between the copy and the deploy, and never overwrites a row the site has written since. Then run
   `node scripts/d0-copy-tables.mjs --verify`.
4. **Smoke test:** load the home page; book and cancel a test slot; run an assessment. The new rows must appear in
   `mrtechsys-site-db` and not in `cloudflip-db`.
5. **Rollback:** revert this PR. The old binding comes back, and `cloudflip-db` still has every table. Rows written to
   the new database in the meantime would then need copying back.
6. **Later, in a separate CloudFlip PR after a verification window:** archive `audit_logs`, then drop the five tables
   from `cloudflip-db`.

## Not changed here
- `functions/api/cloudflip/*` (a legacy CRM API) addresses about 40 tables that exist in neither database. After this
  change it can't reach CloudFlip data at all. Whether to remove it is a separate decision.
