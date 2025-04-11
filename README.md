# Forged Heroes

This repository contains two versions of the Forged Heroes tool framework:

1. **CLI Version**: A Python-based tool framework with a text user interface (TUI) for interactive tool management and execution.
2. **Web Application Version**: A modern web application for creating, managing, and sharing tool specifications for Large Language Models (LLMs).

## Overview

### CLI Version

The CLI version is located in the `cli/` directory. It provides a TUI for defining, managing, and executing tools with standardized parameter schemas. This version is ideal for users who prefer a terminal-based interface.

For more details, refer to the [CLI README](./cli/README.md).

### Web Application Version

The web application version is located in the `web_app/` directory. It offers a graphical interface for creating and managing tool specifications, with features like JSON generation and parameter validation.

#### Key Features

- **Tool Management**: Create, edit, and delete tool specifications
- **Parameter Validation**: Define and validate parameters with different types
- **JSON Generation**: Export tool specifications as JSON
- **The Armory**: Interactive visualization of tool schemas with fluid animations and category-based exploration

For more details, refer to the [Web App README](./web_app/README.md).

## Getting Started

### Prerequisites

- For the CLI version: Python 3.10 or higher
- For the Web App version: Node.js v18+ and npm

### Installation

#### CLI Version

1. Navigate to the `cli/` directory:

   ```bash
   cd cli
   ```

2. Set up a virtual environment (optional but recommended):

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

#### Web Application Version

1. Navigate to the `web_app/` directory:

   ```bash
   cd web_app
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Install backend dependencies:

   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Applications

#### CLI Version

Run the main application:

```bash
python main.py
```

#### Web Application Version

1. Start the backend server:

   ```bash
   cd web_app/server
   node server.js
   ```

2. In a new terminal, start the frontend development server:

   ```bash
   cd web_app
   npm run dev
   ```

3. Open your browser and navigate to:

   ```
   http://localhost:5173
   ```

## New Features in v0.0.2

### CLI Version

#### Enhanced Parameter Management

The `cli_tui/tool_editor.go` file now includes enhanced parameter management features, such as support for parameter dependencies, array item configuration, and object properties.

#### Improved Tool List and Editor Views

The `cli_tui/main.go` and `cli_tui/tool_list.go` files have been updated to provide better handling of tool saving, editing, and parameter management.

#### Additional Metadata and Validation for Parameters

The `cli_tui/models.go` file has been updated to include additional metadata and validation for parameters.

### Web Application Version

#### New API Endpoints

The `web_app/server/server.js` file now includes new API endpoints for parsing function signatures and generating descriptions.

#### Enhanced Tool Editor

The `web_app/src/components/ToolEditor.tsx` file has been updated to support advanced parameter types and dependencies.

#### New Armory Page

The `web_app/src/pages/ArmoryPage.tsx` file introduces a new Armory page for interactive visualization of tool schemas.

#### Improved Tool Management and Testing Features

The `web_app/src/services/apiService.ts` and `web_app/src/services/toolSpecService.ts` files have been updated to provide improved tool management and testing features.
