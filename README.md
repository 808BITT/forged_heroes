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
