"""
Tool Wizard screen for guided tool specification creation and editing.
"""

import os
import json
from textual.screen import ModalScreen
from textual.widgets import Button, Static, Input, Label, DirectoryTree
from textual.containers import Container, Horizontal, Vertical
from textual.binding import Binding
from textual.app import ComposeResult

from internal.tui.screens.property_editor import PropertyEditor
from internal.tui.dialogs.error import ErrorDialog
from internal.tui.dialogs.file import SaveFileDialog

class ToolWizard(ModalScreen):
    """A wizard-based screen for creating or editing tool specifications."""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
        Binding("f1", "save", "Save"),
    ]
    
    def __init__(self, filepath=None, tool_data=None):
        super().__init__()
        self.filepath = filepath
        self.is_new = filepath is None
        
        # Initialize tool data structure
        if tool_data:
            self.tool_data = tool_data
        else:
            self.tool_data = {
                "type": "function",
                "function": {
                    "name": "",
                    "description": "",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            }
        
        self.title = "Create New Tool" if self.is_new else f"Edit: {os.path.basename(filepath)}"
        self.properties = self.tool_data["function"]["parameters"]["properties"]
        self.required = self.tool_data["function"]["parameters"]["required"]
    
    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.title, classes="editor-title"),
            Vertical(
                # Tool basic information section
                Static("Basic Information", classes="section-title"),
                Horizontal(
                    Label("Tool Name:"), 
                    Input(value=self.tool_data["function"]["name"], id="tool-name"),
                    classes="form-row"
                ),
                Horizontal(
                    Label("Description:"), 
                    Input(value=self.tool_data["function"]["description"], id="tool-description"),
                    classes="form-row"
                ),
                
                # Parameters section
                Static("Parameters", classes="section-title"),
                Vertical(id="parameters-list"),
                
                Horizontal(
                    Button("Add Parameter", id="add-param-btn"),
                    classes="form-row"
                ),
                
                # Action buttons
                Horizontal(
                    Button("Generate JSON", id="generate-json-btn", variant="primary"),
                    Button("Cancel", id="cancel-wizard-btn"),
                    classes="editor-buttons"
                ),
                id="wizard-form"
            ),
            classes="wizard-modal"
        )
    
    def on_mount(self):
        """Load existing properties when the screen is mounted."""
        self.refresh_params_list()
    
    def refresh_params_list(self):
        """Refresh the parameters list display."""
        params_container = self.query_one("#parameters-list")
        params_container.remove_children()
        
        if not self.properties:
            params_container.mount(Static("No parameters defined. Click 'Add Parameter' to add one.", classes="empty-list"))
            return
        
        for name, prop in self.properties.items():
            required = name in self.required
            params_container.mount(
                Horizontal(
                    Static(f"{name} ({prop['type']})", classes="param-name"),
                    Static("*" if required else "", classes="param-required"),
                    Button("Edit", classes="edit-param-btn", id=f"edit-{name}"),
                    Button("Delete", classes="delete-param-btn", id=f"delete-{name}"),
                    classes="param-row"
                )
            )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        
        if button_id == "add-param-btn":
            self.add_parameter()
        elif button_id == "generate-json-btn":
            self.generate_json()
        elif button_id == "cancel-wizard-btn":
            self.action_cancel()
        elif button_id.startswith("edit-"):
            param_name = button_id[5:]
            self.edit_parameter(param_name)
        elif button_id.startswith("delete-"):
            param_name = button_id[7:]
            self.delete_parameter(param_name)
    
    def add_parameter(self):
        """Add a new parameter to the tool."""
        def handle_result(result):
            if result:
                param_name = result["name"]
                param_required = result["required"]
                
                # Create the property object for the parameters
                param_dict = {
                    "type": result["type"],
                    "description": result["description"]
                }
                
                if result["enum"]:
                    param_dict["enum"] = result["enum"]
                
                # Add to properties dict
                self.properties[param_name] = param_dict
                
                # Add to required list if required
                if param_required and param_name not in self.required:
                    self.required.append(param_name)
                
                # Refresh the display
                self.refresh_params_list()
        
        self.app.push_screen(PropertyEditor(), handle_result)
    
    def edit_parameter(self, param_name):
        """Edit an existing parameter."""
        prop = self.properties.get(param_name, {})
        property_data = {
            "name": param_name,
            "type": prop.get("type", "string"),
            "description": prop.get("description", ""),
            "required": param_name in self.required,
            "enum": prop.get("enum", [])
        }
        
        def handle_result(result):
            if result:
                # Remove old property if name changed
                if result["name"] != param_name:
                    del self.properties[param_name]
                    if param_name in self.required:
                        self.required.remove(param_name)
                
                # Add the new property
                new_param_name = result["name"]
                self.properties[new_param_name] = {
                    "type": result["type"],
                    "description": result["description"]
                }
                
                if result["enum"]:
                    self.properties[new_param_name]["enum"] = result["enum"]
                
                # Update required list
                if result["required"] and new_param_name not in self.required:
                    self.required.append(new_param_name)
                elif not result["required"] and new_param_name in self.required:
                    self.required.remove(new_param_name)
                
                # Refresh the display
                self.refresh_params_list()
        
        self.app.push_screen(PropertyEditor(property_data, True), handle_result)
    
    def delete_parameter(self, param_name):
        """Delete a parameter from the tool."""
        if param_name in self.properties:
            del self.properties[param_name]
            
            if param_name in self.required:
                self.required.remove(param_name)
            
            self.refresh_params_list()
    
    def generate_json(self):
        """Generate JSON from the form data and proceed to save."""
        # Update the tool data from form fields
        tool_name = self.query_one("#tool-name").value
        tool_description = self.query_one("#tool-description").value
        
        if not tool_name:
            self.app.push_screen(
                ErrorDialog("Tool name cannot be empty."),
                lambda _: None
            )
            return
        
        self.tool_data["function"]["name"] = tool_name
        self.tool_data["function"]["description"] = tool_description
        
        # Convert the tool data to JSON
        try:
            json_content = json.dumps(self.tool_data, indent=2)
            
            if self.is_new:
                # For new files, ask for a file path
                def handle_save_result(result):
                    # Important: Pop this screen first to prevent freezing
                    self.app.pop_screen()
                
                self.app.push_screen(
                    SaveFileDialog(json_content, tool_name),
                    handle_save_result
                )
            else:
                # For existing files, save directly
                with open(self.filepath, "w") as f:
                    f.write(json_content)
                self.app.pop_screen()
                # Refresh the directory tree
                self.app.query_one(DirectoryTree).reload()
        except Exception as e:
            self.app.push_screen(
                ErrorDialog(f"Error generating JSON: {e}"),
                lambda _: None
            )
    
    def action_cancel(self) -> None:
        """Cancel editing and close the modal."""
        self.app.pop_screen()
    
    def action_save(self) -> None:
        """Shortcut to generate JSON."""
        self.generate_json()