import unittest
import os
import json
import tempfile
import shutil
from internal.tui import ToolManager


class TestToolManager(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for test data
        self.test_dir = tempfile.mkdtemp()
        self.test_data_dir = os.path.join(self.test_dir, "data")
        os.makedirs(self.test_data_dir, exist_ok=True)
        
        # Create a test tools.json file
        self.test_tools_file = os.path.join(os.path.dirname(os.path.dirname(self.test_dir)), "data", "tools.json")
        self.test_tools = {
            "test_tool1": {
                "type": "function",
                "function": {
                    "name": "test_tool1",
                    "description": "A test tool",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "test_param": {
                                "type": "string",
                                "description": "A test parameter"
                            }
                        },
                        "required": ["test_param"]
                    }
                }
            }
        }
        
        with open(self.test_tools_file, "w") as f:
            json.dump(self.test_tools, f)
        
        # Create a tool manager with the test file path
        self.original_tool_storage_file = ToolManager.TOOL_STORAGE_FILE
        ToolManager.TOOL_STORAGE_FILE = self.test_tools_file
        self.tool_manager = ToolManager()
    
    def tearDown(self):
        # Reset the tool storage file path
        ToolManager.TOOL_STORAGE_FILE = self.original_tool_storage_file
        
        # Clean up the temporary directory
        shutil.rmtree(self.test_dir)
    
    def test_get_tools(self):
        # Test retrieving all tools
        tools = self.tool_manager.get_tools()
        self.assertEqual(tools, self.test_tools)
    
    def test_get_tool(self):
        # Test retrieving a specific tool
        tool = self.tool_manager.get_tool("test_tool1")
        self.assertEqual(tool, self.test_tools["test_tool1"])
        
        # Test retrieving a non-existent tool
        tool = self.tool_manager.get_tool("non_existent_tool")
        self.assertIsNone(tool)
    
    def test_save_tool(self):
        # Test saving a new tool
        new_tool = {
            "type": "function",
            "function": {
                "name": "new_tool",
                "description": "A new test tool",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "new_param": {
                            "type": "string",
                            "description": "A new test parameter"
                        }
                    },
                    "required": ["new_param"]
                }
            }
        }
        
        self.tool_manager.save_tool("new_tool", new_tool)
        
        # Check if the tool was saved
        tools = self.tool_manager.get_tools()
        self.assertIn("new_tool", tools)
        self.assertEqual(tools["new_tool"], new_tool)
        
        # Test updating an existing tool
        updated_tool = {
            "type": "function",
            "function": {
                "name": "test_tool1",
                "description": "Updated description",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "test_param": {
                            "type": "string",
                            "description": "Updated parameter description"
                        }
                    },
                    "required": ["test_param"]
                }
            }
        }
        
        self.tool_manager.save_tool("test_tool1", updated_tool)
        
        # Check if the tool was updated
        tools = self.tool_manager.get_tools()
        self.assertEqual(tools["test_tool1"], updated_tool)
    
    def test_delete_tool(self):
        # Test deleting a tool
        self.tool_manager.delete_tool("test_tool1")
        
        # Check if the tool was deleted
        tools = self.tool_manager.get_tools()
        self.assertNotIn("test_tool1", tools)
        
        # Test deleting a non-existent tool (should not raise an error)
        try:
            self.tool_manager.delete_tool("non_existent_tool")
        except Exception as e:
            self.fail(f"delete_tool raised an unexpected exception: {e}")
    
    def test_error_handling(self):
        # Test error handling for get_tools with invalid JSON
        with open(self.test_tools_file, "w") as f:
            f.write("invalid json")
        
        tools = self.tool_manager.get_tools()
        self.assertEqual(tools, {})
        
        # Test error handling for save_tool with write permission issues
        os.chmod(self.test_tools_file, 0o444)  # Make file read-only
        try:
            self.tool_manager.save_tool("test_tool2", {"test": "data"})
            # Even though the save operation fails, it should not raise an exception
        except Exception as e:
            self.fail(f"save_tool raised an unexpected exception: {e}")
        finally:
            os.chmod(self.test_tools_file, 0o644)  # Restore write permissions


if __name__ == "__main__":
    unittest.main()