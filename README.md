# Llero 🦾

Llero is a modular developer platform for building AI-powered agents that operate through JSON-defined tools. It empowers developers to define, test, and orchestrate "function-calling" LLM workflows using customizable tool specs and structured agent logic.

> **Llero = LLM Hero**

---

## ✨ Features

- **Forge** – Visual builder for LLM tool specifications (JSON, OpenAI-style)
- **Commander Lite** – Chat-based agent interface using prebuilt tools
- **Barracks (Coming Soon)** – Full agent management and customization
- **Academy (Coming Soon)** – Connect external LLM providers (OpenAI, Anthropic, etc.)
- **Armory (Coming Soon)** – Tool explorer with visual relationships
- **Command Center (Coming Soon)** – Orchestrate workflows via multi-agent chat

---

## 🎯 Use Cases

- Developers creating JSON function specs for GPT-like models
- Teams prototyping tools to integrate with LLMs
- SaaS builders orchestrating multi-agent pipelines
- Educators visualizing function-calling interfaces for teaching AI

---

## 🚀 Getting Started

### Local Development

```bash
git clone https://github.com/yourusername/llero.git
cd llero
npm install
npm run dev

# In another terminal
cd server
npm install
node server.js
```

Then open [http://localhost:5173](http://localhost:5173)

### Docker

```bash
docker-compose up -d
```

---

## 📚 Documentation

- [Llero Handbook](./llero-handbook.md)
- [Developer Roadmap](./09-roadmap-updated.md)
- [Architecture Overview](./02-architecture-updated.md)
- [API Reference](./03-api-reference-updated.md)
- [Security Guide](./07-security-updated.md)

---

## 🛡 License

This code is **source-available** under a custom Business Source License variant.

- ✅ Free for personal and educational use
- ❌ Commercial use **requires a paid license**
- 📄 [See full license terms → LICENSE.md](./LICENSE.md)

Contact us to license Llero for use in your company, product, or organization.

📩 `llero-license@yourdomain.com`

---

## 📦 Monorepo Structure

```
llero/
├── forge/              # Visual tool builder (MIT-licensed core)
├── commander-lite/     # Minimal interface to test tools
├── server/             # API and backend
├── docs/               # Markdown documentation
├── docker-compose.yml
└── LICENSE.md
```

---

## 💡 Vision

Llero helps you build **superhuman AI agents** by letting you define tools they can call, visualize their logic, and scale their coordination—all from a simple, modular platform.

Whether you're coding solo or building a SaaS, Llero gives you the tools to control your AI.

> Build. Test. Orchestrate. Be the hero.

---

## 🙌 Contribute

Contributions to **Forge** and **Commander Lite** are welcome!

- Fork the repo
- Submit PRs to `dev` branch
- Check the roadmap and issues for current tasks

---

## 📬 Contact

Questions or licensing inquiries?

- GitHub Issues
- Email: `llero-license@yourdomain.com`
