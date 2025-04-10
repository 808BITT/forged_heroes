# Forged Heroes CLI Version

## Overview

The CLI version of Forged Heroes is a Python-based tool framework with a text user interface (TUI) for interactive tool management and execution. It provides a flexible framework for defining, managing, and executing tools with standardized parameter schemas.

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

1. Clone the repository:
   ```bash
   git clone https://github.com/808BiTT/forged_heroes.git
   cd forged_heroes/cli
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

## Usage

Run the main application:
```bash
python main.py
```

This will start the Forged Heroes application with the TUI interface.

## Development

### Running Tests

Run all tests:
```bash
python run_tests.py
```

Run specific test files:
```bash
python -m unittest internal/tool/test_tool_initialization.py
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

## Project Structure

```
cli/
├── main.py                  # Application entry point
├── internal/                # Core application code
│   ├── tui/                 # Text UI implementation
│   │   ├── app.py           # Main TUI application
│   │   ├── constants.py     # Shared constants
│   │   ├── style.css        # TUI styling
│   │   ├── screens/         # Screen components
│   │   └── dialogs/         # Dialog components
│   └── tool/                # Tool framework
│       ├── parameter.py     # Parameter schema definitions
│       ├── property.py      # Tool property definitions
│       └── tool.py          # Core tool class
├── scripts/                 # Utility scripts
└── tool_specs/              # Tool specification files
```

## Troubleshooting

If you encounter issues, ensure all dependencies are installed and the Python version is 3.10 or higher. For detailed troubleshooting steps, refer to the main README.