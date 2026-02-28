# Secure Client Intake App Scaffold

## Run locally
```bash
cd secure-client-intake/app
npm install
npm run dev
```

Open: http://localhost:3000

## Included
- `/` public landing page
- `/intake` secure form scaffold
- `/api/intake` validated intake endpoint (Zod)

## Important TODOs before production
1. Replace placeholder storage with encrypted DB writes.
2. Implement KMS envelope encryption for SSN/bank fields.
3. Add auth (magic links + expiry + MFA for staff portal).
4. Add audit log events for read/write/export.
5. Add rate limits + bot mitigation.
