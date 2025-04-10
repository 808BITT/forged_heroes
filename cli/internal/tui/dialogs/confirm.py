"""
Confirmation dialog components for the application.
"""

import os
from textual.screen import ModalScreen
from textual.widgets import Button, Static, DirectoryTree
from textual.containers import Container, Horizontal
from textual.app import ComposeResult

from internal.tui.dialogs.error import ErrorDialog

class DeleteConfirmDialog(ModalScreen):
    """Confirmation dialog for deleting files."""
    
    def __init__(self, filepath):
        super().__init__()
        self.filepath = filepath
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(f"Are you sure you want to delete {self.filepath}?", classes="confirm-text"),
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
                os.remove(self.filepath)
                self.dismiss(True)
                # Refresh the directory tree
                self.app.query_one(DirectoryTree).reload()
            except OSError as e:
                self.app.push_screen(
                    ErrorDialog(f"Error deleting file: {e}"),
                    lambda _: None
                )
        elif button_id == "cancel-delete-btn":
            self.dismiss(False)