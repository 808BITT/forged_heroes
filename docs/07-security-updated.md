# Security

## Overview

This document outlines the security model, current practices, and future enhancements for the **Llero platform**. As Llero evolves from a local-first tool into a multi-user, multi-agent system supporting sensitive data like API keys, billing, and email, a solid security foundation is essential.

---

## Core Principles

1. **Defense in Depth** – Multiple security layers across network, app, and data layers
2. **Least Privilege** – Users, services, and roles get only what they need
3. **Secure Defaults** – Hardened baseline configurations from the start
4. **Visibility & Monitoring** – All critical actions are logged and auditable
5. **User-Centric Privacy** – Secure handling of user identities, tokens, and data

---

## Current Implementation

### Local Storage

- SQLite is used in development (encrypted storage is planned)
- Database resides in the `data/` directory
- No PII or sensitive user data is stored yet

### API & Input Validation

- All request payloads are validated using **Ajv JSON schemas**
- Inputs are sanitized against injection, XSS, and schema violations
- APIs return only minimal error info to clients

### Frontend

- Strict **Content Security Policy (CSP)**
- All inputs are encoded and sanitized
- No unsafe-inline scripts or dynamic DOM manipulation
- Feature flags for future security toggles

---

## Planned Security Enhancements

### Authentication & User Management

- **JWT-based** sessions (with refresh token support)
- **Role-Based Access Control (RBAC)**: Admins, Developers, Viewers
- **Hashed passwords (bcrypt)** and user profile metadata
- Optional MFA for secure user login

```js
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '8h' }
);
```

### Secrets Management

- Secure vault for API keys (OpenAI, Anthropic, etc.)
- Encryption-at-rest (AES-256) and in-transit (HTTPS)
- Integration with external vaults (e.g., HashiCorp Vault or AWS Secrets Manager)
- Only authorized agents (lleros) can use scoped secrets

### Data Privacy & Retention

- Data classified by sensitivity (e.g., tokens, email, config)
- Secure deletion policies (e.g., expired sessions, deleted tools)
- Optional data expiry settings on tools, agents, and sessions

---

## Server Security

### HTTP Headers

```js
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Content-Security-Policy', "default-src 'self'");
res.setHeader('Referrer-Policy', 'no-referrer');
res.setHeader('Permissions-Policy', "geolocation=()");
```

### CORS Example

```js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Error Handling & Logging

```js
app.use((err, req, res, next) => {
  logger.error('Unhandled exception', {
    message: err.message,
    stack: err.stack,
    route: req.path
  });
  res.status(500).json({ message: 'Internal server error' });
});
```

- Logs are stored securely and rotated periodically
- Sensitive values like tokens and secrets are never logged

---

## Dependency Security

- Use `npm audit` and `snyk` scans
- Keep all dependencies patched and version-locked
- Avoid unnecessary packages and monitor transitive risks

---

## CI/CD & Deployment

- Run tests + vulnerability scans pre-deploy
- Deploy only over **HTTPS** with valid TLS certs
- Use reverse proxies (Nginx, Caddy) to apply global rate limits & CSP headers
- Isolate environments (dev/stage/prod) with separate credentials
- Deploy behind WAF for public-facing instances

---

## Incident Response

1. **Detect** abnormal behavior via logging and rate limits
2. **Contain** the breach by revoking tokens and isolating services
3. **Respond** with patches and public communication if needed
4. **Recover** from backups or snapshots
5. **Learn** from root cause analysis and improve defenses

---

## Security Testing Plan

- ✅ Static code analysis (SAST)
- ✅ Dependency audits (e.g., `npm audit`, `snyk`)
- 🟡 Automated secret scanners (planned)
- 🟡 Penetration testing pre-launch
- 🟡 Session replay + alerting in production dashboard

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Express.js Security Guide](https://expressjs.com/en/advanced/best-practice-security.html)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

Llero aims to provide secure, privacy-respecting AI tooling with user trust and operational integrity at the core.
