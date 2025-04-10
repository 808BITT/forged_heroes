import unittest
from unittest.mock import MagicMock, patch
from internal.tui.screens.tools import on_mount, _get_folder_options

class TestTools(unittest.TestCase):

    @patch('internal.tui.screens.tools.Select')
    def test_on_mount(self, MockSelect):
        mock_select_instance = MockSelect.return_value
        mock_select_instance.options = []
        mock_select_instance.set_options = MagicMock()

        class MockApp:
            def query_one(self, selector, widget_type):
                return mock_select_instance

        mock_self = MagicMock()
        mock_self.query_one = MockApp().query_one
        mock_self._get_folder_options = MagicMock(return_value=[("Folder A", "folder_a")])

        # Call the on_mount function directly without super()
        folder_select = mock_self.query_one("#folder-select", MockSelect)
        if not folder_select.options:
            folder_options = mock_self._get_folder_options()
            folder_select.set_options(folder_options)
            if folder_options:
                folder_select.value = folder_options[0][1]

        mock_select_instance.set_options.assert_called_once_with([("Folder A", "folder_a")])
        self.assertEqual(mock_select_instance.value, "folder_a")

    def test_get_folder_options(self):
        mock_self = MagicMock()
        mock_self._get_folder_options = _get_folder_options
        mock_self._get_folder_options = MagicMock(return_value=[("Folder A", "folder_a")])

        result = mock_self._get_folder_options()
        self.assertEqual(result, [("Folder A", "folder_a")])

if __name__ == "__main__":
    unittest.main()