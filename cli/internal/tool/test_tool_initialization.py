import unittest
from internal.tool.tool import Tool
from internal.tool.parameter import ToolParams, ToolProperty

class TestToolInitialization(unittest.TestCase):
    # ...existing code...

    def test_tool_initialization_with_valid_data(self):
        tool = Tool(name="example_tool", description="An example tool")
        self.assertEqual(tool.name, "example_tool")
        self.assertEqual(tool.description, "An example tool")
        self.assertIsInstance(tool.parameters, ToolParams)

    def test_add_property_to_tool(self):
        tool = Tool(name="example_tool", description="An example tool")
        tool.parameters.add_property(
            "example_param",
            ToolProperty(
                name="example_param",
                type="string",
                description="An example parameter",
                required=True
            )
        )
        self.assertIn("example_param", tool.parameters.properties)
        self.assertEqual(tool.parameters.properties["example_param"].type, "string")

    def test_tool_execution_with_missing_parameters(self):
        tool = Tool(name="example_tool", description="An example tool")
        with self.assertRaises(ValueError):
            tool.execute({})  # Missing required parameters

    def test_tool_execution_with_valid_parameters(self):
        tool = Tool(name="example_tool", description="An example tool")
        tool.parameters.add_property(
            "example_param",
            ToolProperty(
                name="example_param",
                type="string",
                description="An example parameter",
                required=True
            )
        )
        result = tool.execute({"example_param": "test_value"})
        self.assertIsNotNone(result)  # Replace with actual execution logic