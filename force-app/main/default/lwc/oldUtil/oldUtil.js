export const API_VERSION = '55.0';
export const PREF_KEY = 'OLD_PREFS';

export function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

export function pctUsed(max, remaining) {
  const m = Number(max) || 0;
  const r = Number(remaining) || 0;
  if (!m) return 0;
  const used = m - r;
  return Math.round((used / m) * 1000) / 10; // 1 decimal
}

export function buildRows(limitsJson) {
  const rows = [];
  const src = limitsJson || {};
  for (const key of Object.keys(src)) {
    const node = src[key] || {};
    const max = Number(node.Max) || 0;
    const remaining = Number(node.Remaining) || 0;
    const used = Math.max(0, max - remaining);
    rows.push({
      key,
      name: prettyKey(key),
      max,
      remaining,
      used,
      pct: pctUsed(max, remaining)
    });
  }
  rows.sort((a, b) => (b.pct - a.pct) || a.name.localeCompare(b.name));
  return rows;
}

export function prettyKey(k) {
  const s = String(k || '');
  return s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim();
}

export function loadPrefs() {
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePrefs(prefs) {
  try {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs || {}));
  } catch {
    // ignore
  }
}

export function toCsv(rows) {
  const header = ['LimitKey','LimitName','Max','Used','Remaining','PercentUsed'];
  const lines = [header.join(',')];
  (rows || []).forEach(r => {
    lines.push([
      csvCell(r.key),
      csvCell(r.name),
      csvCell(r.max),
      csvCell(r.used),
      csvCell(r.remaining),
      csvCell(r.pct)
    ].join(','));
  });
  return lines.join('\n');
}

function csvCell(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
