# Roadmap

## Purpose

This roadmap exists to keep development of **Llero** focused and productive. It is designed for solo development but can scale as collaborators join. Each milestone is a concrete, high-leverage target. When you sit down to work, this document tells you what to build next—and why.

---

## Development Stages

### ✅ Stage 1: Core Foundation (MVP)

- [x] **Forge Tool Builder**
  - Visual JSON editor
  - Parameter support (string, number, boolean, object, array)
  - Dependency support (conditional visibility/requirement)

- [x] **Basic API Layer**
  - REST API for tools and categories
  - Tool testing endpoint

- [x] **SQLite Persistence**
  - Save/load tools and metadata

- [x] **Basic UI Framework**
  - React + Tailwind + Radix UI

- [x] **Tool Validation & Export**
  - Export OpenAI-style function specs

---

## 🧭 Stage 2: Local Power User (v0.2.0 – Q2 2025)

- [ ] **Tool Import/Export UI**
- [ ] **Improved Tool Filtering/Search**
- [ ] **Dark/Light Theme Toggle**
- [ ] **Keyboard Shortcuts**
- [ ] **Tool Versioning**
- [ ] **Tool Templates**
- [ ] **Tool Duplication**

Milestone Goal: Feature-complete for solo developers managing multiple tools offline.

---

## 🧪 Stage 3: Testing & Feedback (v0.3.0 – Q3 2025)

- [ ] **Better Tool Test Preview**
- [ ] **Parameter Preview Panel**
- [ ] **Validation Error Feedback**
- [ ] **Integration Test Coverage**
- [ ] **Performance Benchmarks**

Milestone Goal: Improve trust and feedback loop around creating complex tools.

---

## 🧰 Stage 4: Modular Infrastructure (v1.0.0 – Q4 2025)

- [ ] **Module System (Forge, Barracks, Academy, Armory, Command Center)**
- [ ] **Environment Variable Support**
- [ ] **Initial Agent Scaffolding**
- [ ] **Academy API Key Management**
- [ ] **CLI or API Wrapper for Testing Tools**

Milestone Goal: Stabilize the full app architecture. Modular, extensible, ready to scale.

---

## 👤 Stage 5: Multi-User Platform (v1.5.0 – Q1 2026)

- [ ] **User Auth (JWT)**
- [ ] **RBAC (Owner, Editor, Viewer)**
- [ ] **Personal Tool Collections**
- [ ] **Basic Collaboration (Commenting, Sharing)**

Milestone Goal: Add just enough user capability to support limited team usage.

---

## 🌐 Stage 6: LLM Orchestration (v2.0.0 – Q2 2026)

- [ ] **Lleros (Agents) Configuration Panel**
- [ ] **Command Center Chat Interface**
- [ ] **Multi-tool Invocation**
- [ ] **Armory View with Tool Usage Metrics**
- [ ] **Session Management + History**

Milestone Goal: First complete workflow from user ➝ agent ➝ tools ➝ response.

---

## 🛠️ Stage 7+: Long-Term Enhancements (Post v2.0.0)

- [ ] **Plugin System + Extension SDK**
- [ ] **Team Management, SSO, Billing**
- [ ] **Tool Marketplace**
- [ ] **Tool Composition and Pipelines**
- [ ] **Workflow Builder**
- [ ] **AI-Assisted Tool Generation**
- [ ] **Real-time Collaboration (WebSockets)**
- [ ] **Cloud Deployment Scripts (Kubernetes/Helm)**

---

## Milestone Summary

| Version | Target      | Focus                         |
|---------|-------------|-------------------------------|
| 0.1.0   | ✅ April 2025 | Forge MVP                    |
| 0.2.0   | Q2 2025      | Power User Tools              |
| 0.3.0   | Q3 2025      | Testing and Trust             |
| 1.0.0   | Q4 2025      | Modular App Infrastructure    |
| 1.5.0   | Q1 2026      | User Accounts + Sharing       |
| 2.0.0   | Q2 2026      | Full Agentic Workflow         |

---

## Working Philosophy

- Every item in this list should break down into concrete GitHub issues/tasks.
- The current stage's top item is always the **next task**.
- If in doubt, return here and focus on the next bullet.

---

## Contribution Plans

This roadmap is for solo execution but designed to scale with future help. Once you onboard a collaborator:

- Each stage becomes a GitHub milestone
- Each bullet becomes a labeled issue or project card
- This doc becomes your strategic north star

---

Let’s build Llero—one focused task at a time.
