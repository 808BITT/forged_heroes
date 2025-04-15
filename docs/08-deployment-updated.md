# Deployment

## Overview

This document outlines deployment strategies and environments for the **Llero platform**. Llero supports flexible setups—from local development to containerized, production-ready hosting—with an emphasis on security, modularity, and maintainability.

---

## Deployment Options

### Local Development

For developers iterating on the platform:

```bash
# Frontend
npm install
npm run dev

# Backend
cd server
npm install
node server.js
```

### Self-Hosted Production

#### Prerequisites

- Node.js 18+
- Git
- (Optional) Reverse proxy (e.g., Nginx, Caddy)
- HTTPS certificates (via Certbot or automatic with Caddy)

#### Steps

```bash
git clone https://github.com/yourusername/llero.git
cd llero
npm install
npm run build

cd server
npm install
echo "PORT=3001" > .env
echo "DB_PATH=/path/to/data/llero.db" >> .env
node server.js
```

### Process Management (PM2)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**ecosystem.config.js:**

```js
module.exports = {
  apps: [{
    name: "llero-backend",
    script: "server.js",
    cwd: "./server",
    env: {
      NODE_ENV: "production",
      PORT: 3001,
      DB_PATH: "/path/to/data/llero.db"
    }
  }]
};
```

---

## Docker Deployment

### Dockerfile

```Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY package*.json ./
RUN npm install --production
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/server/data/llero.db
CMD ["node", "./server/server.js"]
```

### docker-compose.yml

```yaml
version: '3'
services:
  llero:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - llero-data:/app/server/data
    restart: unless-stopped

volumes:
  llero-data:
```

```bash
docker-compose up -d
```

---

## Reverse Proxy Configuration

### Nginx

```nginx
server {
  listen 80;
  server_name llero.yourdomain.com;

  location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
  }
}
```

**Enable HTTPS:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d llero.yourdomain.com
```

### Caddy

```caddyfile
llero.yourdomain.com {
  reverse_proxy localhost:3001
}
```

Caddy will automatically provision and renew TLS certificates.

---

## Environment Variables

| Variable   | Description                      | Default                       |
|------------|----------------------------------|-------------------------------|
| PORT       | Server port                      | 3001                          |
| DB_PATH    | SQLite DB path                   | ./server/data/llero.db        |
| NODE_ENV   | Environment flag                 | development                   |

---

## Frontend Hosting (Optional)

Frontend (`dist/`) can be hosted separately:

- **Static hosting**: Netlify, Vercel, GitHub Pages
- **Cloud hosting**: AWS S3 + CloudFront
- Set API base URL via `.env.production`

---

## Backups

### Script

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/backups"
DB_PATH="/data/llero.db"
mkdir -p "$BACKUP_DIR"
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/llero-$TIMESTAMP.db'"
```

**Add to crontab:**

```
0 3 * * * /usr/local/bin/backup-llero.sh
```

---

## Monitoring & Logging

### Application Logging

```ts
logger.configure({
  minLevel: LogLevel.INFO,
  enableConsoleOutput: true,
  enableRemoteLogging: true,
  remoteLoggingEndpoint: 'https://your-logging-service.com'
});
```

### Additions

- [ ] APM: Datadog, New Relic, or OpenTelemetry
- [ ] Uptime Monitoring: UptimeRobot, BetterStack
- [ ] Error Tracking: Sentry

---

## Database Migrations

Run schema changes with:

```bash
node server/migrate-tools.js
```

---

## Deployment Checklist ✅

1. ✅ Frontend built with `npm run build`
2. ✅ `.env` configured securely
3. ✅ SQLite path is persistent
4. ✅ Logging enabled
5. ✅ HTTPS enabled (Caddy/Certbot)
6. ✅ Automated database backups
7. ✅ Monitoring in place
8. ✅ Staging tested and validated

---

## Future Plans

- Modular builds per module (Forge-only, Command Center-only)
- Helm chart for Kubernetes deployments
- Support for Postgres in cloud environments
