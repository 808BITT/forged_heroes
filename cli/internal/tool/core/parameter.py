from internal.tool.core.property import ToolProperty

class ToolParams:
    def __init__(self, type: str = "object", properties: dict = None, required: list = None):
        self.type = type
        self.properties = properties or {}
        self.required = required or []

    def to_dict(self):
        return {
            "type": self.type,
            "properties": {name: prop.to_dict() for name, prop in self.properties.items()},
            "required": self.required,
        }

    def add_property(self, name: str, prop: ToolProperty):
        self.properties[name] = prop
        if prop.required:
            self.required.append(name)
