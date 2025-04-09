import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

import unittest
from internal.tool.core.parameter import ToolProperty, ToolParams

class TestToolProperty(unittest.TestCase):
    def test_tool_property_creation(self):
        prop = ToolProperty(name="test_name", type="string", description="test description")
        self.assertEqual(prop.name, "test_name")
        self.assertEqual(prop.type, "string")
        self.assertEqual(prop.description, "test description")

    def test_tool_property_to_dict(self):
        prop = ToolProperty(name="test_name", type="string", description="test description")
        expected = {
            "type": "string",
            "name": "test_name",
            "description": "test description",
            "enum": [],
            "required": False,
        }
        self.assertEqual(prop.to_dict(), expected)

class TestToolParams(unittest.TestCase):
    def test_tool_params_creation(self):
        params = ToolParams(type="object", properties={}, required=[])
        self.assertEqual(params.type, "object")
        self.assertEqual(params.properties, {})
        self.assertEqual(params.required, [])

    def test_tool_params_to_dict(self):
        prop1 = ToolProperty(name="name1", type="string")
        prop2 = ToolProperty(name="name2", type="integer", required=True)
        params = ToolParams(properties={"name1": prop1, "name2": prop2}, required=["name2"])
        expected = {
            "type": "object",
            "properties": {
                "name1": {
                    "type": "string",
                    "name": "name1",
                    "description": "",
                    "enum": [],
                    "required": False,
                },
                "name2": {
                    "type": "integer",
                    "name": "name2",
                    "description": "",
                    "enum": [],
                    "required": True,
                },
            },
            "required": ["name2"],
        }
        self.assertEqual(params.to_dict(), expected)

if __name__ == '__main__':
    unittest.main()
