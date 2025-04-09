"""
Main Application module for the Forged Heroes TUI.
"""

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, DirectoryTree, Static
from textual.containers import Container
from textual.binding import Binding

import os
import json

from rich.syntax import Syntax

# Import screens and dialogs
from internal.tui.screens.tool_wizard import ToolWizard
from internal.tui.screens.help import HelpScreen
from internal.tui.dialogs.error import ErrorDialog
from internal.tui.dialogs.confirm import DeleteConfirmDialog
from internal.tui.constants import TOOL_SPECS_DIR

class Tui(App):
    """A TUI application for managing tool specifications."""
    
    TITLE = "Forged Heroes: Tool Manager"
    SUB_TITLE = "Create, Edit, and Delete Tools for your Heroes"
    CSS_PATH = "internal/tui/style.css"
    
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
        # Create tool_specs directory if it doesn't exist
        os.makedirs(TOOL_SPECS_DIR, exist_ok=True)
        
    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        yield Container(
            DirectoryTree(TOOL_SPECS_DIR, id="file-tree"),
            Container(
                Static("Select a tool specification to view", id="preview-title"),
                Static("", id="preview-content"),
                id="preview-container"
            ),
            id="main-container"
        )
        yield Footer()
        
    def on_mount(self) -> None:
        """Event handler called when the app is mounted."""
        # Focus on the directory tree initially
        self.query_one(DirectoryTree).focus()
        
    def action_new_tool(self) -> None:
        """Create a new tool specification."""
        self.push_screen(ToolWizard())
        
    def action_edit_tool(self) -> None:
        """Edit the selected tool specification."""
        tree = self.query_one(DirectoryTree)
        node = tree.cursor_node
        
        if node is None:
            self.push_screen(
                ErrorDialog("Please select a tool specification file to edit."),
                lambda _: None
            )
            return
            
        filepath = str(node.data.path)
        if not os.path.isfile(filepath) or not filepath.endswith(".json"):
            self.push_screen(
                ErrorDialog("Only JSON files can be edited."),
                lambda _: None
            )
            return
            
        try:
            with open(filepath, "r") as f:
                content = f.read()
                json_data = json.loads(content)
            self.push_screen(ToolWizard(filepath, json_data))
        except json.JSONDecodeError:
            self.push_screen(
                ErrorDialog("The selected file contains invalid JSON."),
                lambda _: None
            )
        except Exception as e:
            self.push_screen(
                ErrorDialog(f"Error opening file: {e}"),
                lambda _: None
            )
            
    def action_delete_tool(self) -> None:
        """Delete the selected tool specification."""
        tree = self.query_one(DirectoryTree)
        node = tree.cursor_node
        
        if node is None:
            self.push_screen(
                ErrorDialog("Please select a tool specification file to delete."),
                lambda _: None
            )
            return
            
        filepath = str(node.data.path)
        if not os.path.isfile(filepath) or not filepath.endswith(".json"):
            self.push_screen(
                ErrorDialog("Only JSON files can be deleted."),
                lambda _: None
            )
            return
            
        self.push_screen(DeleteConfirmDialog(filepath))
        
    def action_view_tool(self) -> None:
        """View the selected tool specification."""
        tree = self.query_one(DirectoryTree)
        node = tree.cursor_node
        
        if node is None:
            return
            
        filepath = str(node.data.path)
        if not os.path.isfile(filepath) or not filepath.endswith(".json"):
            return
            
        try:
            with open(filepath, "r") as f:
                content = f.read()
                
            # Format the JSON for display
            try:
                json_obj = json.loads(content)
                formatted_json = json.dumps(json_obj, indent=2)
                syntax = Syntax(formatted_json, "json", theme="monokai", line_numbers=True)
                
                # Update the preview
                self.query_one("#preview-title").update(f"File: {os.path.basename(filepath)}")
                self.query_one("#preview-content").update(syntax)
            except json.JSONDecodeError:
                # If JSON is invalid, just show as raw text
                self.query_one("#preview-title").update(f"File: {os.path.basename(filepath)} (Invalid JSON)")
                self.query_one("#preview-content").update(content)
        except Exception as e:
            self.query_one("#preview-title").update("Error")
            self.query_one("#preview-content").update(f"Error reading file: {e}")
            
    def action_refresh(self) -> None:
        """Refresh the file list."""
        self.query_one(DirectoryTree).reload()
        
    def action_help(self) -> None:
        """Show the help screen."""
        self.push_screen(HelpScreen())
        
    def action_quit(self) -> None:
        """Quit the application."""
        self.stop()
        
    def on_directory_tree_file_selected(self, event):
        """Handler for file selection event."""
        self.action_view_tool()

    def start(self):
        """Start the TUI application."""
        self.run()

    def stop(self):
        """Stop the TUI application."""
        self.running = False
        self.exit()