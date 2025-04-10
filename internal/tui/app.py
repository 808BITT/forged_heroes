"""
Main Application module for the Forged Heroes TUI.
"""

import os
import json
import logging
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, DirectoryTree, Static, Label
from textual.containers import Container
from textual.binding import Binding

from internal.tui.constants import TOOL_SPECS_DIR, CSS_PATH
from internal.tui.screens.tool_wizard import ToolWizard
from internal.tui.screens.help import HelpScreen
from internal.tui.screens.tool_editor import ToolEditor
from internal.tui.dialogs.error import ErrorDialog
from internal.tui.dialogs.confirm import DeleteConfirmDialog
from internal.tui.utils.error_handler import handle_errors
from internal.tui.tools.tool_manager import ToolManager

logger = logging.getLogger(__name__)

class Tui(App):
    """A TUI application for managing tool specifications."""
    
    TITLE = "Forged Heroes: Tool Manager"
    SUB_TITLE = "Create, Edit, and Delete Tools for your Heroes"
    CSS_PATH = CSS_PATH
    
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
        self.tool_manager = ToolManager(TOOL_SPECS_DIR)
        
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
        logger.info("Application UI mounted")
    
    @handle_errors(show_dialog=True)
    def action_new_tool(self) -> None:
        """Create a new tool specification."""
        logger.info("Creating new tool")
        self.push_screen(ToolWizard())
    
    @handle_errors(show_dialog=True)
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
            logger.info(f"Editing tool: {filepath}")
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
    
    @handle_errors(show_dialog=True)
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
            
        logger.info(f"Confirming deletion of: {filepath}")
        self.push_screen(DeleteConfirmDialog(filepath))
    
    @handle_errors(show_dialog=False)
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
                
            # Get formatted content from tool manager
            formatted_content = self.tool_manager.format_tool_content(content)
            
            # Update the preview
            self.query_one("#preview-title").update(f"File: {os.path.basename(filepath)}")
            self.query_one("#preview-content").update(formatted_content)
            logger.debug(f"Viewing tool: {filepath}")
        except Exception as e:
            self.query_one("#preview-title").update("Error")
            self.query_one("#preview-content").update(f"Error reading file: {e}")
            logger.error(f"Error viewing tool {filepath}: {e}")
    
    @handle_errors(show_dialog=True)
    def action_refresh(self) -> None:
        """Refresh the file list."""
        logger.info("Refreshing file list")
        self.query_one(DirectoryTree).reload()
    
    def action_help(self) -> None:
        """Show the help screen."""
        logger.debug("Showing help screen")
        self.push_screen(HelpScreen())
    
    def action_quit(self) -> None:
        """Quit the application."""
        logger.info("Quitting application")
        self.stop()
    
    def on_directory_tree_file_selected(self, event):
        """Handler for file selection event."""
        self.action_view_tool()

    def start(self):
        """Start the TUI application."""
        logger.info("Starting TUI application")
        self.run()

    def stop(self):
        """Stop the TUI application."""
        logger.info("Stopping TUI application")
        self.running = False
        super().exit()