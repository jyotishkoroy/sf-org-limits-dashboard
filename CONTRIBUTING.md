# Contributing

## Local development
```bash
sf org create scratch --definition-file config/project-scratch-def.json --set-default --alias old
sf project deploy start --source-dir force-app --target-org old
```

## Guidelines
- Keep changes covered with Apex tests.
- Avoid org-specific assumptions (hard-coded domains, remote site settings).
- Keep the project schema-neutral (no custom objects).
