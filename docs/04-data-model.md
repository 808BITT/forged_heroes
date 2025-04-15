# Data Model

## Overview

This document describes the core data models used in the Forge application. These models define how tool specifications and related data are structured both in the frontend application and in the SQLite database.

## Core Entities

### Tool

The primary entity in the system is the Tool, representing a specification for an LLM tool:

```typescript
interface Tool {
    id: string;                 // Unique identifier
    name: string;               // Display name of the tool
    description: string;        // Detailed description
    category: string;           // Category classification
    status: 'active' | 'inactive' | 'draft';  // Current status
    parameters: Parameter[];    // Array of parameters
    lastModified: string;       // ISO date string of last update
}
```

### Parameter

Each tool can have multiple parameters that define its inputs:

```typescript
interface Parameter {
    id: string;                 // Unique identifier
    name: string;               // Name of the parameter
    type: string;               // Data type (string, number, boolean, etc.)
    description: string;        // Description of the parameter
    required: boolean;          // Whether parameter is required
    
    // Additional type-specific properties
    format?: string;            // Format specification (e.g., date, email)
    enumValues?: string[];      // Array of allowed values for enum type
    minimum?: string;           // Minimum value for number types
    maximum?: string;           // Maximum value for number types
    default?: string;           // Default value
    
    // Complex type properties
    arrayItemType?: string;     // Type of array items
    arrayItemDescription?: string; // Description for array items
    objectProperties?: Record<string, any>; // Properties for object type
    
    // Conditional logic
    dependencies?: {
        conditions: Array<{
            id: string;
            paramId: string;    // Parameter this condition depends on
            operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
            value: string;      // Value to compare against
        }>;
        effect: 'required' | 'visible' | 'hidden'; // Effect when condition is met
    } | null;
}
```

### Category

Categories are used to organize tools:

```typescript
interface Category {
    id: string;                 // Unique identifier
    name: string;               // Category name
}
```

## Database Schema

The application uses SQLite for persistence with the following tables:

### Tools Table

```sql
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  parameters TEXT,     -- JSON serialized parameters array
  status TEXT,
  lastModified TEXT    -- ISO date string
)
```

### Categories Table

```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
)
```

## Data Transformations

### Database to Application

When retrieving data from the database:

1. Tool records are fetched from SQLite
2. The `parameters` field is parsed from JSON string to object
3. Data is transformed into Tool objects for use in the frontend

### Application to Database

When saving data to the database:

1. Parameter arrays are serialized to JSON strings
2. Tool objects are mapped to database columns
3. Data is stored in the SQLite database

## Tool Specification JSON Format

When exporting a tool for use with LLMs, it is formatted according to function calling standards:

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
        // Additional parameters
      },
      "required": ["param1"]
    }
  }
}
```

## State Management

In the frontend, tool data is managed using Zustand with the following state structure:

```typescript
interface ToolState {
    tools: Record<string, Tool>;  // Map of tools indexed by ID
    isLoaded: boolean;           // Whether tools have been loaded
    isLoading: boolean;          // Whether tools are currently loading
    error: string | null;        // Any error message
    
    // Actions
    getAllTools: () => Tool[];
    getToolById: (id: string) => Tool | undefined;
    addTool: (tool: Omit<Tool, 'id'>) => Promise<string>;
    updateTool: (id: string, tool: Partial<Tool>) => Promise<void>;
    deleteTool: (id: string) => Promise<void>;
    getStats: () => { totalTools: number; activeTools: number; recentlyUpdated: number };
    loadToolSpecifications: () => Promise<void>;
}
```

## Relationships

- Each **Tool** belongs to one **Category**
- Each **Tool** has many **Parameters**
- **Parameters** can have dependencies on other **Parameters** within the same tool
