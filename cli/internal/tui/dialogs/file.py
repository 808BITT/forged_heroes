"""
File-related dialog components.
"""

import os
import logging
from textual.screen import ModalScreen
from textual.widgets import Button, Static, Input, Select, Label, DirectoryTree
from textual.containers import Container, Horizontal
from textual.app import ComposeResult

from internal.tui.constants import TOOL_SPECS_DIR
from internal.tui.dialogs.error import ErrorDialog

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class SaveFileDialog(ModalScreen):
    """Dialog for saving a new file."""
    
    def __init__(self, content, tool_name="", folders=None):
        super().__init__()
        self.content = content
        self.tool_name = tool_name
        self.folders = folders if folders is not None else self.get_folders()
        
    def get_folders(self):
        """Get subdirectories in the tool_specs directory."""
        folders = []
        try:
            logging.debug(f"TOOL_SPECS_DIR: {TOOL_SPECS_DIR}")
            for item in os.listdir(TOOL_SPECS_DIR):
                item_path = os.path.join(TOOL_SPECS_DIR, item)
                if os.path.isdir(item_path):
                    logging.debug(f"Adding folder: {item}")
                    folders.append(item)
            logging.debug(f"Final folder list: {folders}")
        except Exception as e:
            logging.error(f"Error accessing TOOL_SPECS_DIR: {e}")
        return folders
        
    def compose(self) -> ComposeResult:
        # Prepare select options - add a placeholder and the folders
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
            self.app.push_screen(
                NewFolderDialog(),
                self.handle_new_folder
            )
        elif button_id == "save-file-btn":
            self.save_file()
        elif button_id == "cancel-file-btn":
            self.dismiss(False)
            
    def handle_new_folder(self, folder_name):
        """Handle result from new folder dialog."""
        if folder_name:
            # Get the Select widget
            select = self.query_one("#folder-select", Select)

            # Create new options including the new folder
            new_options = [("Choose a folder", "placeholder")]  # Placeholder option

            # Add the new folder as the first real option
            new_options.append((folder_name, folder_name))

            # Add existing folders (except the placeholder)
            # First convert options to list to avoid 'Select' object has no attribute 'options'
            current_options = list(select.options)
            for label, value in current_options:
                if value != "placeholder" and value != folder_name:
                    new_options.append((label, value))

            # Use set_options() instead of direct property assignment
            select.set_options(new_options)
            select.value = folder_name
    
    def save_file(self):
        """Save the file with proper name handling."""
        folder = self.query_one("#folder-select").value
        
        # Ensure a valid folder is selected
        if folder == "placeholder":
            self.app.push_screen(
                ErrorDialog("Please select a valid folder."),
                lambda _: None
            )
            return
        
        filename = self.query_one("#filename-input").value
        
        if not filename:
            self.app.push_screen(
                ErrorDialog("Filename cannot be empty."),
                lambda _: None
            )
            return
        
        # Add .json extension if not present
        if not filename.endswith(".json"):
            filename += ".json"
        
        # Construct the full path
        folder_path = os.path.join(TOOL_SPECS_DIR, folder)
        filepath = os.path.join(folder_path, filename)
        
        # Create directory if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)
        
        # Check if file already exists and auto-increment if needed
        base_name, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(filepath):
            new_filename = f"{base_name}_{counter}{ext}"
            filepath = os.path.join(folder_path, new_filename)
            counter += 1
        
        try:
            # Save the file
            with open(filepath, "w") as f:
                f.write(self.content)
            
            # Try to refresh the directory tree if it exists
            try:
                self.app.query_one(DirectoryTree).reload()
            except Exception:
                # Directory tree might not be available, ignore if it fails
                pass
                
            self.dismiss(True)
        except Exception as e:
            # Show error if file saving fails
            self.app.push_screen(
                ErrorDialog(f"Failed to save file: {e}"),
                lambda _: None
            )


class NewFolderDialog(ModalScreen):
    """Dialog for creating a new folder."""
    
    def compose(self) -> ComposeResult:
        yield Container(
            Static("Create New Folder", classes="editor-title"),
            Horizontal(
                Label("Folder Name:"),
                Input(placeholder="folder_name", id="folder-name-input"),
                classes="form-row"
            ),
            Horizontal(
                Button("Create", id="create-folder-btn", variant="primary"),
                Button("Cancel", id="cancel-folder-btn"),
                classes="dialog-buttons"
            ),
            classes="new-folder-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "create-folder-btn":
            folder_name = self.query_one("#folder-name-input").value
            if not folder_name:
                self.app.push_screen(
                    ErrorDialog("Folder name cannot be empty."),
                    lambda _: None
                )
                return
            folder_path = os.path.join(TOOL_SPECS_DIR, folder_name)
            os.makedirs(folder_path, exist_ok=True)
            self.dismiss(folder_name)
        elif button_id == "cancel-folder-btn":
            self.dismiss(None)