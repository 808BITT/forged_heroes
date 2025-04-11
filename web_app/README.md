# Forge: LLM Tool Specification Builder

![Forge Logo](public/forge-logo.svg)

Forge is a modern web application for creating, managing, and sharing tool specifications for Large Language Models (LLMs). It provides an intuitive interface for building function calling specifications that can be used with LLMs like GPT-4 to give them access to external tools and APIs.

## Purpose

Equip your "LLM Heroes" with powerful tools! Forge makes it easy to define structured JSON tool specifications that can be copy-pasted into LLM prompts, enabling models to request specific actions through function calling.

## Features

- **Visual Tool Editor**: Create and edit tool specifications with an intuitive UI
- **Parameter Management**: Define tool parameters with type validation and descriptions
- **JSON Generation**: Automatically convert your tool definitions to proper JSON format
- **Tool Organization**: Categorize tools and search through your collection
- **The Armory**: Interactive visualization of tool schemas with fluid animations and category-based exploration
- **API Backend**: Store tools persistently on a server for sharing and reuse
- **Responsive Design**: Works on desktop and mobile devices
- **Tool Testing**: Test your tool specifications against a mock LLM to ensure they function as expected
- **Parameter Dependencies**: Define dependencies between parameters, so that the visibility and requirements of one parameter can depend on the value of another.

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Zustand, Radix UI
- **Backend**: Node.js, Express (under development)
- **Styling**: TailwindCSS with Radix UI components
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js v18+ and npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/forge.git
   cd forge/web_app
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

### Running the Application

1. Start the frontend development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:

   ```
   http://localhost:5173
   ```

## Usage Guide

### Creating a Tool

1. Navigate to the "Tools" page and click "New Tool"
2. Fill in the tool name and description
3. Add parameters by clicking "Add Parameter"
4. For each parameter, specify:
   - Name
   - Type (string, number, boolean, object, array)
   - Description
   - Whether it's required
   - Define dependencies on other parameters, if needed
5. Click "Save" to store your tool
6. Use the "Copy" button to copy the JSON specification for use with an LLM
7. Use the "Test" button to test your tool against a mock LLM

### Using the Armory

The Armory provides an interactive, visually engaging way to explore your tool collection:

1. Access the Armory by clicking "Armory" in the navigation bar or "Enter the Armory" on the Tools page
2. Browse tools by category in the three-panel interface:
   - Left panel: Select a tool category
   - Middle panel: Choose a specific tool from the selected category
   - Right panel: View detailed parameter information for the selected tool
3. Enjoy the fluid animations and interactive elements:
   - Green indicators highlight required parameters
   - Gray indicators show optional parameters
   - Hover effects provide additional context and visual feedback

### Example Tool JSON

```json
{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get current weather for a specified location",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City name or address"
        },
        "units": {
          "type": "string",
          "description": "Temperature units (celsius or fahrenheit)"
        }
      },
      "required": ["location"]
    }
  }
}
```

## Project Structure

```
web_app/
├── public/              # Static assets
├── server/              # Backend API server (under development)
│   ├── data/            # Tool storage
│   └── server.js        # Express server
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # UI components (Radix UI)
│   │   └── layout/      # Layout components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Zustand state management
│   └── lib/             # Utility functions
└── package.json         # Project dependencies
```

## Future Enhancements

- User authentication and profiles
- Sharing tools between users
- Tool versioning and history
- Integration with popular LLM platforms
- Enhanced tool testing and validation features
- More sophisticated parameter dependency options
- Backend API implementation

## License

MIT
