# Architecture

## System Overview

Forge is built as a modern web application with a clean separation between frontend and backend components. The architecture follows a client-server model with a React-based frontend and an Express.js backend, using SQLite for data persistence.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │◄───►│   Backend   │◄───►│  Database   │
│   (React)   │     │  (Express)  │     │  (SQLite)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Frontend Architecture

The frontend is structured using a component-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                     Components                      │
├─────────────┬─────────────┬─────────────┬──────────┤
│    Pages    │     UI      │   Layout    │  Shared  │
└─────────────┴─────────────┴─────────────┴──────────┘
        │              │             │
        ▼              ▼             ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│   Services  │  │   Store  │  │   Utilities  │
└─────────────┘  └──────────┘  └──────────────┘
```

### Key Frontend Components

- **Pages**: Application views (Home, Dashboard, Tools, Documentation, etc.)
- **UI Components**: Reusable UI elements using Radix UI primitives
- **Layout Components**: Structure of the application (Navbar, Footer, etc.)
- **Shared Components**: Tool-specific components (ToolEditor, ParameterEditor, etc.)
- **Services**: API communication and data transformation
- **Store**: Global state management using Zustand
- **Utilities**: Helper functions and shared logic

## Backend Architecture

The backend follows a simple, modular structure:

```
┌─────────────────────────────────────────────┐
│                  Express App                │
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

### Key Backend Components

- **API Routes**: RESTful endpoints for tool and category management
- **Validation**: Request validation using Ajv
- **Database Access**: SQLite database operations

## Data Model

The primary data models include:

- **Tools**: Tool specifications with parameters
- **Categories**: Classification for tools

## Communication Flow

1. User interacts with the React frontend
2. Frontend services make API calls to the backend
3. Backend processes requests and interacts with the database
4. Data is returned to the frontend and rendered to the user

## Technology Stack

### Frontend

- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI for accessible components
- Zustand for state management
- Framer Motion for animations
- React Router for navigation

### Backend

- Node.js runtime
- Express.js framework
- SQLite database
- Ajv for JSON schema validation
- Swagger UI for API documentation

## Development Environment

- Git for version control
- npm for package management
- ESLint and TypeScript for code quality
- Jest for testing

## Deployment Architecture

The application can be deployed in various configurations:

1. **Development**: Local development server
2. **Production**: Static hosting for frontend + Node.js server for backend
3. **Self-hosted**: Complete stack on a single server

## Security Considerations

- Data is stored locally in SQLite
- No authentication is currently implemented (planned for future)
- Input validation on both client and server side
- Content security policies to prevent XSS
