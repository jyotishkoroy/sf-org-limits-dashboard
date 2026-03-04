import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getInfo from '@salesforce/apex/OLD_AppController.getInfo';
import { API_VERSION, buildRows, loadPrefs, savePrefs, clamp, toCsv } from 'c/oldUtil';

const DEFAULT_PREFS = { warnPct: 75, highPct: 90 };

const COLUMNS = [
  { label: 'Limit', fieldName: 'name', type: 'text', sortable: true, wrapText: true },
  { label: 'Key', fieldName: 'key', type: 'text', sortable: true, initialWidth: 220 },
  { label: 'Max', fieldName: 'max', type: 'number', sortable: true, initialWidth: 120, cellAttributes: { alignment: 'left' } },
  { label: 'Used', fieldName: 'used', type: 'number', sortable: true, initialWidth: 120, cellAttributes: { alignment: 'left' } },
  { label: 'Remaining', fieldName: 'remaining', type: 'number', sortable: true, initialWidth: 130, cellAttributes: { alignment: 'left' } },
  { label: '% Used', fieldName: 'pct', type: 'number', sortable: true, initialWidth: 120,
    cellAttributes: { class: { fieldName: 'pctClass' } }
  },
  { label: 'Status', fieldName: 'status', type: 'text', sortable: true, initialWidth: 110,
    cellAttributes: { class: { fieldName: 'statusClass' } }
  }
];

export default class OldDashboard extends LightningElement {
  @track info = { version: '0.0.0', sandbox: false, apiVersion: API_VERSION };
  @track rows = [];
  @track displayRows = [];
  @track error = null;

  columns = COLUMNS;

  busy = false;
  busyLabel = 'Loading...';
  lastRefresh = null;

  searchText = '';
  warnPct = DEFAULT_PREFS.warnPct;
  highPct = DEFAULT_PREFS.highPct;

  sortedBy = 'pct';
  sortedDirection = 'desc';

  connectedCallback() {
    this.bootstrap();
  }

  async bootstrap() {
    const prefs = loadPrefs() || DEFAULT_PREFS;
    this.warnPct = clamp(prefs.warnPct ?? DEFAULT_PREFS.warnPct, 1, 99);
    this.highPct = clamp(prefs.highPct ?? DEFAULT_PREFS.highPct, 1, 99);

    await this.withBusy('Loading dashboard...', async () => {
      this.info = await getInfo();
      await this.fetchLimits();
    });
  }

  get envLabel() { return this.info.sandbox ? 'SANDBOX' : 'PRODUCTION'; }
  get envPillClass() { return this.info.sandbox ? 'pill pillOk' : 'pill pillHigh'; }

  get lastRefreshLabel() {
    if (!this.lastRefresh) return '—';
    try { return new Date(this.lastRefresh).toLocaleTimeString(); } catch { return String(this.lastRefresh); }
  }

  get totalCount() { return (this.rows || []).length; }
  get filteredCount() { return (this.displayRows || []).length; }

  get okCount() { return this.countBy('OK'); }
  get warnCount() { return this.countBy('WARN'); }
  get highCount() { return this.countBy('HIGH'); }

  countBy(status) {
    return (this.displayRows || []).filter(r => r.status === status).length;
  }

  get topRow() {
    const arr = this.rows || [];
    if (!arr.length) return null;
    return arr.reduce((m, r) => (r.pct > (m?.pct ?? -1) ? r : m), null);
  }
  get topPct() { return this.topRow ? this.topRow.pct : 0; }
  get topName() { return this.topRow ? this.topRow.name : '—'; }

  get exportDisabled() {
    return this.busy || !(this.displayRows || []).length;
  }

  onSearch(e) { this.searchText = e.target.value; this.applyFilterSort(); }

  onWarn(e) {
    this.warnPct = clamp(e.target.value, 1, 99);
    this.persistPrefs();
    this.applyFilterSort();
  }

  onHigh(e) {
    this.highPct = clamp(e.target.value, 1, 99);
    this.persistPrefs();
    this.applyFilterSort();
  }

  persistPrefs() {
    if (this.highPct <= this.warnPct) this.highPct = clamp(this.warnPct + 5, 1, 99);
    savePrefs({ warnPct: this.warnPct, highPct: this.highPct });
  }

  async refresh() {
    await this.withBusy('Refreshing limits...', async () => {
      await this.fetchLimits();
    });
  }

  async fetchLimits() {
    this.error = null;

    const url = `/services/data/v${API_VERSION}/limits`;
    let data;
    try {
      data = await this.fetchJson(url);
    } catch (e) {
      this.error = this.humanError(e);
      return;
    }

    this.rows = buildRows(data).map(r => this.decorate(r));
    this.lastRefresh = new Date().toISOString();
    this.applyFilterSort();
  }

  decorate(row) {
    const warn = Number(this.warnPct) || 75;
    const high = Number(this.highPct) || 90;

    let status = 'OK';
    if (row.pct >= high) status = 'HIGH';
    else if (row.pct >= warn) status = 'WARN';

    return {
      ...row,
      status,
      statusClass: status === 'HIGH' ? 'status high' : (status === 'WARN' ? 'status warn' : 'status ok'),
      pctClass: row.pct >= high ? 'pct high' : (row.pct >= warn ? 'pct warn' : 'pct ok')
    };
  }

  applyFilterSort() {
    const term = String(this.searchText || '').trim().toLowerCase();
    let out = (this.rows || []).map(r => this.decorate(r));

    if (term) {
      out = out.filter(r =>
        String(r.name || '').toLowerCase().includes(term) ||
        String(r.key || '').toLowerCase().includes(term) ||
        String(r.status || '').toLowerCase().includes(term)
      );
    }

    out = this.sort(out, this.sortedBy, this.sortedDirection);
    this.displayRows = out;
  }

  handleSort(event) {
    const { fieldName: sortedBy, sortDirection } = event.detail;
    this.sortedBy = sortedBy;
    this.sortedDirection = sortDirection;
    this.applyFilterSort();
  }

  sort(arr, by, dir) {
    const m = dir === 'asc' ? 1 : -1;
    const key = by || 'pct';

    return [...(arr || [])].sort((a, b) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * m;
      return String(av ?? '').localeCompare(String(bv ?? '')) * m;
    });
  }

  exportCsv() {
    try {
      const csv = toCsv(this.displayRows || []);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `org-limits-${new Date().toISOString().slice(0,10)}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      this.toast('Exported', 'CSV downloaded.', 'success');
    } catch (e) {
      this.toast('Export failed', this.humanError(e), 'error');
    }
  }

  async fetchJson(url) {
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }});
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${t}`);
    }
    return res.json();
  }

  async withBusy(label, fn) {
    this.busy = true;
    this.busyLabel = label || 'Working...';
    try {
      return await fn();
    } catch (e) {
      this.toast('Error', this.humanError(e), 'error');
      throw e;
    } finally {
      this.busy = false;
      this.busyLabel = 'Loading...';
    }
  }

  toast(title, message, variant) {
    this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
  }

  humanError(e) {
    try {
      if (e?.body?.message) return e.body.message;
      if (Array.isArray(e?.body) && e.body[0]?.message) return e.body[0].message;
      if (e?.message) return e.message;
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
}
