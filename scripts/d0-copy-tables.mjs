#!/usr/bin/env node
/**
 * D0: copy the site's five tables from CloudFlip's production database (cloudflip-db) into the site's own database
 * (mrtechsys-site-db). Reads go to cloudflip-db only; writes go to mrtechsys-site-db only.
 *
 *   node scripts/d0-copy-tables.mjs --mode replace   before the cutover: full copy, overwrites rows with the same id
 *   node scripts/d0-copy-tables.mjs --mode ignore    after the cutover: adds rows written in the gap, never overwrites
 *                                                   a row the site has since written to its own database
 *   node scripts/d0-copy-tables.mjs --verify         compares row counts (source vs destination) and exits non-zero on
 *                                                   a shortfall
 *
 * Read budget: one pass reads each table once, in rowid pages (about 66 k rows in total on 2026-10-22).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SOURCE = 'cloudflip-db';
const DEST = 'mrtechsys-site-db';
const TABLES = ['booking_availability', 'bookings', 'business_technology_profiles', 'audit_logs', 'telemetry_events'];
const PAGE = 2000;
const WRANGLER = ['-y', 'wrangler@4.131.2'];

const args = process.argv.slice(2);
const verifyOnly = args.includes('--verify');
const mode = args[args.indexOf('--mode') + 1];
if (!verifyOnly && !['replace', 'ignore'].includes(mode)) {
  console.error('usage: --mode replace | --mode ignore | --verify');
  process.exit(2);
}

function query(db, sql) {
  const out = execFileSync('npx', [...WRANGLER, 'd1', 'execute', db, '--remote', '--json', '--command', sql],
    { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, env: { ...process.env, NO_COLOR: '1' } });
  return JSON.parse(out)[0].results;
}

function executeFile(db, path) {
  execFileSync('npx', [...WRANGLER, 'd1', 'execute', db, '--remote', '--file', path, '--yes'],
    { stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, NO_COLOR: '1' } });
}

const literal = (v) => (v === null || v === undefined ? 'NULL'
  : typeof v === 'number' ? (Number.isFinite(v) ? String(v) : 'NULL')
  : typeof v === 'boolean' ? (v ? '1' : '0')
  : `'${String(v).replace(/'/g, "''")}'`);

const counts = (db) => Object.fromEntries(TABLES.map((t) => [t, query(db, `SELECT COUNT(*) AS n FROM ${t}`)[0].n]));

if (!verifyOnly) {
  const dir = mkdtempSync(join(tmpdir(), 'd0-'));
  const verb = mode === 'replace' ? 'INSERT OR REPLACE' : 'INSERT OR IGNORE';
  try {
    for (const table of TABLES) {
      let last = 0;
      let copied = 0;
      for (;;) {
        const rows = query(SOURCE, `SELECT rowid AS _rowid, * FROM ${table} WHERE rowid > ${last} ORDER BY rowid LIMIT ${PAGE}`);
        if (!rows.length) break;
        last = rows[rows.length - 1]._rowid;
        const cols = Object.keys(rows[0]).filter((c) => c !== '_rowid');
        const sql = rows.map((r) => `${verb} INTO ${table} (${cols.join(', ')}) VALUES (${cols.map((c) => literal(r[c])).join(', ')});`).join('\n');
        const file = join(dir, `${table}-${last}.sql`);
        writeFileSync(file, sql);
        executeFile(DEST, file);
        copied += rows.length;
        if (rows.length < PAGE) break;
      }
      console.log(`${table}: ${copied} rows (${verb})`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const source = counts(SOURCE);
const dest = counts(DEST);
let short = false;
for (const t of TABLES) {
  const ok = dest[t] >= source[t];
  if (!ok) short = true;
  console.log(`${ok ? 'ok   ' : 'SHORT'} ${t}: source ${source[t]}, destination ${dest[t]}`);
}
process.exit(short ? 1 : 0);
