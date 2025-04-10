from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, Static, Button, TextArea
from textual.containers import Container, Horizontal
from textual.binding import Binding
from textual.screen import ModalScreen, Screen
from rich.syntax import Syntax
import os
import json
import logging

# Base directory for the application
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Unified JSON file for tool specifications
TOOL_STORAGE_FILE = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "data", "tools.json")

# Logger setup
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class ToolManager:
    def get_tools(self):
        """Retrieve all tools from the unified JSON file."""
        try:
            with open(TOOL_STORAGE_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error retrieving tools: {e}")
            return {}

    def get_tool(self, tool_id):
        """Retrieve a specific tool by ID."""
        tools = self.get_tools()
        return tools.get(tool_id)

    def save_tool(self, tool_id, tool_data):
        """Save or update a tool in the unified JSON file."""
        tools = self.get_tools()
        tools[tool_id] = tool_data
        try:
            with open(TOOL_STORAGE_FILE, "w") as f:
                json.dump(tools, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving tool {tool_id}: {e}")

    def delete_tool(self, tool_id):
        """Delete a tool from the unified JSON file."""
        tools = self.get_tools()
        if tool_id in tools:
            del tools[tool_id]
            try:
                with open(TOOL_STORAGE_FILE, "w") as f:
                    json.dump(tools, f, indent=2)
            except Exception as e:
                logger.error(f"Error deleting tool {tool_id}: {e}")

class ToolEditor(ModalScreen):
    """A modal screen for editing or creating tool specifications."""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
        Binding("f1", "save", "Save"),
    ]
    
    def __init__(self, tool_id=None, content=None):
        super().__init__()
        self.tool_id = tool_id
        self.content = content
        self.is_new = tool_id is None
        self.title = "Create New Tool" if self.is_new else f"Edit: {tool_id}"

    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.title, classes="editor-title"),
            TextArea(self.content or self.get_template(), language="json", id="tool-editor"),
            Horizontal(
                Button("Save", id="save-btn", variant="primary"),
                Button("Cancel", id="cancel-btn"),
                classes="editor-buttons"
            ),
            classes="editor-modal"
        )
        
    def get_template(self):
        """Return a template for a new tool specification."""
        return '''{
    "type": "function",
    "function": {
        "name": "tool_name",
        "description": "Tool description",
        "parameters": {
            "type": "object",
            "properties": {
                "param_name": {
                    "type": "string",
                    "description": "Parameter description"
                }
            },
            "required": ["param_name"]
        }
    }
}'''

    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "save-btn":
            self.action_save()
        elif button_id == "cancel-btn":
            self.action_cancel()
    
    def action_cancel(self) -> None:
        """Cancel editing and close the modal."""
        self.app.pop_screen()
    
    def action_save(self) -> None:
        """Save the tool specification and close the modal."""
        content = self.query_one("#tool-editor").text
        
        try:
            # Validate JSON
            json_content = json.loads(content)
            
            tool_manager = ToolManager()
            if self.is_new:
                # Generate a new tool ID
                tool_id = json_content["function"]["name"]
                tool_manager.save_tool(tool_id, json_content)
            else:
                tool_manager.save_tool(self.tool_id, json_content)
            
            self.app.pop_screen()
        except json.JSONDecodeError:
            self.app.push_screen(
                ErrorDialog("Invalid JSON. Please fix the errors before saving."),
                lambda _: None
            )

class DeleteConfirmDialog(ModalScreen):
    """Confirmation dialog for deleting tools."""
    
    def __init__(self, tool_id):
        super().__init__()
        self.tool_id = tool_id
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(f"Are you sure you want to delete {self.tool_id}?", classes="confirm-text"),
            Horizontal(
                Button("Delete", id="confirm-delete-btn", variant="error"),
                Button("Cancel", id="cancel-delete-btn"),
                classes="dialog-buttons"
            ),
            classes="confirm-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "confirm-delete-btn":
            try:
                tool_manager = ToolManager()
                tool_manager.delete_tool(self.tool_id)
                self.dismiss(True)
            except Exception as e:
                self.app.push_screen(
                    ErrorDialog(f"Error deleting tool: {e}"),
                    lambda _: None
                )
        elif button_id == "cancel-delete-btn":
            self.dismiss(False)

class ErrorDialog(ModalScreen):
    """A simple error dialog."""
    
    def __init__(self, message):
        super().__init__()
        self.message = message
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.message, classes="error-text"),
            Button("OK", id="error-ok-btn"),
            classes="error-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "error-ok-btn":
            self.dismiss(True)

