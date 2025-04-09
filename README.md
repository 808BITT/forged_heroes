# Forged Heroes

A Python-based tool framework with a text user interface (TUI) for interactive tool management and execution.

## Overview

Forged Heroes provides a flexible framework for defining, managing, and executing tools with standardized parameter schemas. The project focuses on creating a consistent interface for tools while maintaining modularity and extensibility.

## Features

- Standardized tool definition format
- Parameter validation using schema-based approach
- Interactive text user interface with guided tool creation wizard
- Modular architecture for easy extension
- Comprehensive test suite
- User-friendly folder and file management

## Installation

### Prerequisites

- Python 3.10 or higher

### Setup 

1. Clone the repository
   ```bash
   git clone https://github.com/808BiTT/forged_heroes.git
   cd forged_heroes
   ```

2. Set up a virtual environment (optional but recommended)
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the main application:

```bash
python main.py
```

This will start the Forged Heroes application with the TUI interface.

## Project Structure

```
forged_heroes/
├── main.py                  # Application entry point
├── internal/                # Core application code
│   ├── tui/                 # Text UI implementation
│   │   ├── __init__.py      # Package initialization
│   │   ├── app.py           # Main TUI application
│   │   ├── constants.py     # Shared constants
│   │   ├── style.css        # TUI styling
│   │   ├── screens/         # Screen components
│   │   │   ├── help.py      # Help screen
│   │   │   ├── property_editor.py  # Property editor
│   │   │   └── tool_wizard.py      # Tool wizard
│   │   └── dialogs/         # Dialog components
│   │       ├── confirm.py   # Confirmation dialogs
│   │       ├── error.py     # Error dialogs
│   │       └── file.py      # File-related dialogs
│   └── tool/                # Tool framework
│       ├── parameter.py     # Parameter schema definitions
│       ├── property.py      # Tool property definitions
│       └── tool.py          # Core tool class
├── scripts/                 # Utility scripts
└── tool_specs/              # Tool specification files
    └── cli/                 # CLI tool specifications
```

## Architecture

### Overview

Forged Heroes is built with a modular architecture that separates concerns into distinct components:

1. **Tool Framework**: Core classes for defining tools and their parameters
2. **User Interface**: TUI layer for user interaction, organized into screens and dialogs
3. **Tool Specifications**: External definition of tools

### Tool Framework

The Tool framework consists of three main classes:

- **Tool**: Represents an executable tool with a name, description, and parameters
- **ToolParams**: Defines the schema for tool parameters
- **ToolProperty**: Defines individual parameters with types, descriptions, and validation

This design follows a schema-based approach similar to JSON Schema, allowing for robust parameter validation and documentation.

#### Relationship Diagram

```
Tool
 |
 +-- ToolParams
      |
      +-- ToolProperty(s)
```

### TUI Architecture

The TUI module is organized into a hierarchical structure of components:

- **App**: Core application controller (Tui class)
- **Screens**: Full-screen interfaces for different functions
  - Tool Wizard for creating/editing tools
  - Help screen for user guidance
- **Dialogs**: Modal interfaces for specific actions
  - Error dialog for displaying error messages
  - Confirmation dialog for confirming actions
  - File dialogs for saving files and creating folders

### Execution Flow

1. Tools are defined either programmatically or via specification files
2. The TUI loads and presents tools to the user
3. User selects a tool and provides parameters through the wizard interface
4. Parameters are validated against the tool's schema
5. Tool execution is handled with validated parameters

### Future Architecture Plans

- **Plugin System**: Support for dynamically loading tools from plugins
- **Session Management**: Save and restore tool sessions
- **Remote Execution**: Execute tools on remote systems
- **Output Processing**: Process and transform tool outputs

## Development

### Running Tests

```bash
python run_tests.py
```

Or run specific test files:

```bash
python -m unittest internal/tool/test_tool_initialization.py
```

### Troubleshooting Failing Tests

If tests are failing:

1. Ensure all dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

2. Verify the Python version is 3.10 or higher:
   ```bash
   python --version
   ```

3. Check for missing or outdated test cases. Add tests for any uncovered functionality.

4. Run tests with verbose output to identify specific failures:
   ```bash
   python -m unittest discover internal -v
   ```

5. Debug failing tests by inspecting the code and adding print statements or breakpoints.

### Creating Tests for TUI Components

Each TUI component is designed to be testable in isolation. To create tests for a specific component:

```python
from textual.app import App
from textual.widgets import Button
from internal.tui.dialogs.error import ErrorDialog
import pytest

# Example test for ErrorDialog
def test_error_dialog_dismiss_on_ok():
    # Test setup
    app = App()
    dialog = ErrorDialog("Test error message")
    
    # Simulate button press
    dialog._on_button_pressed(Button.Pressed(Button(id="error-ok-btn")))
    
    # Assert dialog was dismissed
    assert dialog._dismissed
```

### Adding New Tools

Tools can be added by:

1. Creating a new tool specification in `tool_specs/`
2. Using the TUI wizard interface for guided creation
3. Programmatically creating a tool using the Tool class

Example:

```python
from internal.tool.tool import Tool
from internal.tool.parameter import ToolParams, ToolProperty

# Create a new tool
weather_tool = Tool(
    name="get_weather",
    description="Get the current weather for a location"
)

# Add parameters
weather_tool.parameters.add_property(
    "location",
    ToolProperty(
        name="location",
        type="string",
        description="The location to get weather for",
        required=True
    )
)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Insert your license here]

## Acknowledgments

[Any acknowledgments you want to include]