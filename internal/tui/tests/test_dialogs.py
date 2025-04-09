"""
Tests for TUI dialog components.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add parent directory to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from textual.app import App
from textual.widgets import Button

from internal.tui.dialogs.error import ErrorDialog


class TestErrorDialog(unittest.TestCase):
    """Test cases for the ErrorDialog component."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = MagicMock()
        self.message = "Test error message"
        self.dialog = ErrorDialog(self.message)
        self.dialog.app = self.app
        
    def test_initialization(self):
        """Test that the dialog is initialized with the correct message."""
        self.assertEqual(self.dialog.message, self.message)
        
    def test_dismiss_on_ok(self):
        """Test that the dialog dismisses correctly when OK is pressed."""
        # Mock the dismiss method
        self.dialog.dismiss = MagicMock()
        
        # Create a button press event
        button = MagicMock()
        button.id = "error-ok-btn"
        event = MagicMock()
        event.button = button
        
        # Call the handler
        self.dialog.on_button_pressed(event)
        
        # Verify dismiss was called with True
        self.dialog.dismiss.assert_called_once_with(True)


if __name__ == "__main__":
    unittest.main()