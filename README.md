# sf-org-limits-dashboard

**Org Limits Dashboard** — visualize org limits with thresholds, search/sort, refresh, and CSV export.

**Repository name:** `sf-org-limits-dashboard`  
**Description:** Admin utility for Salesforce org limits (thresholds, search/sort, refresh, CSV export).  
**License:** MIT (c) 2026 Jyotishko Roy — https://orcid.org/0009-0000-2837-4731

---

## Features
- Threshold signals (warn/high) and per-row percent used
- Search (filter by limit name)
- Sort by any column
- Refresh (pulls live `/limits`)
- CSV export (filtered/sorted rows)
- Lightweight preferences (warn/high thresholds stored locally)

---

## Install

### Deploy
```bash
sf org login web --set-default --alias old
sf project deploy start --source-dir force-app --target-org old
```

### Post-deploy
1. Assign permission set **Org Limits Dashboard**
2. App Launcher → **Org Limits Dashboard**
3. Open tab **Org Limits**

---

## Notes
- This app does **not** create any custom objects.
- Requires API access (`ApiEnabled` permission). The included permission set grants it.
- Uses API version `55.0` for the REST call; this version is broadly compatible.

---

## Maintainer
**Jyotishko Roy** — ORCID: https://orcid.org/0009-0000-2837-4731

---

## License
MIT
