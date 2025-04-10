"""
Constants and configuration values for the TUI module.
"""
import os
import logging

logger = logging.getLogger(__name__)

# Project base directory - this is the root of the project
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))

# Directory for storing tool specifications - use absolute path for reliability
TOOL_SPECS_DIR = os.path.join(BASE_DIR, "tool_specs")

# Updated tool storage location
TOOL_STORAGE_FILE = os.path.join(os.path.dirname(os.path.dirname(BASE_DIR)), "data", "tools.json")

# Logging directory
LOG_DIR = os.path.join(BASE_DIR, "logs")

# CSS files
CSS_DIR = os.path.dirname(__file__)
CSS_PATH = os.path.join(CSS_DIR, "style.css")

# Ensure critical directories exist
def ensure_critical_directories():
    """Ensure that critical directories needed by the application exist."""
    try:
        os.makedirs(TOOL_SPECS_DIR, exist_ok=True)
        os.makedirs(LOG_DIR, exist_ok=True)
        logger.info(f"Critical directories verified: {TOOL_SPECS_DIR}, {LOG_DIR}")
    except Exception as e:
        logger.error(f"Error creating critical directories: {e}")
        # Don't raise here, just log the error

# Call this at import time to ensure directories exist
ensure_critical_directories()