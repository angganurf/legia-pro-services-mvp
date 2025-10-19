# Security Guidelines for `legia-pro-services-mvp`

This document outlines the security principles and controls you must apply when extending the `legia-pro-services-mvp` starter template into a full-featured marketplace. It follows industry best practices—embedding security by design, enforcing least privilege, and adopting defense-in-depth across all layers of the stack.

---

## 1. Security by Design & Secure Defaults

- Embed security reviews at every sprint: design, code, test, and deploy phases.  
- Grant least privilege for all services, containers, database roles, and users.  
- Adopt a layered approach: network segmentation, application controls, data encryption, and runtime defense.  
- Ship with secure defaults (e.g., disabled debug, strong password policies, locked-down CORS) and require explicit opt-in to relax them.

---

## 2. Authentication & Access Control

### 2.1 Password Security
- Store user passwords using a modern hashing algorithm (Argon2 or bcrypt) with unique salts.  
- Enforce complexity rules: minimum length (e.g., 12 chars), mixed character classes, no reused passwords.  
- Implement password rotation and expiration policies for administrators and professional accounts.

### 2.2 Session and Token Management
- Issue session identifiers as secure, HTTPOnly, `SameSite=Strict` cookies.  
- Enforce idle and absolute session timeouts.  
- Protect against session fixation: regenerate session IDs after privilege elevation (login, MFA).  
- If using JWTs:
  - Sign with a strong HMAC (HS256+) or RSA/ECDSA algorithm—never `alg: none`.  
  - Validate signatures, check `exp` and `iat`, revoke on logout.

### 2.3 Role-Based Access Control (RBAC)
- Define roles (`client`, `professional`, `admin`) and associate granular permissions.  
- Enforce server-side authorization checks in API routes and page layouts via middleware in `lib/auth.ts`.  
- Isolate Admin Panel routes under `/app/(admin)` with strict RBAC gating.

### 2.4 Multi-Factor Authentication (MFA)
- Provide optional TOTP or SMS-based MFA for high-privilege accounts.  
- Enforce MFA enrollment before access to sensitive admin features.

### 2.5 Brute-Force & Rate Limiting
- Apply IP-based rate limiting on login and OTP endpoints using a library like `express-rate-limit` or a Next.js edge middleware.  
- Implement account lockout or progressive backoff on repeated failures.

---

## 3. Input Handling & Processing

### 3.1 Parameterized Queries & ORM Usage
- Use Drizzle ORM exclusively for all database interactions—avoid string concatenation.  
- Leverage prepared statements to prevent SQL injection.

### 3.2 Server-Side Validation & Sanitization
- Validate all API inputs with a schema validator (Zod or Joi) in each `/app/api/*` route.  
- Enforce constraints on project creation, chat messages, file uploads, and payment data.  
- Sanitize HTML inputs and encode outputs to mitigate XSS.

### 3.3 File Upload Security
- Restrict upload endpoints (e.g., KYC docs) to authenticated users with RBAC.  
- Validate file types via MIME sniffing, impose size limits, and store uploads outside the webroot.  
- Scan for malware (integrate with a scanning service) and rename files to avoid path traversal.

### 3.4 Protect Against Injection Attacks
- Never interpolate user input into shell commands or dynamic imports.  
- For any external API calls, validate URL allow-lists to prevent SSRF.

---

## 4. Data Protection & Privacy

### 4.1 Encryption
- Enforce TLS 1.2+ (prefer TLS 1.3) for all inbound/outbound traffic.  
- At rest: rely on disk-level encryption for database volumes and object storage.  

### 4.2 Secrets Management
- Store environment variables (DB credentials, API keys, JWT secrets) in a vault (HashiCorp Vault, AWS Secrets Manager).  
- Rotate secrets periodically and on personnel changes.

### 4.3 Logging & Information Leakage
- Centralize logs via a secure logging service; strip PII (emails, phone numbers, payment details) from logs.  
- On errors, return generic messages to clients; log detailed tracebacks only to a secured audit log.

### 4.4 Database Hardening
- Create dedicated database roles with minimal privileges (e.g., read/write only on required schemas).  
- Enable SSL/TLS for Postgres connections; reject unencrypted client attempts.

---

## 5. API & Service Security

### 5.1 HTTPS & HSTS
- Redirect all HTTP traffic to HTTPS.  
- Set `Strict-Transport-Security` header with an appropriate max‐age.

### 5.2 Rate Limiting & Throttling
- Globally throttle abusive endpoints (e.g., `/api/auth`, `/api/orders`, `/api/chat`) using edge or API gateway policies.

### 5.3 CORS & CSRF
- Configure CORS to allow only trusted origins (your SPA domain).  
- For state-changing requests, implement anti-CSRF tokens or rely on `SameSite=Strict` cookies.

### 5.4 API Versioning & Least Exposure
- Prefix endpoints with `/api/v1/...` and maintain backward compatibility rules.  
- Return only fields required by each client; avoid overexposing internal data structures.

---

## 6. Web Application Security Hygiene

### 6.1 Security Headers
- `Content-Security-Policy`: restrict sources for scripts, styles, frames, images.  
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer-when-downgrade`.

### 6.2 Secure Cookies
- Set `Secure`, `HttpOnly`, `SameSite=Strict` on all session or JWT cookies.  
- Avoid storing session tokens in `localStorage` or `sessionStorage`.

### 6.3 Subresource Integrity (SRI)
- For any CDN-hosted scripts/styles (e.g., Tailwind CDN), include integrity hashes.

---

## 7. Infrastructure & Configuration Management

### 7.1 Container & Host Hardening
- Base Docker images: use minimal distros (Alpine, slim variants) and regularly rebuild.  
- Disable SSH and unnecessary daemons in production containers.

### 7.2 Network & Port Controls
- Expose only necessary ports (80/443) to the internet.  
- Use VPC or internal networking for database access.

### 7.3 Configuration Drift & Secrets
- Store infrastructure-as-code (Terraform, CloudFormation) in version control.  
- Do not embed secrets in IaC—reference secrets from vaults.

### 7.4 Patching & Updates
- Automate OS and package updates in non-breaking windows.  
- Subscribe to security advisories for key dependencies (Node.js, PostgreSQL).

### 7.5 Remove Debug & Verbose Features
- Disable source maps and debugging endpoints in production builds.  
- Ensure `NEXT_PUBLIC_` environment variables never expose secrets.

---

## 8. Dependency Management

- Lock dependencies via `package-lock.json` or `pnpm-lock.yaml`.  
- Integrate SCA tooling (Snyk, Dependabot) to detect vulnerable transitive dependencies.  
- Regularly audit and prune unused packages.  
- Prefer well-maintained libraries (Zod, Drizzle ORM, Socket.IO) and track their security advisories.

---

## 9. DevOps & CI/CD Security

- Store CI secrets in a vault, not in plaintext YAML.  
- Enforce pre-merge checks: lint, type-check, unit tests, SAST.  
- Restrict merge rights to authorized team members; require pull-request reviews.  
- Sign container images and only deploy from a trusted registry.  
- Monitor pipeline runs for anomalies.

---

By adhering to these guidelines, the `legia-pro-services-mvp` codebase will adhere to best-in-class security practices—ensuring a robust, defensible foundation for your professional-services marketplace.

*This document should be reviewed and updated periodically to reflect evolving threats and new feature requirements.*