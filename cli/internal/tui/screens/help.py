"""
Help screen for displaying application usage information.
"""

from textual.screen import Screen
from textual.widgets import Static
from textual.containers import Container
from textual.app import ComposeResult
from textual.binding import Binding

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
- F5: Refresh the file list
- F10: Show this help
- Escape: Close dialogs or help screen

## Navigation
- Use arrow keys to navigate the file list
- Enter to select a tool specification for viewing

## Tool Specifications
Tools are stored in the `tool_specs` directory and are organized by folders.
Each tool is a JSON file with a specific structure.
"""
        yield Container(
            Static(help_text, markup=True),
            classes="help-container"
        )