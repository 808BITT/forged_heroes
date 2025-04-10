import unittest
from unittest.mock import patch, MagicMock, mock_open
import json
import os
from internal.tui import Tui, ToolManager, ErrorDialog, HelpScreen


class TestTui(unittest.TestCase):
    @patch('os.makedirs')
    @patch('os.path.exists')
    @patch('builtins.open', new_callable=mock_open, read_data='{}')
    def test_tui_initialization(self, mock_file, mock_exists, mock_makedirs):
        # Setup
        mock_exists.return_value = False
        
        # Initialize Tui
        tui = Tui()
        
        # Assert directory was created
        mock_makedirs.assert_called()
        
        # Assert JSON file was initialized
        mock_file.assert_called()
        
        # Assert running state
        self.assertTrue(tui.running)

    @patch('internal.tui.Tui.push_screen')
    def test_action_help(self, mock_push_screen):
        # Initialize Tui
        tui = Tui()
        
        # Call the help action
        tui.action_help()
        
        # Assert HelpScreen was pushed
        mock_push_screen.assert_called_once()
        args, kwargs = mock_push_screen.call_args
        self.assertIsInstance(args[0], HelpScreen)

    @patch('internal.tui.Tui.push_screen')
    def test_action_new_tool(self, mock_push_screen):
        # Initialize Tui
        tui = Tui()
        
        # Call the new tool action
        tui.action_new_tool()
        
        # Assert ToolEditor was pushed
        mock_push_screen.assert_called_once()

    @patch('internal.tui.Tui.push_screen')
    @patch('internal.tui.Tui.get_selected_tool_id')
    @patch('internal.tui.ToolManager.get_tool')
    def test_action_edit_tool_success(self, mock_get_tool, mock_get_selected_tool_id, mock_push_screen):
        # Setup
        mock_get_selected_tool_id.return_value = "test_tool"
        mock_get_tool.return_value = {"test": "data"}
        
        # Initialize Tui
        tui = Tui()
        
        # Call the edit tool action
        tui.action_edit_tool()
        
        # Assert tool was retrieved
        mock_get_tool.assert_called_once_with("test_tool")
        
        # Assert ToolEditor was pushed
        mock_push_screen.assert_called_once()

    @patch('internal.tui.Tui.push_screen')
    @patch('internal.tui.Tui.get_selected_tool_id')
    def test_action_edit_tool_no_selection(self, mock_get_selected_tool_id, mock_push_screen):
        # Setup
        mock_get_selected_tool_id.return_value = None
        
        # Initialize Tui
        tui = Tui()
        
        # Call the edit tool action
        tui.action_edit_tool()
        
        # Assert ErrorDialog was pushed
        mock_push_screen.assert_called_once()
        args, kwargs = mock_push_screen.call_args
        self.assertIsInstance(args[0], ErrorDialog)

    @patch('internal.tui.Tui.push_screen')
    @patch('internal.tui.Tui.get_selected_tool_id')
    @patch('internal.tui.ToolManager.get_tool')
    def test_action_edit_tool_nonexistent_tool(self, mock_get_tool, mock_get_selected_tool_id, mock_push_screen):
        # Setup
        mock_get_selected_tool_id.return_value = "nonexistent_tool"
        mock_get_tool.return_value = None
        
        # Initialize Tui
        tui = Tui()
        
        # Call the edit tool action
        tui.action_edit_tool()
        
        # Assert ErrorDialog was pushed
        mock_push_screen.assert_called_once()
        args, kwargs = mock_push_screen.call_args
        self.assertIsInstance(args[0], ErrorDialog)

    @patch('internal.tui.Tui.push_screen')
    @patch('internal.tui.Tui.get_selected_tool_id')
    def test_action_delete_tool(self, mock_get_selected_tool_id, mock_push_screen):
        # Setup
        mock_get_selected_tool_id.return_value = "test_tool"
        
        # Initialize Tui
        tui = Tui()
        
        # Call the delete tool action
        tui.action_delete_tool()
        
        # Assert DeleteConfirmDialog was pushed
        mock_push_screen.assert_called_once()

    @patch('internal.tui.Tui.push_screen')
    @patch('internal.tui.Tui.get_selected_tool_id')
    def test_action_delete_tool_no_selection(self, mock_get_selected_tool_id, mock_push_screen):
        # Setup
        mock_get_selected_tool_id.return_value = None
        
        # Initialize Tui
        tui = Tui()
        
        # Call the delete tool action
        tui.action_delete_tool()
        
        # Assert ErrorDialog was pushed
        mock_push_screen.assert_called_once()
        args, kwargs = mock_push_screen.call_args
        self.assertIsInstance(args[0], ErrorDialog)

    @patch('internal.tui.Tui.query_one')
    @patch('internal.tui.Tui.get_selected_tool_id')
    @patch('internal.tui.ToolManager.get_tool')
    def test_action_view_tool_success(self, mock_get_tool, mock_get_selected_tool_id, mock_query_one):
        # Setup
        mock_get_selected_tool_id.return_value = "test_tool"
        mock_get_tool.return_value = {"test": "data"}
        mock_title = MagicMock()
        mock_content = MagicMock()
        mock_query_one.side_effect = [mock_title, mock_content]
        
        # Initialize Tui
        tui = Tui()
        
        # Call the view tool action
        tui.action_view_tool()
        
        # Assert tool was retrieved
        mock_get_tool.assert_called_once_with("test_tool")
        
        # Assert preview was updated
        mock_title.update.assert_called_once()
        mock_content.update.assert_called_once()

    @patch('internal.tui.Tui.refresh_tools')
    def test_action_refresh(self, mock_refresh_tools):
        # Initialize Tui
        tui = Tui()
        
        # Call the refresh action
        tui.action_refresh()
        
        # Assert refresh_tools was called
        mock_refresh_tools.assert_called_once()

    @patch('internal.tui.Tui.stop')
    def test_action_quit(self, mock_stop):
        # Initialize Tui
        tui = Tui()
        
        # Call the quit action
        tui.action_quit()
        
        # Assert stop was called
        mock_stop.assert_called_once()

    @patch('internal.tui.Tui.query_one')
    @patch('internal.tui.ToolManager.get_tools')
    def test_refresh_tools(self, mock_get_tools, mock_query_one):
        # Setup
        mock_get_tools.return_value = {"tool1": {}, "tool2": {}}
        mock_title = MagicMock()
        mock_content = MagicMock()
        mock_query_one.side_effect = [mock_title, mock_content]
        
        # Initialize Tui
        tui = Tui()
        
        # Call refresh_tools
        tui.refresh_tools()
        
        # Assert tools were retrieved
        mock_get_tools.assert_called_once()
        
        # Assert preview was updated
        mock_title.update.assert_called_once_with("Available Tools")
        mock_content.update.assert_called_once()


if __name__ == "__main__":
    unittest.main()