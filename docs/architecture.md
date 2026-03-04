# Architecture

## Data source
The UI calls the authenticated same-origin REST endpoint:

- `/services/data/v55.0/limits`

This returns a JSON map of limit keys -> `{ Max, Remaining }` objects.

## No server-side storage
- The dashboard does not store org data.
- CSV export is generated in the browser.

## Preferences
Threshold preferences are stored in Local Storage:

- `OLD_PREFS` (warn/high percentages)
