import unittest
import sys
from unittest.mock import patch, MagicMock
from io import StringIO
import importlib.util
import os

# Import the main module
spec = importlib.util.spec_from_file_location(
    "main", 
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "main.py")
)
main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(main)


class TestMain(unittest.TestCase):
    @patch('sys.stdout', new_callable=StringIO)
    @patch('internal.tui.Tui')
    @patch('internal.logger_config.setup_logging')
    def test_main_normal_exit(self, mock_setup_logging, mock_tui_class, mock_stdout):
        # Setup the mocks
        mock_logger = MagicMock()
        mock_setup_logging.return_value = mock_logger
        
        mock_tui_instance = MagicMock()
        mock_tui_class.return_value = mock_tui_instance
        
        # Call the main function
        result = main.main()
        
        # Check that logging was set up
        mock_setup_logging.assert_called_once()
        
        # Check that Tui was instantiated and started
        mock_tui_class.assert_called_once()
        mock_tui_instance.start.assert_called_once()
        
        # Check that the application printed a startup message
        self.assertIn("Forged Heroes: The Forge is now active.", mock_stdout.getvalue())
        
        # Check return code
        self.assertEqual(result, 0)
        
        # Check that the logger was used correctly
        mock_logger.info.assert_any_call("Application starting")
        mock_logger.info.assert_any_call("Application exited normally")

    @patch('sys.stdout', new_callable=StringIO)
    @patch('internal.tui.Tui')
    @patch('internal.logger_config.setup_logging')
    def test_main_keyboard_interrupt(self, mock_setup_logging, mock_tui_class, mock_stdout):
        # Setup the mocks
        mock_logger = MagicMock()
        mock_setup_logging.return_value = mock_logger
        
        mock_tui_instance = MagicMock()
        mock_tui_class.return_value = mock_tui_instance
        
        # Make tui.start() raise KeyboardInterrupt
        mock_tui_instance.start.side_effect = KeyboardInterrupt()
        
        # Call the main function
        result = main.main()
        
        # Check that Tui was instantiated, started, and stopped
        mock_tui_class.assert_called_once()
        mock_tui_instance.start.assert_called_once()
        mock_tui_instance.stop.assert_called_once()
        
        # Check that the application printed exit message
        self.assertIn("Exiting...", mock_stdout.getvalue())
        
        # Check return code
        self.assertEqual(result, 0)
        
        # Check that the logger was used correctly
        mock_logger.info.assert_any_call("Application starting")
        mock_logger.info.assert_any_call("Application terminated by user (KeyboardInterrupt)")

    @patch('sys.stdout', new_callable=StringIO)
    @patch('internal.tui.Tui')
    @patch('internal.logger_config.setup_logging')
    def test_main_exception(self, mock_setup_logging, mock_tui_class, mock_stdout):
        # Setup the mocks
        mock_logger = MagicMock()
        mock_setup_logging.return_value = mock_logger
        
        mock_tui_instance = MagicMock()
        mock_tui_class.return_value = mock_tui_instance
        
        # Make tui.start() raise an exception
        test_exception = Exception("Test exception")
        mock_tui_instance.start.side_effect = test_exception
        
        # Call the main function
        result = main.main()
        
        # Check that Tui was instantiated, started, and stopped
        mock_tui_class.assert_called_once()
        mock_tui_instance.start.assert_called_once()
        mock_tui_instance.stop.assert_called_once()
        
        # Check that the application printed error message
        self.assertIn("A critical error occurred:", mock_stdout.getvalue())
        self.assertIn("Test exception", mock_stdout.getvalue())
        
        # Check return code
        self.assertEqual(result, 1)
        
        # Check that the logger was used correctly
        mock_logger.info.assert_any_call("Application starting")
        mock_logger.critical.assert_called_once()


if __name__ == "__main__":
    unittest.main()