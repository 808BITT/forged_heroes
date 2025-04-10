"""
Status notification components for the TUI.
"""

import logging
from textual.widgets import Static
from textual.reactive import reactive
from textual.app import ComposeResult
from textual.containers import Container

logger = logging.getLogger(__name__)

class StatusBar(Static):
    """A status bar that shows messages at the bottom of the screen."""
    
    message = reactive("")
    status_type = reactive("info")  # info, warning, error, success
    
    def __init__(self, message="Ready", status_type="info"):
        super().__init__("")
        self.message = message
        self.status_type = status_type
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.message, id="status-text"),
            id="status-container"
        )
        
    def watch_message(self, message: str) -> None:
        """Update the displayed message when the reactive attribute changes."""
        self.query_one("#status-text").update(message)
        
    def watch_status_type(self, status_type: str) -> None:
        """Update the status type classes when the reactive attribute changes."""
        self.remove_class("status-info status-warning status-error status-success")
        self.add_class(f"status-{status_type}")
        
    def set_status(self, message, status_type="info"):
        """Set the status message and type."""
        self.message = message
        self.status_type = status_type
        logger.debug(f"Status: [{status_type}] {message}")
        
    def info(self, message):
        """Set an info status message."""
        self.set_status(message, "info")
        
    def warning(self, message):
        """Set a warning status message."""
        self.set_status(message, "warning")
        
    def error(self, message):
        """Set an error status message."""
        self.set_status(message, "error")
        
    def success(self, message):
        """Set a success status message."""
        self.set_status(message, "success")
