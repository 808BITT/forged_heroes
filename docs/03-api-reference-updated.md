# API Reference

## Overview

This document outlines all available API endpoints for the Llero platform. The API is RESTful and JSON-based. While originally scoped for the Forge module, this reference has expanded to include other modules of the Llero platform:

- **Forge**: JSON tool spec builder
- **Barracks**: Agent management
- **Academy**: LLM provider configuration
- **Armory**: Tool library viewer
- **Command Center**: Session management and orchestration

## Base URL

All API endpoints are relative to: `http://localhost:3001`

## Authentication

Authentication is currently not enforced. Token-based authentication is planned via the Academy module to restrict access to certain endpoints.

---

## 🔧 Forge: Tools & Categories

### Get All Tools

- **URL:** `/api/tools`
- **Method:** `GET`

### Get Tool by ID

- **URL:** `/api/tools/:id`
- **Method:** `GET`

### Create Tool

- **URL:** `/api/tools`
- **Method:** `POST`

### Update Tool

- **URL:** `/api/tools/:id`
- **Method:** `PUT`

### Delete Tool

- **URL:** `/api/tools/:id`
- **Method:** `DELETE`

### Get All Categories

- **URL:** `/api/categories`
- **Method:** `GET`

### Create Category

- **URL:** `/api/categories`
- **Method:** `POST`

### Delete Category

- **URL:** `/api/categories/:id`
- **Method:** `DELETE`

---

## 🧪 Forge: Testing & Function Utility

### Parse Function Signature

- **URL:** `/api/parseFunctionSignature`
- **Method:** `POST`

### Generate Description

- **URL:** `/api/generateDescription`
- **Method:** `POST`

### Test Tool Specification

- **URL:** `/api/test-tool`
- **Method:** `POST`

---

## 🧠 Barracks: Llero Agent Management

*(Planned)*

- `GET /api/agents`: List all lleros (AI agents)
- `POST /api/agents`: Create a new agent
- `PUT /api/agents/:id`: Update an agent’s configuration
- `DELETE /api/agents/:id`: Remove a llero

---

## 🎓 Academy: LLM Provider Integration

*(Planned)*

- `GET /api/providers`: List available LLM provider configurations
- `POST /api/providers`: Add new provider config (e.g., OpenAI API Key)
- `PUT /api/providers/:id`: Update provider settings
- `DELETE /api/providers/:id`: Delete a provider

---

## 🏛 Armory: Tool Library & Versioning

*(Planned)*

- `GET /api/armory/tools`: View all tools with metadata
- `GET /api/armory/tools/:id/versions`: Tool version history
- `POST /api/armory/tools/:id/clone`: Clone a tool for modification

---

## 🧭 Command Center: Chat Sessions

*(Planned)*

- `POST /api/sessions`: Start new session
- `POST /api/sessions/:id/message`: Send a message to a session
- `GET /api/sessions/:id`: Fetch full session history
- `DELETE /api/sessions/:id`: Delete session

---

## Tool Schema

```ts
interface ToolParameter {
  id: string;
  name: string;
  type: string; // "string" | "number" | "integer" | "boolean" | "object" | "array" | "enum"
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
      paramId: string;
      operator: string;
      value: any;
    }>;
    effect: string;
  } | null;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  status: "active" | "inactive" | "draft";
  lastModified: string;
}
```

## Error Responses

```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error
