# API Reference

## Overview

This document outlines all available API endpoints for the Forge application. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

All API endpoints are relative to: `http://localhost:3001`

## Authentication

Currently, the API does not require authentication. Authentication features are planned for future releases.

## Tools Endpoints

### Get All Tools

Retrieves a list of all tools.

- **URL:** `/api/tools`
- **Method:** `GET`
- **Response:**

  ```json
  [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string",
      "parameters": [],
      "status": "string",
      "lastModified": "string"
    }
  ]
  ```

### Get Tool by ID

Retrieves a specific tool by its ID.

- **URL:** `/api/tools/:id`
- **Method:** `GET`
- **URL Parameters:**
  - `id`: The unique identifier of the tool
- **Response:**

  ```json
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "parameters": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "description": "string",
        "required": boolean,
        "format": "string",
        "enumValues": [],
        "minimum": "string",
        "maximum": "string",
        "default": "string",
        "arrayItemType": "string",
        "arrayItemDescription": "string",
        "objectProperties": {},
        "dependencies": null
      }
    ],
    "status": "string",
    "lastModified": "string"
  }
  ```

### Create Tool

Creates a new tool.

- **URL:** `/api/tools`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "name": "string",
    "description": "string",
    "category": "string",
    "parameters": [
      {
        "id": "string",
        "name": "string",
        "type": "string",
        "description": "string",
        "required": boolean,
        "format": "string",
        "enumValues": [],
        "minimum": "string",
        "maximum": "string",
        "default": "string",
        "arrayItemType": "string",
        "arrayItemDescription": "string",
        "objectProperties": {},
        "dependencies": null
      }
    ],
    "status": "string"
  }
  ```

- **Response:** The created tool object with a generated ID

### Update Tool

Updates an existing tool.

- **URL:** `/api/tools/:id`
- **Method:** `PUT`
- **URL Parameters:**
  - `id`: The unique identifier of the tool
- **Request Body:** Same as create tool
- **Response:** The updated tool object

### Delete Tool

Deletes a tool.

- **URL:** `/api/tools/:id`
- **Method:** `DELETE`
- **URL Parameters:**
  - `id`: The unique identifier of the tool
- **Response:** Status code 204 (No Content) on success

## Categories Endpoints

### Get All Categories

Retrieves all available categories.

- **URL:** `/api/categories`
- **Method:** `GET`
- **Response:**

  ```json
  [
    {
      "id": "string",
      "name": "string"
    }
  ]
  ```

### Create Category

Creates a new category.

- **URL:** `/api/categories`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "name": "string"
  }
  ```

- **Response:**

  ```json
  {
    "id": "string",
    "name": "string"
  }
  ```

### Delete Category

Deletes a category.

- **URL:** `/api/categories/:id`
- **Method:** `DELETE`
- **URL Parameters:**
  - `id`: The unique identifier of the category
- **Response:** Status code 200 on success

## Tool Testing & Functionality

### Parse Function Signature

Parses a function signature string into structured data.

- **URL:** `/api/parseFunctionSignature`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "signature": "string"
  }
  ```

- **Response:** Parsed function data

### Generate Description

Generates a description for a tool based on its function signature.

- **URL:** `/api/generateDescription`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "signature": "string"
  }
  ```

- **Response:**

  ```json
  {
    "description": "string"
  }
  ```

### Test Tool

Tests a tool specification with sample input data.

- **URL:** `/api/test-tool`
- **Method:** `POST`
- **Request Body:**

  ```json
  {
    "toolSpec": {
      "type": "function",
      "function": {
        "name": "string",
        "description": "string",
        "parameters": {
          "type": "object",
          "properties": {},
          "required": []
        }
      }
    },
    "testInput": {}
  }
  ```

- **Response:**

  ```json
  {
    "success": boolean,
    "message": "string",
    "result": {},
    "validationErrors": []
  }
  ```

## Error Responses

API error responses will generally follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request (validation error)
- 404: Not Found
- 409: Conflict (e.g., duplicate category)
- 500: Internal Server Error

## Tool Schema

Tools in Forge follow this schema:

```typescript
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
  lastModified: string; // ISO date string
}
```
