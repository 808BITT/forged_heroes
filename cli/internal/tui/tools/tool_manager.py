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

# Define the unified tool storage file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TOOL_STORAGE_FILE = os.path.join(BASE_DIR, "data", "tools.json")

class ToolManager:
    """Manager for tool operations."""
    
    def __init__(self):
        """Initialize the ToolManager to use the unified JSON file."""
        self.tool_storage_file = TOOL_STORAGE_FILE

    def get_tools(self):
        """Retrieve all tools from the unified JSON file."""
        try:
            with open(self.tool_storage_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error retrieving tools: {e}")
            return {}

    def save_tool(self, tool_id, tool_data):
        """Save or update a tool in the unified JSON file."""
        tools = self.get_tools()
        tools[tool_id] = tool_data
        try:
            with open(self.tool_storage_file, "w") as f:
                json.dump(tools, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving tool {tool_id}: {e}")

    def load_tool(self, tool_id):
        """Load a tool specification from the unified JSON file."""
        try:
            tools = self.get_tools()
            return tools.get(tool_id)
        except Exception as e:
            logger.error(f"Error loading tool {tool_id} from storage: {e}")
            raise

    def delete_tool(self, tool_id):
        """Delete a tool specification from the unified JSON file."""
        try:
            tools = self.get_tools()
            if tool_id in tools:
                del tools[tool_id]
                with open(self.tool_storage_file, "w") as f:
                    json.dump(tools, f, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error deleting tool {tool_id} from storage: {e}")
            raise
    
    def format_tool_content(self, content):
        """Format tool content as syntax-highlighted JSON."""
        try:
            json_obj = json.loads(content)
            formatted_json = json.dumps(json_obj, indent=2)
            return Syntax(formatted_json, "json", theme="monokai", line_numbers=True)
        except json.JSONDecodeError:
            return content  # Return as-is if not valid JSON
