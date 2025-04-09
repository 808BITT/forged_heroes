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
from internal.tui.dialogs.file import SaveFileDialog
from internal.tui.app import ToolEditor


class TestErrorDialog(unittest.TestCase):
    """Test cases for the ErrorDialog component."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.message = "Test error message"
        self.dialog = ErrorDialog(self.message)

        # Mock the app property using a patch
        patcher = patch.object(ErrorDialog, 'app', new_callable=MagicMock)
        self.addCleanup(patcher.stop)
        self.mock_app = patcher.start()
        self.dialog.app = self.mock_app
        
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

    def test_save_file_dialog_ui_elements(self):
        """Test that all UI elements in the Save File Dialog are visible and aligned."""
        dialog = SaveFileDialog(content="Test content")
        self.assertIsNotNone(dialog.query_one("#folder-select"))
        self.assertIsNotNone(dialog.query_one("#filename-input"))
        self.assertIsNotNone(dialog.query_one("#save-file-btn"))
        self.assertIsNotNone(dialog.query_one("#cancel-file-btn"))

    def test_tool_editor_ui_elements(self):
        """Test that all UI elements in the Tool Editor are visible and aligned."""
        editor = ToolEditor(filepath="test.json", content="{}")
        self.assertIsNotNone(editor.query_one("#tool-editor"))
        self.assertIsNotNone(editor.query_one("#save-btn"))
        self.assertIsNotNone(editor.query_one("#cancel-btn"))


if __name__ == "__main__":
    unittest.main()