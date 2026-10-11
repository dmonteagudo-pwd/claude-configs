#!/usr/bin/env node
// Ranks BCQuality knowledge articles against the identifiers in AL files or explicit terms.
// Usage:
//   node bcquality-lookup.mjs [--root <BCQuality dir>] [--top N] --files <a.al> [<b.al> ...]
//   node bcquality-lookup.mjs [--root <BCQuality dir>] [--top N] <term> [<term> ...]
// The root defaults to $BCQUALITY_ROOT. Without an index the script prints nothing and exits 0,
// so a reviewer can call it unconditionally.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
let root = process.env.BCQUALITY_ROOT || '';
let top = 5;
const files = [];
const terms = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--root') root = args[++i];
  else if (a === '--top') top = Number(args[++i]) || top;
  else if (a === '--files') { while (args[i + 1] && !args[i + 1].startsWith('--')) files.push(args[++i]); }
  else terms.push(a);
}

const indexPath = root && join(root, 'knowledge-index.json');
if (!indexPath || !existsSync(indexPath)) process.exit(0);

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// Object types and words every AL file contains: they would match on any diff.
const STOP = new Set(['page', 'list', 'card', 'rec', 'record', 'codeunit', 'table', 'field', 'fields',
  'report', 'query', 'run', 'api', 'document', 'layout', 'procedure', 'var', 'begin', 'end', 'trigger',
  'local', 'internal', 'access', 'caption', 'specifies', 'code', 'text', 'integer', 'decimal', 'boolean']);
const articles = JSON.parse(readFileSync(indexPath, 'utf8')).articles;

// Document frequency of each normalized keyword, for IDF weighting: a keyword that tags
// many articles (e.g. "performance") says little about which one applies.
const df = new Map();
for (const art of articles) {
  art.normKeywords = [...new Set((art.keywords || []).map(norm).filter((k) => k.length > 2 && !STOP.has(k)))];
  for (const k of art.normKeywords) df.set(k, (df.get(k) || 0) + 1);
}

const wanted = new Set(terms.map(norm).filter(Boolean));
for (const f of files) {
  if (!existsSync(f)) continue;
  const text = readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '');
  for (const m of text.matchAll(/[A-Za-z_][A-Za-z0-9_]{2,}/g)) {
    const k = norm(m[0]);
    if (df.has(k)) wanted.add(k);
  }
}
if (wanted.size === 0) process.exit(0);

const n = articles.length;
const ranked = articles
  .map((art) => {
    const hits = art.normKeywords.filter((k) => wanted.has(k));
    const score = hits.reduce((s, k) => s + Math.log(n / df.get(k)), 0);
    return { art, hits, score };
  })
  .filter((r) => r.hits.length >= 2 || (r.hits.length === 1 && terms.length > 0))
  .sort((a, b) => b.score - a.score)
  .slice(0, top);

for (const { art, hits, score } of ranked) {
  const path = join(root, art.path).replace(/\\/g, '/');
  console.log(`${score.toFixed(1)}\t${path}\t${art.title}\t[${hits.join(', ')}]`);
}
