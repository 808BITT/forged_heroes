# Administrator Guide

## Introduction

This Administrator Guide provides detailed instructions for installing, configuring, and managing the Forge application. It's intended for system administrators and technical users responsible for deploying and maintaining the application.

## System Requirements

### Minimum Requirements

- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher
- **Disk Space**: 500MB for application + database (scales with tool count)
- **Memory**: 2GB RAM recommended
- **Operating System**: Windows, macOS, or Linux

### Recommended Specifications

- **CPU**: 2+ cores
- **Memory**: 4GB RAM
- **Disk Space**: 1GB+ SSD storage
- **Network**: Stable internet connection for external API integrations

## Installation

### Standard Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/forge.git
   cd forge
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create necessary directories:

   ```bash
   mkdir -p server/data
   ```

4. Build the application:

   ```bash
   npm run build
   ```

5. Start the server:

   ```bash
   cd server
   npm install
   node server.js
   ```

### Docker Installation

1. Build and run using Docker Compose:

   ```bash
   docker-compose up -d
   ```

2. Verify the container is running:

   ```bash
   docker-compose ps
   ```

## Configuration

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```
# Server configuration
PORT=3001
NODE_ENV=production

# Database configuration
DB_PATH=./data/tools.db

# Logging configuration
LOG_LEVEL=info
ENABLE_REMOTE_LOGGING=false
REMOTE_LOGGING_ENDPOINT=

# Security configuration
CORS_ORIGIN=http://localhost:5173
```

### Database Setup

The application automatically creates the SQLite database and required tables when first launched. If you need to manually initialize the database:

```bash
cd server
node migrate-tools.js
```

## Administration Tasks

### User Management

Future versions will include user management. For the current version, no user management is required as it's a local application.

### Database Management

#### Backup Database

```bash
# Create a backup of the SQLite database
sqlite3 ./server/data/tools.db ".backup './server/data/tools_backup.db'"
```

#### Restore Database

```bash
# Restore from a backup
cp ./server/data/tools_backup.db ./server/data/tools.db
```

#### Database Cleanup

To optimize the database:

```bash
sqlite3 ./server/data/tools.db "VACUUM;"
```

### Log Management

Logs are stored in the console by default. Future versions will include configurable log destinations.

#### Viewing Logs

When running in production with PM2:

```bash
pm2 logs forge-backend
```

### Performance Tuning

#### Node.js Performance

For better performance with Node.js:

```bash
# Start the server with increased memory limit
NODE_OPTIONS="--max-old-space-size=4096" node server.js
```

#### Server Scaling

For higher load scenarios, consider deploying multiple instances behind a load balancer.

## Monitoring

### Health Checks

Implement a simple health check:

```bash
curl http://localhost:3001/api/health
```

Add a health endpoint to server.js:

```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown'
  });
});
```

### Resource Monitoring

Monitor system resources:

```bash
# Using PM2
pm2 monit

# Using standard tools
top -p $(pgrep node)
```

## Troubleshooting

### Common Issues

#### Server Won't Start

1. Check Node.js version:

   ```bash
   node --version
   ```

2. Verify port availability:

   ```bash
   netstat -tuln | grep 3001
   ```

3. Check log for errors:

   ```bash
   cat server/logs/error.log
   ```

#### Database Errors

1. Verify database path:

   ```bash
   ls -la server/data
   ```

2. Check file permissions:

   ```bash
   chmod 644 server/data/tools.db
   chmod 755 server/data
   ```

3. Try database migration:

   ```bash
   cd server
   node migrate-tools.js
   ```

#### Connection Issues

1. Verify server is running:

   ```bash
   ps aux | grep node
   ```

2. Check firewall settings:

   ```bash
   sudo ufw status
   ```

3. Test network connectivity:

   ```bash
   curl -v http://localhost:3001/api/health
   ```

## Security Management

### SSL/TLS Configuration

For production deployments, set up HTTPS:

1. Obtain SSL certificate
2. Configure reverse proxy (Nginx/Caddy)
3. Redirect HTTP to HTTPS

### File Permissions

Set appropriate permissions:

```bash
chmod -R 755 .
chmod -R 644 server/data/*.db
chmod 755 server/data
```

### Backup Strategy

Implement regular backups:

```bash
# Create backup script (backup.sh)
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
mkdir -p backups
sqlite3 server/data/tools.db ".backup 'backups/tools_${DATE}.db'"
```

Make executable and add to crontab:

```bash
chmod +x backup.sh
crontab -e
# Add: 0 0 * * * /path/to/forge/backup.sh
```

## Upgrading

### Standard Upgrade

1. Stop the server
2. Backup the database
3. Pull latest code:

   ```bash
   git pull origin main
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Build the application:

   ```bash
   npm run build
   ```

6. Start the server:

   ```bash
   cd server
   node server.js
   ```

### Docker Upgrade

1. Pull the latest image:

   ```bash
   docker-compose pull
   ```

2. Restart the containers:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Database Migration

For schema changes:

```bash
# Run the migration script
node server/migrate-tools.js

# Verify database integrity
sqlite3 server/data/tools.db "PRAGMA integrity_check;"
```

## Performance Optimization

### Frontend Optimization

1. Enable gzip compression in your web server:

   ```nginx
   # Nginx example
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. Set proper cache headers:

   ```nginx
   # Nginx example
   location /static/ {
     expires 1y;
     add_header Cache-Control "public";
   }
   ```

### Backend Optimization

1. Implement database indexing:

   ```sql
   -- Example for better query performance
   CREATE INDEX idx_tools_category ON tools(category);
   ```

2. Enable Node.js compression:

   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

## Disaster Recovery

1. Regular database backups
2. Store backups in multiple locations
3. Document recovery procedure:

   ```
   1. Restore latest database backup
   2. Reinstall application if necessary
   3. Verify data integrity
   4. Resume operations
   ```

## Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
