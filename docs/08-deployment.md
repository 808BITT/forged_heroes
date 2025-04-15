# Deployment

## Overview

This document provides guidelines for deploying the Forge application in different environments. Forge is designed to be flexible in its deployment options, from local development to production environments.

## Deployment Options

### Local Development

The simplest deployment option for individual use:

1. Clone the repository
2. Install dependencies
3. Run the development server

```bash
# Install frontend dependencies
npm install

# Start frontend development server
npm run dev

# In another terminal, navigate to server directory
cd server

# Install server dependencies
npm install

# Start backend server
node server.js
```

### Self-Hosted Production

For deploying to your own server:

#### Prerequisites

- Node.js 18+ installed
- Git
- Web server (optional, for reverse proxy)

#### Deployment Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/forge.git
   cd forge
   ```

2. Install dependencies and build frontend:

   ```bash
   npm install
   npm run build
   ```

3. Set up the server:

   ```bash
   cd server
   npm install
   ```

4. Create environment variables:

   ```bash
   # Create .env file
   echo "PORT=3001" > .env
   echo "DB_PATH=/path/to/persistent/data/tools.db" >> .env
   ```

5. Start the server:

   ```bash
   node server.js
   ```

#### Using PM2 for Process Management

For better process management in production:

1. Install PM2:

   ```bash
   npm install -g pm2
   ```

2. Create ecosystem file:

   ```bash
   # ecosystem.config.js
   module.exports = {
     apps: [{
       name: "forge-backend",
       script: "server.js",
       cwd: "./server",
       env: {
         PORT: 3001,
         DB_PATH: "/path/to/data/tools.db",
         NODE_ENV: "production"
       },
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G'
     }]
   };
   ```

3. Start with PM2:

   ```bash
   pm2 start ecosystem.config.js
   ```

4. Set up PM2 to start on system boot:

   ```bash
   pm2 startup
   pm2 save
   ```

### Docker Deployment

For containerized deployment:

1. Create a Dockerfile:

   ```dockerfile
   # Build stage
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # Runtime stage
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=build /app/dist ./dist
   COPY --from=build /app/server ./server
   COPY package*.json ./
   RUN npm install --production
   
   # Create data directory
   RUN mkdir -p ./server/data
   
   # Expose ports
   EXPOSE 3001
   
   # Set environment variables
   ENV NODE_ENV=production
   ENV PORT=3001
   ENV DB_PATH=/app/server/data/tools.db
   
   # Start application
   CMD ["node", "./server/server.js"]
   ```

2. Create a docker-compose.yml file:

   ```yaml
   version: '3'
   services:
     forge:
       build: .
       ports:
         - "3001:3001"
       volumes:
         - forge-data:/app/server/data
       restart: unless-stopped
   
   volumes:
     forge-data:
   ```

3. Build and run with Docker Compose:

   ```bash
   docker-compose up -d
   ```

## Reverse Proxy Configuration

### Nginx

For using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name forge.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable HTTPS with Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d forge.yourdomain.com
```

### Caddy

For using Caddy as a simpler alternative:

```caddyfile
forge.yourdomain.com {
  reverse_proxy localhost:3001
}
```

Caddy automatically handles HTTPS certificate provisioning and renewal.

## Environment Variables

Configure the application using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| DB_PATH | Path to SQLite database | ./server/data/tools.db |
| NODE_ENV | Environment (development/production) | development |

## Static File Hosting Alternatives

For optimized deployment, you can separate frontend and backend:

1. Build the frontend:

   ```bash
   npm run build
   ```

2. Host the static files from `dist` using:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

3. Configure the backend API URL in the frontend build.

## Database Backup

Implement regular backups of the SQLite database:

```bash
#!/bin/bash
# backup-db.sh
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/path/to/backups"
DB_PATH="/path/to/data/tools.db"

mkdir -p "$BACKUP_DIR"
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/tools-$TIMESTAMP.db'"
```

Add to crontab for automated backups:

```
0 0 * * * /path/to/backup-db.sh
```

## Monitoring and Logging

### Basic Logging

The application uses a custom logging service that can be configured for different environments:

```typescript
// Configure logger in production
logger.configure({
  minLevel: LogLevel.INFO,
  enableConsoleOutput: true,
  enableRemoteLogging: true,
  remoteLoggingEndpoint: 'https://your-logging-service.com'
});
```

### Advanced Monitoring

For production environments, consider implementing:

- Application performance monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Resource usage monitoring

## Database Migrations

For database schema changes, use the migration script:

```bash
node server/migrate-tools.js
```

## Deployment Checklist

Before deploying to production:

1. Build the frontend in production mode
2. Set secure environment variables
3. Ensure database paths are configured correctly
4. Configure proper logging
5. Set up HTTPS
6. Implement database backup strategy
7. Configure monitoring
8. Test thoroughly in a staging environment
