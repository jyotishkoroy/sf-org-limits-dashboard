# Security Policy

## Reporting a Vulnerability
If you discover a security issue, do not publish details in a public issue.
Open a GitHub issue requesting private coordination.

## Notes
- This app reads org limits through the platform's authenticated same-origin REST APIs.
- No org data is stored persistently by the app (CSV export happens client-side).
- Optional preferences are stored locally in the user's browser (Local Storage).
