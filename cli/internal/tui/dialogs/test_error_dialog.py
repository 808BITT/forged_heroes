import unittest
from unittest.mock import MagicMock
from textual.widgets import Button
from internal.tui.dialogs.error import ErrorDialog

class TestErrorDialog(unittest.TestCase):
    def setUp(self):
        self.dialog = ErrorDialog("Test error message")

    def test_error_dialog_initialization(self):
        self.assertEqual(self.dialog.message, "Test error message")

    def test_dismiss_on_ok(self):
        """Test that the dialog dismisses correctly when OK is pressed."""
        # Mock the dismiss method
        self.dialog.dismiss = MagicMock()

        # Create a button press event
        button = MagicMock()
        button.id = "error-ok-btn"
        event = MagicMock()
        event.button = button

        # Call the correct handler
        self.dialog.on_button_pressed(event)

        # Verify dismiss was called with True
        self.dialog.dismiss.assert_called_once_with(True)
