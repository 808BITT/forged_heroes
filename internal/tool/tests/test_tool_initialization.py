import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import unittest
import json
from internal.tool.core.parameter import ToolParams, ToolProperty
from internal.tool.core.tool import Tool


class TestToolInitialization(unittest.TestCase):
    def test_tool_params_with_initial_properties(self):
        """Test creating ToolParams with initial properties"""
        tool_params = ToolParams(
            properties={
                "location": ToolProperty(
                    name="location",
                    type="string",
                    description="The location to get the weather for, e.g. San Francisco, CA",
                    required=True
                ),
                "format": ToolProperty(
                    name="format",
                    type="string",
                    description="The format to return the weather in, e.g. 'celsius' or 'fahrenheit'",
                    enum=["celsius", "fahrenheit"],
                    required=True
                )
            },
            required=["location", "format"]
        )
        
        # Verify properties were added correctly
        self.assertEqual(len(tool_params.properties), 2)
        self.assertIn("location", tool_params.properties)
        self.assertIn("format", tool_params.properties)
        
        # Verify required fields
        self.assertEqual(tool_params.required, ["location", "format"])
        
        # Verify enum values
        self.assertEqual(tool_params.properties["format"].enum, ["celsius", "fahrenheit"])

    def test_tool_params_add_property(self):
        """Test adding properties to ToolParams after initialization"""
        tool_params = ToolParams()
        
        # Add a property
        tool_params.add_property(
            name="api_key",
            prop=ToolProperty(
                name="api_key",
                type="string",
                description="API key for authentication",
                required=True
            )
        )
        
        # Verify property was added correctly
        self.assertIn("api_key", tool_params.properties)
        self.assertEqual(tool_params.properties["api_key"].type, "string")
        self.assertEqual(tool_params.properties["api_key"].description, "API key for authentication")
        
        # Verify required field was updated
        self.assertIn("api_key", tool_params.required)

    def test_tool_params_to_dict_full_example(self):
        """Test converting a complex ToolParams object to dict"""
        # Create a tool params object similar to weather API example
        tool_params = ToolParams(
            properties={
                "location": ToolProperty(
                    name="location",
                    type="string",
                    description="The location to get the weather for, e.g. San Francisco, CA",
                    required=True
                ),
                "format": ToolProperty(
                    name="format",
                    type="string",
                    description="The format to return the weather in",
                    enum=["celsius", "fahrenheit"],
                    required=True
                )
            },
            required=["location", "format"]
        )
        
        # Add another property after initialization
        tool_params.add_property(
            name="api_key",
            prop=ToolProperty(
                name="api_key",
                type="string",
                description="API key for authentication",
                required=True
            )
        )
        
        # Convert to dict and verify
        params_dict = tool_params.to_dict()
        self.assertEqual(params_dict["type"], "object")
        self.assertEqual(len(params_dict["properties"]), 3)
        self.assertIn("location", params_dict["properties"])
        self.assertIn("format", params_dict["properties"])
        self.assertIn("api_key", params_dict["properties"])
        
        # Verify required fields in the dict
        self.assertEqual(sorted(params_dict["required"]), sorted(["location", "format", "api_key"]))


class TestToolClass(unittest.TestCase):
    def test_tool_initialization(self):
        """Test basic tool initialization"""
        tool = Tool(name="get_weather", description="Get the current weather")
        
        # Verify basic properties
        self.assertEqual(tool.name, "get_weather")
        self.assertEqual(tool.description, "Get the current weather")
        self.assertEqual(tool.type, "function")
        
        # Verify empty parameters
        self.assertIsInstance(tool.parameters, ToolParams)
        self.assertEqual(len(tool.parameters.properties), 0)

    def test_tool_representation(self):
        """Test tool string representations"""
        tool = Tool(name="get_weather", description="Get the current weather")
        
        # Test __repr__
        self.assertEqual(repr(tool), "Tool(name=get_weather, description=Get the current weather)")
        
        # Test __str__
        self.assertEqual(str(tool), "get_weather: Get the current weather")

    def test_tool_with_parameters(self):
        """Test adding parameters to a tool"""
        # Create a tool
        tool = Tool(name="get_weather", description="Get the current weather")
        
        # Define parameters for the tool
        location_prop = ToolProperty(
            name="location",
            type="string",
            description="The location to get weather for",
            required=True
        )
        
        # Add the parameter to the tool
        tool.parameters.add_property("location", location_prop)
        
        # Verify the parameter was added
        self.assertIn("location", tool.parameters.properties)
        self.assertEqual(tool.parameters.properties["location"].type, "string")
        self.assertEqual(tool.parameters.required, ["location"])


if __name__ == '__main__':
    unittest.main()