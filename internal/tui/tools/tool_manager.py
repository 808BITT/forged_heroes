"""
Tool management functionality for the TUI.
"""

import os
import json
import logging
from rich.syntax import Syntax

# Fix incorrect import paths - use core submodule
from internal.tool.core.tool import Tool
from internal.tool.core.parameter import ToolParams
from internal.tool.core.property import ToolProperty

# Configure logging
logger = logging.getLogger(__name__)

class ToolManager:
    """Manager for tool operations."""
    
    def __init__(self, tool_specs_dir):
        """Initialize the tool manager with the directory for tool specifications."""
        self.tool_specs_dir = tool_specs_dir
        self._ensure_dir_exists()
    
    def _ensure_dir_exists(self):
        """Ensure the tool specifications directory exists."""
        os.makedirs(self.tool_specs_dir, exist_ok=True)
    
    def get_tool_folders(self):
        """Get a list of folders in the tool specifications directory."""
        folders = []
        try:
            for item in os.listdir(self.tool_specs_dir):
                item_path = os.path.join(self.tool_specs_dir, item)
                if os.path.isdir(item_path):
                    folders.append(item)
        except Exception as e:
            logger.error(f"Error listing tool folders: {e}")
        return folders
    
    def load_tool(self, filepath):
        """Load a tool specification from a JSON file."""
        try:
            with open(filepath, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading tool from {filepath}: {e}")
            raise
    
    def save_tool(self, filepath, content):
        """Save a tool specification to a JSON file."""
        try:
            folder_path = os.path.dirname(filepath)
            os.makedirs(folder_path, exist_ok=True)
            
            with open(filepath, "w") as f:
                f.write(content)
            return True
        except Exception as e:
            logger.error(f"Error saving tool to {filepath}: {e}")
            raise
    
    def delete_tool(self, filepath):
        """Delete a tool specification file."""
        try:
            os.remove(filepath)
            return True
        except Exception as e:
            logger.error(f"Error deleting tool {filepath}: {e}")
            raise
    
    def format_tool_content(self, content):
        """Format tool content as syntax-highlighted JSON."""
        try:
            json_obj = json.loads(content)
            formatted_json = json.dumps(json_obj, indent=2)
            return Syntax(formatted_json, "json", theme="monokai", line_numbers=True)
        except json.JSONDecodeError:
            return content  # Return as-is if not valid JSON
