class ToolProperty:
    def __init__(self, name: str, type: str, description: str = "", enum: list = [], required: bool = False):
        self.name = name
        self.type = type
        self.description = description
        self.enum = enum
        self.required = required

    def to_dict(self):
        return {
            "type": self.type,
            "name": self.name,
            "description": self.description,
            "enum": self.enum,
            "required": self.required,
        }