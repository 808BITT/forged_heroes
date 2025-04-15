# Data Model

## Overview

This document defines the data models used across the Llero platform. While originally scoped for the Forge module, the data model now supports additional modules such as Barracks, Academy, Armory, and Command Center. These models ensure consistent structure and interaction across the platform.

---

## Core Entities

### Tool

Represents a function-calling specification for LLM tools (used in Forge, referenced in Barracks and Armory):

```ts
interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "inactive" | "draft";
  parameters: Parameter[];
  lastModified: string;
}
```

### Parameter

Defines an individual input accepted by a tool:

```ts
interface Parameter {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  format?: string;
  enumValues?: string[];
  minimum?: string;
  maximum?: string;
  default?: string;
  arrayItemType?: string;
  arrayItemDescription?: string;
  objectProperties?: Record<string, any>;
  dependencies?: {
    conditions: Array<{
      id: string;
      paramId: string;
      operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
      value: string;
    }>;
    effect: "required" | "visible" | "hidden";
  } | null;
}
```

### Category

Used to organize tools:

```ts
interface Category {
  id: string;
  name: string;
}
```

### Agent (Llero)

Defined in Barracks, agents are personas equipped with toolkits:

```ts
interface Agent {
  id: string;
  name: string;
  description: string;
  assignedToolIds: string[];
  personality?: string;
  lastUpdated: string;
}
```

### Provider Configuration (Academy)

Used to store LLM API keys and integration settings:

```ts
interface ProviderConfig {
  id: string;
  providerName: string; // e.g., "OpenAI", "Anthropic"
  apiKey: string;
  config: Record<string, any>;
}
```

### Session (Command Center)

Used to track real-time interactions with lleros:

```ts
interface Session {
  id: string;
  agentId: string;
  createdAt: string;
  messages: ChatMessage[];
}
```

```ts
interface ChatMessage {
  role: "user" | "agent" | "system";
  content: string;
  timestamp: string;
}
```

---

## Database Schema

### Tools Table

```sql
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  parameters TEXT,
  status TEXT,
  lastModified TEXT
);
```

### Categories Table

```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
```

### Agents Table (Planned)

```sql
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  assignedToolIds TEXT,
  personality TEXT,
  lastUpdated TEXT
);
```

### Provider Config Table (Planned)

```sql
CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY,
  providerName TEXT,
  apiKey TEXT,
  config TEXT
);
```

### Sessions Table (Planned)

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  agentId TEXT,
  createdAt TEXT,
  messages TEXT
);
```

---

## Tool Export Format

Tools are exported as OpenAI-style function call specs:

```json
{
  "type": "function",
  "function": {
    "name": "tool_name",
    "description": "Tool description",
    "parameters": {
      "type": "object",
      "properties": {
        "param1": {
          "type": "string",
          "description": "Parameter description"
        }
      },
      "required": ["param1"]
    }
  }
}
```

---

## State Management (Frontend Example: Forge Tools)

```ts
interface ToolState {
  tools: Record<string, Tool>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  getAllTools: () => Tool[];
  getToolById: (id: string) => Tool | undefined;
  addTool: (tool: Omit<Tool, "id">) => Promise<string>;
  updateTool: (id: string, tool: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  getStats: () => { totalTools: number; activeTools: number; recentlyUpdated: number };
  loadToolSpecifications: () => Promise<void>;
}
```

---

## Relationships

- Each **Tool** belongs to a **Category**
- Each **Tool** has many **Parameters**
- Each **Agent** can use multiple **Tools**
- Each **Session** is linked to a specific **Agent**
- Each **ProviderConfig** belongs to the **Academy** and supports tool execution via LLMs
