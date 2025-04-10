"""
Error dialog component for displaying error messages.
"""

from textual.screen import ModalScreen
from textual.widgets import Button, Static
from textual.containers import Container
from textual.app import ComposeResult

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