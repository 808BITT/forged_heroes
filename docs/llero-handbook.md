# Llero Handbook

This handbook consolidates the **User Guide**, **Administrator Guide**, and **FAQ** into a single reference for using, managing, and understanding the Llero platform.

---

## 1. Getting Started

### Installation (Local)

```bash
git clone https://github.com/yourusername/llero.git
cd llero
npm install
npm run dev

# Backend
cd server
npm install
node server.js
```

Navigate to `http://localhost:5173`

### Docker Installation

```bash
docker-compose up -d
```

---

## 2. Using the Platform

### Tool Creation

- Go to **Tools**
- Click **New Tool**
- Add a name, description, and category
- Use **Add Parameter** to define inputs

Supported types: `string`, `number`, `boolean`, `object`, `array`, `enum`

### Tool Testing

- Click **Test** on any tool
- Enter mock data
- View validation and structure

### Dependencies

Create logic-based behavior by linking parameter requirements to others via conditions (e.g., required if paramX equals "yes").

### Armory

Explore tools by category and view their structure via a visual interface.

### Import/Export

- **Import**: Paste JSON into the import dialog
- **Export**: Click **Copy JSON** in the editor

---

## 3. Configuration & Deployment

### Environment Variables

```
PORT=3001
NODE_ENV=production
DB_PATH=./server/data/tools.db
CORS_ORIGIN=http://localhost:5173
```

### Building for Production

```bash
npm run build
cd server
node server.js
```

Or using PM2:

```bash
pm2 start ecosystem.config.js
```

---

## 4. Administration

### Backups

```bash
sqlite3 ./server/data/tools.db ".backup './backups/tools_TIMESTAMP.db'"
```

Automate with cron and backup script.

### Monitoring

- `pm2 monit`
- Add `/api/health` endpoint for health checks

### Performance

- Enable Gzip and caching (Nginx or Caddy)
- Use DB indexing for heavy queries

### Logs

Logs default to console. Use `pm2 logs llero-backend` to view.

---

## 5. Frequently Asked Questions

### What is Llero?

Llero is a modular platform for building and orchestrating AI agents ("lleros") through JSON-defined tool specifications.

### Can I use it offline?

Yes. All tools and functionality are available locally.

### Is it open source?

Yes – MIT licensed.

### What LLMs is it compatible with?

Any LLM that supports function calling (e.g., GPT-4, Claude, Gemini).

### How do I report bugs or suggest features?

Open a GitHub issue or use the support section in the app.

---

## 6. Troubleshooting

| Problem                     | Solution                                                                 |
|----------------------------|--------------------------------------------------------------------------|
| Server won't start         | Check Node version and logs                                              |
| Database errors            | Check file paths, permissions, and run `migrate-tools.js`                |
| Connection issues          | Check firewall and server logs                                           |
| Tool not saving            | Ensure all required fields are filled                                    |
| Dependency not working     | Check condition logic and source parameter                              |

---

## 7. Best Practices

- Use **camelCase** for parameter names
- Add **default values** and **validation constraints**
- Organize tools in **categories**
- Group related parameters visually and structurally
- Use clear, descriptive names and tool descriptions

---

## 8. Keyboard Shortcuts

| Action         | Shortcut              |
|----------------|-----------------------|
| Save Tool      | Ctrl+S / Cmd+S        |
| Add Parameter  | Ctrl+Shift+P / Cmd+Shift+P |
| Copy JSON      | Ctrl+Shift+C / Cmd+Shift+C |
| Test Tool      | Ctrl+T / Cmd+T        |

---

## 9. Resources

- [Llero GitHub Repository](https://github.com/yourusername/llero)
- [SQLite Documentation](https://sqlite.org/docs.html)
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [PM2 Process Manager](https://pm2.keymetrics.io/)
