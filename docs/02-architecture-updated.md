# Architecture

## System Overview

Llero is built as a modern, monolithic web application composed of five interlinked modules:

- **Forge**: Tool specification builder for JSON-based function calling.
- **Barracks**: Agent manager for assigning tools and configuring "lleros".
- **Academy**: Integration manager for external LLM APIs (e.g., OpenAI, Anthropic).
- **Armory**: Tool explorer and visualization interface.
- **Command Center**: Chat-based interface for interacting with agents and tools in real time.

Each module shares a unified backend and frontend architecture. The system is built using a client-server model with a modular React frontend and an Express.js backend. Data persistence is handled with SQLite during development but is designed for future expansion to PostgreSQL or other production-ready databases.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │◄───►│   Backend   │◄───►│  Database   │
│  (React)    │     │  (Express)  │     │  (SQLite)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Frontend Architecture

The frontend uses a component-based architecture with modularity for each Llero module:

```
┌─────────────────────────────────────────────────────┐
│                    Components                       │
├─────────────┬─────────────┬─────────────┬──────────┤
│    Pages    │     UI      │   Layout    │  Shared  │
└─────────────┴─────────────┴─────────────┴──────────┘
        │              │             │
        ▼              ▼             ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│   Services  │  │   Store  │  │   Utilities  │
└─────────────┘  └──────────┘  └──────────────┘
```

### Key Frontend Concepts

- **Pages**: Dedicated views for each module (Forge, Barracks, Academy, etc.)
- **UI Components**: Reusable elements using Radix UI
- **Layout Components**: Global structure (navigation, theming)
- **Shared Components**: Common features like JSON editor, token manager, tool tester
- **Services**: API clients for interacting with backend routes
- **Store**: Zustand-based global and module-specific state management
- **Utilities**: Shared logic across modules (validation, formatting, etc.)

## Backend Architecture

The backend follows a service-oriented structure within Express:

```
┌─────────────────────────────────────────────┐
│                 Express App                 │
├─────────────┬────────────┬─────────────────┤
│ API Routes  │ Validation │ Database Access │
└─────────────┴────────────┴─────────────────┘
                     │
                     ▼
             ┌──────────────┐
             │   Database   │
             │   (SQLite)   │
             └──────────────┘
```

### Key Backend Concepts

- **API Routes**: Grouped by module (e.g., /forge/tools, /barracks/agents)
- **Validation**: JSON schema validation with Ajv
- **Database Access**: Modular DB operations for tools, agents, settings

## Data Model Overview

- **Tools**: Function-calling definitions
- **Agents (Lleros)**: Named configurations with assigned tools
- **APIs**: Integration settings and provider credentials
- **Logs**: Execution records and agent interactions
- **Sessions**: Command Center chat histories and context

## Communication Flow

1. User interacts with a module via the React frontend
2. API calls are issued to the Express backend
3. Backend performs validation, updates state, or queries database
4. Results are returned and visualized through the UI

## Technology Stack

### Frontend

- React with TypeScript
- Vite (build)
- Tailwind CSS
- Radix UI
- Zustand
- Framer Motion
- React Router

### Backend

- Node.js
- Express.js
- SQLite (development) with expansion plans for PostgreSQL
- Ajv
- Swagger UI for documentation

## Development Environment

- Git + GitHub
- ESLint + Prettier + TypeScript
- Jest + React Testing Library
- Docker (planned for production)

## Deployment Architecture

Llero is deployable in multiple environments:

1. **Development**: Single-node server with local SQLite
2. **Production**: Static frontend + scalable Node.js backend
3. **Self-hosted**: All-in-one instance, containerized or native

## Security Considerations

- Planned role-based access control for tools and agents
- Validation enforced on all incoming API payloads
- Minimal default permissions and clear separation of sensitive data
- Future support for OAuth token management and encryption
