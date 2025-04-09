"""
File-related dialog components.
"""

import os
from textual.screen import ModalScreen
from textual.widgets import Button, Static, Input, Select, Label, DirectoryTree
from textual.containers import Container, Horizontal
from textual.app import ComposeResult

from internal.tui.constants import TOOL_SPECS_DIR
from internal.tui.dialogs.error import ErrorDialog

class SaveFileDialog(ModalScreen):
    """Dialog for saving a new file."""
    
    def __init__(self, content, tool_name=""):
        super().__init__()
        self.content = content
        self.tool_name = tool_name
        self.folders = self.get_folders()
        
    def get_folders(self):
        """Get existing folders in tool_specs directory."""
        folders = [""]  # Root directory
        try:
            for item in os.listdir(TOOL_SPECS_DIR):
                item_path = os.path.join(TOOL_SPECS_DIR, item)
                if os.path.isdir(item_path):
                    folders.append(item)
        except Exception:
            pass
        return folders
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static("Save Tool Specification", classes="editor-title"),
            Horizontal(
                Label("Folder:"),
                Select([(folder, folder or "(root)") for folder in self.folders], value="", id="folder-select"),
                Button("New Folder", id="new-folder-btn"),
                classes="form-row save-form-row"
            ),
            Horizontal(
                Label("Filename:"),
                Input(value=f"{self.tool_name}.json" if self.tool_name else "", placeholder="filename.json", id="filename-input"),
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
            # Update the folder select with the new folder
            select = self.query_one("#folder-select")
            select.add_option((folder_name, folder_name))
            select.value = folder_name
    
    def save_file(self):
        """Save the file with proper name handling."""
        folder = self.query_one("#folder-select").value
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
        folder_path = os.path.join(TOOL_SPECS_DIR, folder) if folder else TOOL_SPECS_DIR
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
                
        # Save the file
        with open(filepath, "w") as f:
            f.write(self.content)
                
        self.dismiss(True)
        # Refresh the directory tree
        self.app.query_one(DirectoryTree).reload()


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
                
            # Create the folder
            try:
                folder_path = os.path.join(TOOL_SPECS_DIR, folder_name)
                os.makedirs(folder_path, exist_ok=True)
                self.dismiss(folder_name)
            except Exception as e:
                self.app.push_screen(
                    ErrorDialog(f"Error creating folder: {e}"),
                    lambda _: None
                )
        elif button_id == "cancel-folder-btn":
            self.dismiss(None)