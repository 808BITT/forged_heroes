# User Guide

## Introduction

Welcome to the Forge User Guide. This document provides comprehensive instructions on how to use the Forge application to create, manage, and test tool specifications for Large Language Models (LLMs).

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/forge.git
   cd forge
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. In a separate terminal, start the backend:

   ```bash
   cd server
   npm install
   node server.js
   ```

5. Open your browser and navigate to:

   ```
   http://localhost:5173
   ```

## Application Overview

Forge consists of several main sections:

- **Dashboard**: Overview of your tools and recent activity
- **Tools Page**: List and manage all your tool specifications
- **Tool Editor**: Create and edit tool specifications
- **Armory**: Visual explorer for tool specifications
- **Tool Tester**: Test your tools against a mock LLM

## Creating Your First Tool

### Basic Tool Creation

1. Navigate to the Tools page by clicking "Tools" in the navigation bar
2. Click the "New Tool" button
3. Fill in the required fields:
   - **Name**: A clear, descriptive name for your tool
   - **Description**: Explain what the tool does
   - **Category**: Select from existing categories or create a new one

### Adding Parameters

Parameters define the inputs your tool accepts:

1. In the tool editor, click "Add Parameter"
2. For each parameter, specify:
   - **Name**: Parameter name (camelCase recommended)
   - **Type**: Data type (string, number, boolean, object, array, enum)
   - **Description**: Clear explanation of the parameter's purpose
   - **Required**: Toggle whether the parameter is required

3. Click "Add Parameter" again to add more parameters as needed

### Parameter Types

Forge supports various parameter types, each with specific configuration options:

#### String Parameters

- **Format**: Optional format specifier (email, date, uri, etc.)
- **Default Value**: Optional default value

#### Number Parameters

- **Minimum**: Optional minimum value
- **Maximum**: Optional maximum value
- **Default**: Optional default value

#### Enum Parameters

- **Enum Values**: List of allowed values (one per line)
- **Default**: Optional default selected value

#### Array Parameters

- **Array Item Type**: Data type of array items
- **Array Item Description**: Description of what the array contains

#### Object Parameters

- **Object Properties**: JSON structure defining the object's properties

### Parameter Dependencies

You can create dependencies between parameters:

1. Select a parameter to add dependencies to
2. Click "Add Dependency"
3. Configure the dependency:
   - **Source Parameter**: Parameter this dependency relies on
   - **Condition**: Operator (equals, not equals, contains, etc.)
   - **Value**: Value to compare against
   - **Effect**: What happens when condition is met (required, visible, hidden)

4. Add multiple conditions if needed

## Managing Tools

### Organizing Tools

- **Categories**: Group tools by functionality or domain
- **Search**: Use the search bar to find tools by name or description
- **Sort**: Sort tools by name, category, or modification date

### Tool Operations

- **Edit**: Click on a tool to edit its properties and parameters
- **Delete**: Use the delete button to remove a tool (confirmation required)
- **Test**: Click the test button to try out your tool
- **Copy JSON**: Copy the JSON representation for use with LLMs

## The Armory

The Armory provides an interactive visualization of your tools:

1. Access the Armory by clicking "Armory" in the navigation bar
2. The left panel shows tool categories
3. The middle panel shows tools within the selected category
4. The right panel shows details of the selected tool
5. Explore the 3D visualization to see relationships between tools

## Testing Tools

Test your tool specifications to ensure they work correctly:

1. In the tool editor, click the "Test" button
2. Enter test values for each parameter
3. Click "Run Test" to see how an LLM would interact with your tool
4. Review the results and validation messages

## Importing and Exporting

### Exporting Tools

1. Open the tool you want to export
2. Click the "Copy" button to copy the JSON to clipboard
3. Paste the JSON into your LLM prompt or save to a file

### Importing Tools

1. Go to the Tools page
2. Click "Import Tool"
3. Paste the JSON specification
4. Click "Import" to add the tool to your collection

## Category Management

Manage categories to organize your tools:

1. Go to the Tools page
2. Click "Manage Categories"
3. Add new categories or delete existing ones
4. Assign tools to categories in the tool editor

## Advanced Features

### Tool JSON Format

The tool specification follows this structure:

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
        },
        "param2": {
          "type": "number",
          "description": "Another parameter"
        }
      },
      "required": ["param1"]
    }
  }
}
```

### Parameter Dependencies

Dependencies allow for dynamic behavior based on other parameter values:

```json
{
  "dependencyMap": {
    "param2": {
      "conditions": [
        {
          "sourceParam": "param1",
          "operator": "equals",
          "value": "specific_value"
        }
      ],
      "effect": "required"
    }
  }
}
```

## Troubleshooting

### Common Issues and Solutions

- **Tool Not Saving**: Ensure all required fields are completed
- **Database Errors**: Check database path and permissions
- **Parameter Dependencies Not Working**: Verify condition logic and source parameters

### Getting Help

If you encounter issues:

1. Check the FAQ section in the application
2. Visit the Support page for contact information
3. Submit an issue on the GitHub repository
4. Check the console for error messages

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Tool | Ctrl+S / Cmd+S |
| Add Parameter | Ctrl+Shift+P / Cmd+Shift+P |
| Copy JSON | Ctrl+Shift+C / Cmd+Shift+C |
| Test Tool | Ctrl+T / Cmd+T |

## Best Practices

### Naming Conventions

- **Tool Names**: Clear, descriptive names (e.g., "fetchWeatherData" not "tool1")
- **Parameter Names**: camelCase, descriptive (e.g., "cityName" not "param1")
- **Descriptions**: Concise but comprehensive explanations

### Parameter Design

- Include reasonable default values where applicable
- Use validation constraints (min, max, enum) to prevent invalid inputs
- Order parameters from most important to least important
- Group related parameters for better organization

### Tool Organization

- Create specific categories for different tool domains
- Keep similar tools consistent in their parameter naming
- Document any special usage instructions in the tool description
