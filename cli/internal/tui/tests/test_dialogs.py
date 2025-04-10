"""
Tests for TUI dialog components.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch, mock_open

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


class TestSaveFileDialog(unittest.TestCase):
    """Test cases for the SaveFileDialog component."""

    def setUp(self):
        """Set up test fixtures."""
        self.content = "Test content"
        self.tool_name = "test_tool"
        self.folders = ["", "folder1", "folder2"]
        self.dialog = SaveFileDialog(self.content, self.tool_name, self.folders)

        # Mock the app property using a patch
        patcher = patch.object(SaveFileDialog, 'app', new_callable=MagicMock)
        self.addCleanup(patcher.stop)
        self.mock_app = patcher.start()
        self.dialog.app = self.mock_app

        # Ensure the app property is mocked correctly
        self.dialog.app.push_screen = MagicMock()

    def test_initialization(self):
        """Test that the dialog is initialized with correct properties."""
        self.assertEqual(self.dialog.content, self.content)
        self.assertEqual(self.dialog.tool_name, self.tool_name)
        self.assertEqual(self.dialog.folders, self.folders)

    def test_defaults_initialization(self):
        """Test that default values are properly initialized when no folders are provided."""
        # Patch os.listdir to simulate an empty tool_specs directory
        with patch("os.listdir", return_value=[]):
            dialog = SaveFileDialog("Default content", "default_tool")
            # When no folders found, get_folders returns at least [""] for the root folder.
            self.assertEqual(dialog.folders, [""])
            self.assertEqual(dialog.content, "Default content")
            self.assertEqual(dialog.tool_name, "default_tool")

    def test_save_file_dialog_ui_elements(self):
        """Test that all UI elements in the Save File Dialog are visible and aligned."""
        dialog = SaveFileDialog(content="Test content", tool_name="test_tool", folders=[""])
        self.assertIsNotNone(dialog.query_one("#folder-select"))
        self.assertIsNotNone(dialog.query_one("#filename-input"))
        self.assertIsNotNone(dialog.query_one("#save-file-btn"))
        self.assertIsNotNone(dialog.query_one("#cancel-file-btn"))

    @patch('internal.tui.dialogs.file.SaveFileDialog.query_one')
    def test_save_file_button_with_empty_filename(self, mock_query_one):
        """Test validation when saving with an empty filename field."""
        # Set up mocks for form fields
        folder_select = MagicMock()
        folder_select.value = ""

        filename_input = MagicMock()
        filename_input.value = ""  # Empty filename field

        # Make query_one return different mocks based on the id
        def query_side_effect(query):
            if query == "#folder-select":
                return folder_select
            elif query == "#filename-input":
                return filename_input

        mock_query_one.side_effect = query_side_effect

        # Create a button press event
        button = MagicMock()
        button.id = "save-file-btn"
        event = MagicMock()
        event.button = button

        # Call the handler
        self.dialog.on_button_pressed(event)

        # Verify push_screen was called with an ErrorDialog
        self.dialog.app.push_screen.assert_called_once()
        # The first argument to push_screen should be an ErrorDialog instance
        self.assertIsInstance(self.dialog.app.push_screen.call_args[0][0], ErrorDialog)

    @patch('internal.tui.dialogs.file.SaveFileDialog.query_one')
    @patch('internal.tui.dialogs.file.SaveFileDialog.dismiss')
    def test_save_file_button_with_valid_filename(self, mock_dismiss, mock_query_one):
        """Test saving with valid filename."""
        # Set up mocks for form fields
        folder_select = MagicMock()
        folder_select.value = ""

        filename_input = MagicMock()
        filename_input.value = "valid_filename"

        # Make query_one return different mocks based on the id
        def query_side_effect(query):
            if query == "#folder-select":
                return folder_select
            elif query == "#filename-input":
                return filename_input

        mock_query_one.side_effect = query_side_effect

        # Create a button press event
        button = MagicMock()
        button.id = "save-file-btn"
        event = MagicMock()
        event.button = button

        # Mock necessary os functions
        with patch("os.makedirs", return_value=None) as mock_makedirs, \
                patch("os.path.exists", return_value=False), \
                patch("builtins.open", mock_open()) as mock_open_file:

            # Call the handler
            self.dialog.on_button_pressed(event)

            # Verify dismiss was called with True
            mock_dismiss.assert_called_once_with(True)

    def test_select_widget_accepts_blank_value(self):
        """Test that the Select widget properly handles blank values."""
        from textual.widgets import Select
        
        # Create a Select with allow_blank=True
        select = Select(
            [(folder, folder or "(root)") for folder in ["", "folder1", "folder2"]],
            value="",  # Try setting an empty value
            id="test-select",
            allow_blank=True  # This should allow empty values
        )
        
        # Verify the value was set correctly
        self.assertEqual(select.value, "")
        
        # Test setting it to another value
        select.value = "folder1"
        self.assertEqual(select.value, "folder1")
        
        # Test setting it back to empty
        select.value = ""
        self.assertEqual(select.value, "")


class TestToolEditor(unittest.TestCase):
    """Test cases for the ToolEditor component."""

    def test_tool_editor_ui_elements(self):
        """Test that all UI elements in the Tool Editor are visible and aligned."""
        editor = ToolEditor(filepath="test.json", content="{}")
        self.assertIsNotNone(editor.query_one("#tool-editor"))
        self.assertIsNotNone(editor.query_one("#save-btn"))
        self.assertIsNotNone(editor.query_one("#cancel-btn"))


if __name__ == "__main__":
    unittest.main()