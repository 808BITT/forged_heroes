import unittest
from unittest.mock import patch, mock_open, MagicMock
from internal.tui.screens.tool_wizard import ToolWizard
from internal.tui.dialogs.error import ErrorDialog

class TestToolWizard(unittest.TestCase):
    def test_tool_wizard_initialization(self):
        wizard = ToolWizard()
        self.assertIsNotNone(wizard)

    @patch("builtins.open", new_callable=mock_open, read_data="{}")
    @patch("internal.tui.screens.tool_wizard.ToolWizard.app", new_callable=MagicMock)
    def test_tool_wizard_load_tool(self, mock_app, mock_open):
        """Test loading a tool specification."""
        wizard = ToolWizard()

        # Mock the app context
        mock_app.push_screen = MagicMock()

        # Call the load_tool method with a mocked file path
        wizard.load_tool("example_tool")

        # Verify the app pushed an error dialog due to empty JSON
        mock_app.push_screen.assert_called_once()
        self.assertIsInstance(mock_app.push_screen.call_args[0][0], ErrorDialog)
