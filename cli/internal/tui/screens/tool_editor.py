"""
Tool Editor screen for direct JSON editing of tool specifications.
"""

import os
import json
import logging
from textual.screen import ModalScreen
from textual.widgets import Button, Static, TextArea
from textual.containers import Container, Horizontal
from textual.binding import Binding
from textual.app import ComposeResult
from textual.widgets import DirectoryTree

from internal.tui.constants import TOOL_SPECS_DIR, TOOL_STORAGE_FILE
from internal.tui.dialogs.error import ErrorDialog
from internal.tui.dialogs.file import SaveFileDialog

# Configure logging
logger = logging.getLogger(__name__)

class ToolEditor(ModalScreen):
    """A modal screen for editing or creating tool specifications."""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
        Binding("f1", "save", "Save"),
    ]
    
    def __init__(self, filepath=None, content=None):
        super().__init__()
        self.filepath = filepath
        self.content = content
        self.is_new = filepath is None
        self.title = "Create New Tool" if self.is_new else f"Edit: {os.path.basename(filepath)}"
        logger.debug(f"ToolEditor initialized: filepath={filepath}, is_new={self.is_new}")

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
        logger.debug("Editing canceled")
        self.app.pop_screen()
    
    def action_save(self) -> None:
        """Save the tool specification and close the modal."""
        content = self.query_one("#tool-editor").text

        try:
            # Validate JSON
            json_content = json.loads(content)

            if self.is_new:
                # Save to the unified JSON file
                with open(TOOL_STORAGE_FILE, "r") as f:
                    tools = json.load(f)
                tools[json_content["function"]["name"]] = json_content
                with open(TOOL_STORAGE_FILE, "w") as f:
                    json.dump(tools, f, indent=2)
                logger.info("New tool saved successfully")
            else:
                # Update existing tool in the unified JSON file
                with open(TOOL_STORAGE_FILE, "r") as f:
                    tools = json.load(f)
                tools[json_content["function"]["name"]] = json_content
                with open(TOOL_STORAGE_FILE, "w") as f:
                    json.dump(tools, f, indent=2)
                logger.info(f"Tool updated successfully in {TOOL_STORAGE_FILE}")

            self.app.pop_screen()
        except json.JSONDecodeError as e:
            logger.error(f"JSON validation error: {e}")
            self.app.push_screen(
                ErrorDialog(f"Invalid JSON: {str(e)}. Please fix the errors before saving."),
                lambda _: None
            )
