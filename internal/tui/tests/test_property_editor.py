"""
Tests for the PropertyEditor component.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add parent directory to path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from textual.app import App
from textual.widgets import Button, Input, Select, Switch

from internal.tui.screens.property_editor import PropertyEditor
from internal.tui.dialogs.error import ErrorDialog


class TestPropertyEditor(unittest.TestCase):
    """Test cases for the PropertyEditor component."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.app = MagicMock()
        self.property_data = {
            "name": "test_param",
            "type": "string",
            "description": "Test parameter",
            "required": True,
            "enum": ["value1", "value2"]
        }
        self.editor = PropertyEditor(self.property_data, edit_mode=True)
        self.editor.app = self.app
        
    def test_initialization(self):
        """Test that the editor is initialized with correct properties."""
        self.assertEqual(self.editor.property_data, self.property_data)
        self.assertEqual(self.editor.title, "Edit Property")
        
    def test_initialization_add_mode(self):
        """Test that the editor initializes in 'add' mode correctly."""
        editor = PropertyEditor(edit_mode=False)
        self.assertEqual(editor.title, "Add Property")
        
    @patch('internal.tui.screens.property_editor.PropertyEditor.query_one')
    def test_cancel_button(self, mock_query_one):
        """Test that the cancel button dismisses the dialog."""
        # Mock the dismiss method
        self.editor.dismiss = MagicMock()
        
        # Create a button press event
        button = MagicMock()
        button.id = "cancel-prop-btn"
        event = MagicMock()
        event.button = button
        
        # Call the handler
        self.editor.on_button_pressed(event)
        
        # Verify dismiss was called with None
        self.editor.dismiss.assert_called_once_with(None)
        
    @patch('internal.tui.screens.property_editor.PropertyEditor.query_one')
    @patch('internal.tui.screens.property_editor.PropertyEditor.dismiss')
    def test_save_button_with_empty_name(self, mock_dismiss, mock_query_one):
        """Test validation when saving with an empty name field."""
        # Set up mocks for form fields
        name_field = MagicMock()
        name_field.value = ""  # Empty name field
        
        type_field = MagicMock()
        type_field.value = "string"
        
        description_field = MagicMock()
        description_field.value = "Test description"
        
        required_field = MagicMock()
        required_field.value = True
        
        enum_field = MagicMock()
        enum_field.value = "value1,value2"
        
        # Make query_one return different mocks based on the id
        def query_side_effect(query):
            if query == "#prop-name":
                return name_field
            elif query == "#prop-type":
                return type_field
            elif query == "#prop-description":
                return description_field
            elif query == "#prop-required":
                return required_field
            elif query == "#prop-enum":
                return enum_field
        
        mock_query_one.side_effect = query_side_effect
        
        # Create a button press event
        button = MagicMock()
        button.id = "save-prop-btn"
        event = MagicMock()
        event.button = button
        
        # Call the handler
        self.editor.on_button_pressed(event)
        
        # Verify push_screen was called with an ErrorDialog
        self.app.push_screen.assert_called_once()
        # The first argument to push_screen should be an ErrorDialog instance
        self.assertIsInstance(self.app.push_screen.call_args[0][0], ErrorDialog)
        
        # Verify dismiss was not called
        mock_dismiss.assert_not_called()
        
    @patch('internal.tui.screens.property_editor.PropertyEditor.query_one')
    def test_save_button_with_valid_data(self, mock_query_one):
        """Test saving with valid form data."""
        # Set up mocks for form fields
        name_field = MagicMock()
        name_field.value = "valid_param"
        
        type_field = MagicMock()
        type_field.value = "string"
        
        description_field = MagicMock()
        description_field.value = "Test description"
        
        required_field = MagicMock()
        required_field.value = True
        
        enum_field = MagicMock()
        enum_field.value = "value1,value2"
        
        # Make query_one return different mocks based on the id
        def query_side_effect(query):
            if query == "#prop-name":
                return name_field
            elif query == "#prop-type":
                return type_field
            elif query == "#prop-description":
                return description_field
            elif query == "#prop-required":
                return required_field
            elif query == "#prop-enum":
                return enum_field
        
        mock_query_one.side_effect = query_side_effect
        
        # Mock the dismiss method
        self.editor.dismiss = MagicMock()
        
        # Create a button press event
        button = MagicMock()
        button.id = "save-prop-btn"
        event = MagicMock()
        event.button = button
        
        # Call the handler
        self.editor.on_button_pressed(event)
        
        # Verify dismiss was called with the correct property data
        expected_data = {
            "name": "valid_param",
            "type": "string",
            "description": "Test description",
            "required": True,
            "enum": ["value1", "value2"]
        }
        self.editor.dismiss.assert_called_once_with(expected_data)


if __name__ == "__main__":
    unittest.main()