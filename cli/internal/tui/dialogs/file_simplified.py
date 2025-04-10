"""
Simplified file dialog components.
"""

import os
import logging
from textual.screen import ModalScreen
from textual.widgets import Button, Static, Input, Select, Label, DirectoryTree
from textual.containers import Container, Horizontal
from textual.app import ComposeResult

from internal.tui.constants import TOOL_SPECS_DIR
from internal.tui.dialogs.error import ErrorDialog
from internal.tui.dialogs.input_dialog import SimpleInputDialog

# Configure logging
logger = logging.getLogger(__name__)

class SimplifiedSaveFileDialog(ModalScreen):
    """Dialog for saving a new file - simplified version."""
    
    def __init__(self, content, tool_name="", folders=None):
        super().__init__()
        self.content = content
        self.tool_name = tool_name
        # Get folders if not provided
        self.folders = folders if folders is not None else self._get_folders()
        logger.debug(f"SimplifiedSaveFileDialog initialized with {len(self.folders)} folders")
        
    def _get_folders(self):
        """Get subdirectories in the tool_specs directory."""
        folders = []
        try:
            for item in os.listdir(TOOL_SPECS_DIR):
                item_path = os.path.join(TOOL_SPECS_DIR, item)
                if os.path.isdir(item_path):
                    folders.append(item)
        except Exception as e:
            logger.error(f"Error accessing TOOL_SPECS_DIR: {e}")
        return folders
        
    def compose(self) -> ComposeResult:
        # Prepare select options with placeholder
        options = [("Choose a folder", "placeholder")]
        for folder in self.folders:
            options.append((folder, folder))

        yield Container(
            Static("Save Tool Specification", classes="editor-title"),
            Horizontal(
                Label("Folder:"),
                Select(
                    options=options,
                    value="placeholder",
                    id="folder-select"
                ),
                Button("New Folder", id="new-folder-btn"),
                classes="form-row save-form-row"
            ),
            Horizontal(
                Label("Filename:"),
                Input(value=f"{self.tool_name}.json" if self.tool_name else "", 
                      placeholder="filename.json", 
                      id="filename-input"),
                classes="form-row save-form-row"
            ),
            Horizontal(
                Button("Save", id="save-file-btn", variant="primary"),
                Button("Cancel", id="cancel-file-btn"),
                classes="dialog-buttons"
            ),
            classes="save-file-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        
        if button_id == "new-folder-btn":
            self._prompt_for_new_folder()
        elif button_id == "save-file-btn":
            self._save_file()
        elif button_id == "cancel-file-btn":
            self.dismiss(False)
    
    def _prompt_for_new_folder(self):
        """Show dialog to create a new folder."""
        self.app.push_screen(
            SimpleInputDialog("Enter folder name:", "Create Folder"),
            self._handle_new_folder
        )
            
    def _handle_new_folder(self, folder_name):
        """Handle result from new folder dialog."""
        if not folder_name:
            return
            
        # Create the folder
        try:
            folder_path = os.path.join(TOOL_SPECS_DIR, folder_name)
            os.makedirs(folder_path, exist_ok=True)
            
            # Get the Select widget and update options
            select = self.query_one("#folder-select", Select)
            
            # Build new options list
            new_options = [("Choose a folder", "placeholder")]
            new_options.append((folder_name, folder_name))
            
            # Add existing folders
            for label, value in list(select.options):
                if value != "placeholder" and value != folder_name:
                    new_options.append((label, value))
                    
            # Update the widget
            select.set_options(new_options)
            select.value = folder_name
            logger.info(f"Created new folder: {folder_name}")
            
        except Exception as e:
            logger.error(f"Error creating folder: {e}")
            self.app.push_screen(
                ErrorDialog(f"Error creating folder: {e}"),
                lambda _: None
            )
    
    def _save_file(self):
        """Save the file with proper name handling."""
        folder = self.query_one("#folder-select").value
        
        # Validate folder selection
        if folder == "placeholder":
            self.app.push_screen(
                ErrorDialog("Please select a valid folder."),
                lambda _: None
            )
            return
            
        filename = self.query_one("#filename-input").value
        
        # Validate filename
        if not filename:
            self.app.push_screen(
                ErrorDialog("Filename cannot be empty."),
                lambda _: None
            )
            return
                
        # Add .json extension if needed
        if not filename.endswith(".json"):
            filename += ".json"
                
        # Construct path and create directory
        folder_path = os.path.join(TOOL_SPECS_DIR, folder)
        filepath = os.path.join(folder_path, filename)
        os.makedirs(folder_path, exist_ok=True)
        
        # Handle file name conflicts
        base_name, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(filepath):
            new_filename = f"{base_name}_{counter}{ext}"
            filepath = os.path.join(folder_path, new_filename)
            counter += 1
        
        try:
            # Save and dismiss
            with open(filepath, "w") as f:
                f.write(self.content)
                
            logger.info(f"File saved successfully: {filepath}")
            
            # Try to refresh the directory tree
            try:
                self.app.query_one(DirectoryTree).reload()
            except Exception:
                # Directory tree might not exist
                pass
                
            self.dismiss(True)
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            self.app.push_screen(
                ErrorDialog(f"Error saving file: {e}"),
                lambda _: None
            )
