import unittest
import os
import shutil
import tempfile
import logging
from internal.logger_config import setup_logging


class TestLoggerConfig(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for test logs
        self.test_log_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        # Clean up the temporary directory
        shutil.rmtree(self.test_log_dir)
        
        # Reset the root logger
        root_logger = logging.getLogger()
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
    
    def test_setup_logging_creates_directory(self):
        # Remove the directory to test creation
        shutil.rmtree(self.test_log_dir)
        
        # Call setup_logging with the test directory
        logger = setup_logging(log_dir=self.test_log_dir)
        
        # Check if the directory was created
        self.assertTrue(os.path.exists(self.test_log_dir))
    
    def test_setup_logging_returns_logger(self):
        # Call setup_logging with the test directory
        logger = setup_logging(log_dir=self.test_log_dir)
        
        # Check if the returned object is a logger
        self.assertIsInstance(logger, logging.Logger)
    
    def test_log_file_creation(self):
        # Call setup_logging with the test directory
        logger = setup_logging(log_dir=self.test_log_dir)
        
        # Check if a log file was created
        log_files = [f for f in os.listdir(self.test_log_dir) if f.endswith('.log')]
        self.assertGreaterEqual(len(log_files), 1)
    
    def test_logger_handlers_setup(self):
        # Call setup_logging with the test directory
        logger = setup_logging(log_dir=self.test_log_dir)
        
        # Check if the root logger has handlers
        root_logger = logging.getLogger()
        self.assertGreaterEqual(len(root_logger.handlers), 2)  # At least file and console handlers
        
        # Check handler types
        handler_types = [type(h) for h in root_logger.handlers]
        self.assertIn(logging.handlers.RotatingFileHandler, handler_types)
        self.assertIn(logging.StreamHandler, handler_types)


if __name__ == "__main__":
    unittest.main()