class HelpScreen(Screen):
    """Help screen with keybindings and usage information."""
    
    BINDINGS = [
        Binding("escape", "app.pop_screen", "Go Back"),
    ]
    
    def compose(self) -> ComposeResult:
        help_text = """
# Forged Heroes Tool Manager

## Keybindings
- F1: Create a new tool specification
- F2: Edit the selected tool specification
- F3: Delete the selected tool specification
- F4: View the selected tool specification
- F5: Refresh the tool list
- F10: Show this help
- Escape: Close dialogs or help screen

## Tool Specifications
Tools are stored in the `data/tools.json` file.
Each tool is a JSON object with a specific structure.
"""
        yield Container(
            Static(help_text, markup=True),
            classes="help-container"
        )

class Tui(App):
    """A TUI application for managing tool specifications."""
    
    TITLE = "Forged Heroes: Tool Manager"
    SUB_TITLE = "Create, Edit, and Delete Tools for your Heroes"
    CSS_PATH = "tui.css"
    
    BINDINGS = [
        Binding("f1", "new_tool", "New Tool"),
        Binding("f2", "edit_tool", "Edit Tool"),
        Binding("f3", "delete_tool", "Delete Tool"),
        Binding("f4", "view_tool", "View Tool"),
        Binding("f5", "refresh", "Refresh"),
        Binding("f10", "help", "Help"),
        Binding("q", "quit", "Quit"),
    ]
    
    def __init__(self):
        super().__init__()
        self.running = True
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(TOOL_STORAGE_FILE), exist_ok=True)
        # Initialize the tools.json file if it doesn't exist
        if not os.path.exists(TOOL_STORAGE_FILE):
            with open(TOOL_STORAGE_FILE, "w") as f:
                json.dump({}, f)
        
    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        yield Container(
            Static("Select a tool specification to view", id="preview-title"),
            Static("", id="preview-content"),
            id="preview-container"
        )
        yield Footer()
        
    def on_mount(self) -> None:
        """Event handler called when the app is mounted."""
        self.refresh_tools()
        
    def action_new_tool(self) -> None:
        """Create a new tool specification."""
        self.push_screen(ToolEditor())
        
    def action_edit_tool(self) -> None:
        """Edit the selected tool specification."""
        tool_id = self.get_selected_tool_id()
        
        if not tool_id:
            self.push_screen(
                ErrorDialog("Please select a tool specification to edit."),
                lambda _: None
            )
            return
            
        tool_manager = ToolManager()
        tool_data = tool_manager.get_tool(tool_id)
        
        if not tool_data:
            self.push_screen(
                ErrorDialog("The selected tool does not exist."),
                lambda _: None
            )
            return
            
        self.push_screen(ToolEditor(tool_id, json.dumps(tool_data, indent=2)))
            
    def action_delete_tool(self) -> None:
        """Delete the selected tool specification."""
        tool_id = self.get_selected_tool_id()
        
        if not tool_id:
            self.push_screen(
                ErrorDialog("Please select a tool specification to delete."),
                lambda _: None
            )
            return
            
        self.push_screen(DeleteConfirmDialog(tool_id))
        
    def action_view_tool(self) -> None:
        """View the selected tool specification."""
        tool_id = self.get_selected_tool_id()
        
        if not tool_id:
            return
            
        tool_manager = ToolManager()
        tool_data = tool_manager.get_tool(tool_id)
        
        if not tool_data:
            self.query_one("#preview-title").update("Error")
            self.query_one("#preview-content").update(f"Tool {tool_id} does not exist.")
            return
            
        # Format the JSON for display
        formatted_json = json.dumps(tool_data, indent=2)
        syntax = Syntax(formatted_json, "json", theme="monokai", line_numbers=True)
        
        # Update the preview
        self.query_one("#preview-title").update(f"Tool: {tool_id}")
        self.query_one("#preview-content").update(syntax)
            
    def action_refresh(self) -> None:
        """Refresh the tool list."""
        self.refresh_tools()
        
    def action_help(self) -> None:
        """Show the help screen."""
        self.push_screen(HelpScreen())
        
    def action_quit(self) -> None:
        """Quit the application."""
        self.stop()
        
    def refresh_tools(self):
        """Refresh the tool list."""
        tool_manager = ToolManager()
        tools = tool_manager.get_tools()
        # Update the preview with the list of tools
        tool_list = "\n".join(tools.keys())
        self.query_one("#preview-title").update("Available Tools")
        self.query_one("#preview-content").update(tool_list)
        
    def get_selected_tool_id(self):
        """Get the selected tool ID."""
        # Placeholder for actual selection logic
        return None

    def start(self):
        """Start the TUI application."""
        self.run()

    def stop(self):
        """Stop the TUI application."""
        self.running = False
        self.exit()
