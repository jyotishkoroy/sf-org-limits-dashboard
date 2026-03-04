# Org Limits Dashboard

A lightweight admin utility to visualize Salesforce org limits with threshold signals, search/sort, refresh, and CSV export.

This project intentionally avoids schema changes:

- No Custom Objects
- No Custom Metadata Types
- No Custom Settings

It reads limits via the standard REST endpoint (`/services/data/vXX.X/limits`) using same-origin fetch from the browser.

**Maintainer:** Jyotishko Roy (https://orcid.org/0009-0000-2837-4731)
