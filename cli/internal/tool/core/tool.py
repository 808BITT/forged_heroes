from internal.tool.core.parameter import ToolParams


class Tool:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.type = "function"  # Default type
        self.parameters = ToolParams()

    def __repr__(self):
        return f"Tool(name={self.name}, description={self.description})"

    def __str__(self):
        return f"{self.name}: {self.description}"

    def execute(self, params: dict):
        # Validate required parameters
        for param_name in self.parameters.required:
            if param_name not in params:
                raise ValueError(f"Missing required parameter: {param_name}")

        # Example execution logic (to be replaced with actual logic)
        return f"Executed {self.name} with parameters: {params}"