"""
Simple input dialog component.
"""

import logging
from textual.screen import ModalScreen
from textual.widgets import Button, Static, Input
from textual.containers import Container, Horizontal
from textual.app import ComposeResult

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleInputDialog(ModalScreen):
    """A simple dialog for text input."""
    
    def __init__(self, prompt, title, default_value=""):
        super().__init__()
        self.prompt = prompt
        self.title = title
        self.default_value = default_value
        logger.debug(f"Created SimpleInputDialog: title={title}, prompt={prompt}")
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.title, classes="editor-title"),
            Static(self.prompt, classes="dialog-prompt"),
            Input(value=self.default_value, id="input-value"),
            Horizontal(
                Button("OK", id="ok-btn", variant="primary"),
                Button("Cancel", id="cancel-btn"),
                classes="dialog-buttons"
            ),
            classes="input-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        
        if button_id == "ok-btn":
            value = self.query_one("#input-value").value
            logger.debug(f"OK pressed with value: {value}")
            self.dismiss(value)
        elif button_id == "cancel-btn":
            logger.debug("Cancel pressed")
            self.dismiss(None)
