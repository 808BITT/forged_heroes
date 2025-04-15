# Frequently Asked Questions

## General Questions

### What is Forge?

Forge is a modern web application for creating, managing, and sharing tool specifications for Large Language Models (LLMs). It provides an intuitive interface for building function calling specifications that can be used with LLMs like GPT-4 to give them access to external tools and APIs.

### Why would I use Forge?

If you're working with LLMs and want to extend their capabilities with custom tools, Forge makes it easy to define structured JSON tool specifications. These can be directly used in LLM prompts to enable models to request specific actions through function calling.

### Is Forge open source?

Yes, Forge is available under the MIT license.

## Technical Questions

### Can I use Forge offline?

Yes, Forge can be run entirely locally. Just follow the installation instructions in the README to set up the application on your local machine.

### What technologies does Forge use?

Forge is built with:

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express
- **Database**: SQLite
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Routing**: React Router

### Is Forge compatible with all LLMs?

Forge creates tool specifications that work with LLMs that support function calling, like GPT-4.

## Tool Creation

### How do I create a tool in Forge?

1. Navigate to the "Tools" page and click "New Tool"
2. Fill in the tool name and description
3. Add parameters by clicking "Add Parameter"
4. For each parameter, specify name, type, description, and whether it's required
5. Click "Save" to store your tool

### What parameter types can I use?

Forge supports various parameter types including:

- String
- Number
- Boolean
- Object
- Array
- Enum (selection from predefined values)

### Can I define dependencies between parameters?

Yes, you can create dependencies where the visibility or requirement of one parameter depends on the value of another parameter.

## Using Tool Specifications

### How do I export my tool specifications?

You can copy the JSON representation of your tool by clicking the "Copy" button in the tool editor.

### How do I test my tool specifications?

Use the "Test" button in the tool editor to test your tool against a mock LLM.

### What format are the tool specifications in?

Tool specifications follow the function calling JSON structure expected by LLMs:

```json
{
  "type": "function",
  "function": {
    "name": "example_tool",
    "description": "Example tool description",
    "parameters": {
      "type": "object",
      "properties": {
        "param1": {
          "type": "string",
          "description": "Example parameter"
        }
      },
      "required": ["param1"]
    }
  }
}
```

## Troubleshooting

### I'm getting database errors. What should I do?

If you're experiencing database issues, try:

1. Ensure the data directory exists
2. Check file permissions on the database file
3. Run the migration script using `node server/migrate-tools.js`

### How do I report a bug or suggest a feature?

Please submit issues on our GitHub repository or contact us via the Support page in the application.
