# Production Hardening Checklist

## Auth + Access
- Use expiring magic links (already scaffolded)
- Add optional OTP for high-risk sessions
- Enforce staff MFA for internal review portal

## Application Security
- Secure headers + CSP enabled
- CAPTCHA gate on link requests (Turnstile)
- Rate limiting on auth + submission endpoints
- Strict server-side validation with Zod

## Data Protection
- Encrypt SSN/bank fields before DB writes
- Migrate from static env key to cloud KMS envelope keys
- Rotate key versions and maintain decryption compatibility

## Infra
- Private DB network access only
- Backups encrypted and restore-tested
- WAF enabled in front of app
- Centralized alerting for 4xx/5xx and auth anomalies

## Logging
- Never log raw SSN/bank values
- Keep immutable audit events for auth and submission actions
- Retain access logs per policy

## Integrations
- Use service account credentials from secret manager
- Send only necessary fields to downstream systems
- Prefer tokenized/masked identifiers where possible
