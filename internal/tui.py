from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, DirectoryTree, Static, Input, Button, TextArea, Select, Label, Switch, RadioSet, RadioButton
from textual.containers import Container, Horizontal, Vertical
from textual.binding import Binding
from textual.screen import ModalScreen, Screen
from rich.syntax import Syntax
import os
import json
from pathlib import Path

from internal.tool.tool import Tool
from internal.tool.parameter import ToolParams
from internal.tool.property import ToolProperty

# Root directory for tool specifications
TOOL_SPECS_DIR = "tool_specs"

class ToolEditor(ModalScreen):
    """A modal screen for editing or creating tool specifications."""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
        Binding("f1", "save", "Save"),
    ]
    
    def __init__(self, filepath=None, content=None):
        super().__init__()
        self.filepath = filepath
        self.content = content
        self.is_new = filepath is None
        self.title = "Create New Tool" if self.is_new else f"Edit: {os.path.basename(filepath)}"

    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.title, classes="editor-title"),
            TextArea(self.content or self.get_template(), language="json", id="tool-editor"),
            Horizontal(
                Button("Save", id="save-btn", variant="primary"),
                Button("Cancel", id="cancel-btn"),
                classes="editor-buttons"
            ),
            classes="editor-modal"
        )
        
    def get_template(self):
        """Return a template for a new tool specification."""
        return '''{
    "type": "function",
    "function": {
        "name": "tool_name",
        "description": "Tool description",
        "parameters": {
            "type": "object",
            "properties": {
                "param_name": {
                    "type": "string",
                    "description": "Parameter description"
                }
            },
            "required": ["param_name"]
        }
    }
}'''

    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "save-btn":
            self.action_save()
        elif button_id == "cancel-btn":
            self.action_cancel()
    
    def action_cancel(self) -> None:
        """Cancel editing and close the modal."""
        self.app.pop_screen()
    
    def action_save(self) -> None:
        """Save the tool specification and close the modal."""
        content = self.query_one("#tool-editor").text
        
        try:
            # Validate JSON
            json_content = json.loads(content)
            
            if self.is_new:
                # For new files, ask for a file path
                self.app.push_screen(
                    SaveFileDialog(content),
                    lambda result: self.app.pop_screen() if result else None
                )
            else:
                # For existing files, save directly
                with open(self.filepath, "w") as f:
                    f.write(content)
                self.app.pop_screen()
                # Refresh the directory tree
                self.app.query_one(DirectoryTree).reload()
        except json.JSONDecodeError:
            self.app.push_screen(
                ErrorDialog("Invalid JSON. Please fix the errors before saving."),
                lambda _: None
            )

class SaveFileDialog(ModalScreen):
    """Dialog for saving a new file."""
    
    def __init__(self, content, tool_name=""):
        super().__init__()
        self.content = content
        self.tool_name = tool_name
        self.folders = self.get_folders()
        
    def get_folders(self):
        """Get existing folders in tool_specs directory."""
        folders = [""]  # Root directory
        try:
            for item in os.listdir(TOOL_SPECS_DIR):
                item_path = os.path.join(TOOL_SPECS_DIR, item)
                if os.path.isdir(item_path):
                    folders.append(item)
        except Exception:
            pass
        return folders
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static("Save Tool Specification", classes="editor-title"),
            Horizontal(
                Label("Folder:"),
                Select([(folder, folder or "(root)") for folder in self.folders], value="", id="folder-select"),
                Button("New Folder", id="new-folder-btn"),
                classes="form-row save-form-row"
            ),
            Horizontal(
                Label("Filename:"),
                Input(value=f"{self.tool_name}.json" if self.tool_name else "", placeholder="filename.json", id="filename-input"),
                classes="form-row save-form-row"
            ),
            Horizontal(
                Button("Save", id="save-file-btn", variant="primary"),
                Button("Cancel", id="cancel-file-btn"),
                classes="dialog-buttons"
            ),
            classes="save-file-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        
        if button_id == "new-folder-btn":
            self.app.push_screen(
                NewFolderDialog(),
                self.handle_new_folder
            )
        elif button_id == "save-file-btn":
            self.save_file()
        elif button_id == "cancel-file-btn":
            self.dismiss(False)
            
    def handle_new_folder(self, folder_name):
        """Handle result from new folder dialog."""
        if folder_name:
            # Update the folder select with the new folder
            select = self.query_one("#folder-select")
            select.add_option((folder_name, folder_name))
            select.value = folder_name
    
    def save_file(self):
        """Save the file with proper name handling."""
        folder = self.query_one("#folder-select").value
        filename = self.query_one("#filename-input").value
        
        if not filename:
            self.app.push_screen(
                ErrorDialog("Filename cannot be empty."),
                lambda _: None
            )
            return
                
        # Add .json extension if not present
        if not filename.endswith(".json"):
            filename += ".json"
                
        # Construct the full path
        folder_path = os.path.join(TOOL_SPECS_DIR, folder) if folder else TOOL_SPECS_DIR
        filepath = os.path.join(folder_path, filename)
        
        # Create directory if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)
        
        # Check if file already exists and auto-increment if needed
        base_name, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(filepath):
            new_filename = f"{base_name}_{counter}{ext}"
            filepath = os.path.join(folder_path, new_filename)
            counter += 1
                
        # Save the file
        with open(filepath, "w") as f:
            f.write(self.content)
                
        self.dismiss(True)
        # Refresh the directory tree
        self.app.query_one(DirectoryTree).reload()

class NewFolderDialog(ModalScreen):
    """Dialog for creating a new folder."""
    
    def compose(self) -> ComposeResult:
        yield Container(
            Static("Create New Folder", classes="editor-title"),
            Horizontal(
                Label("Folder Name:"), 
                Input(placeholder="folder_name", id="folder-name-input"),
                classes="form-row"
            ),
            Horizontal(
                Button("Create", id="create-folder-btn", variant="primary"),
                Button("Cancel", id="cancel-folder-btn"),
                classes="dialog-buttons"
            ),
            classes="new-folder-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "create-folder-btn":
            folder_name = self.query_one("#folder-name-input").value
            
            if not folder_name:
                self.app.push_screen(
                    ErrorDialog("Folder name cannot be empty."),
                    lambda _: None
                )
                return
                
            # Create the folder
            try:
                folder_path = os.path.join(TOOL_SPECS_DIR, folder_name)
                os.makedirs(folder_path, exist_ok=True)
                self.dismiss(folder_name)
            except Exception as e:
                self.app.push_screen(
                    ErrorDialog(f"Error creating folder: {e}"),
                    lambda _: None
                )
        elif button_id == "cancel-folder-btn":
            self.dismiss(None)

class DeleteConfirmDialog(ModalScreen):
    """Confirmation dialog for deleting files."""
    
    def __init__(self, filepath):
        super().__init__()
        self.filepath = filepath
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(f"Are you sure you want to delete {self.filepath}?", classes="confirm-text"),
            Horizontal(
                Button("Delete", id="confirm-delete-btn", variant="error"),
                Button("Cancel", id="cancel-delete-btn"),
                classes="dialog-buttons"
            ),
            classes="confirm-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "confirm-delete-btn":
            try:
                os.remove(self.filepath)
                self.dismiss(True)
                # Refresh the directory tree
                self.app.query_one(DirectoryTree).reload()
            except OSError as e:
                self.app.push_screen(
                    ErrorDialog(f"Error deleting file: {e}"),
                    lambda _: None
                )
        elif button_id == "cancel-delete-btn":
            self.dismiss(False)

class ErrorDialog(ModalScreen):
    """A simple error dialog."""
    
    def __init__(self, message):
        super().__init__()
        self.message = message
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.message, classes="error-text"),
            Button("OK", id="error-ok-btn"),
            classes="error-dialog"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "error-ok-btn":
            self.dismiss(True)

class HelpScreen(Screen):
    """Help screen with keybindings and usage information."""
    
    BINDINGS = [
        Binding("escape", "app.pop_screen", "Go Back"),
    ]
    
    def compose(self) -> ComposeResult:
        help_text = """
# Forged Heroes Tool Manager

## Keybindings
- F1: Create a new tool specification
- F2: Edit the selected tool specification
- F3: Delete the selected tool specification
- F4: View the selected tool specification
- F5: Refresh the file list
- F10: Show this help
- Escape: Close dialogs or help screen

## Navigation
- Use arrow keys to navigate the file list
- Enter to select a tool specification for viewing

## Tool Specifications
Tools are stored in the `tool_specs` directory and are organized by folders.
Each tool is a JSON file with a specific structure.
"""
        yield Container(
            Static(help_text, markup=True),
            classes="help-container"
        )

class PropertyEditor(ModalScreen):
    """A modal screen for editing a property of a tool."""
    
    def __init__(self, property_data=None, edit_mode=False):
        super().__init__()
        self.property_data = property_data or {}
        self.edit_mode = edit_mode
        self.title = "Edit Property" if edit_mode else "Add Property"
        
    def compose(self) -> ComposeResult:
        yield Container(
            Static(self.title, classes="editor-title"),
            Vertical(
                Horizontal(
                    Label("Name:"), 
                    Input(value=self.property_data.get("name", ""), id="prop-name"),
                    classes="form-row"
                ),
                Horizontal(
                    Label("Type:"), 
                    Select(
                        [(t, t) for t in ["string", "number", "integer", "boolean", "array", "object"]],
                        value=self.property_data.get("type", "string"),
                        id="prop-type"
                    ),
                    classes="form-row"
                ),
                Horizontal(
                    Label("Description:"), 
                    Input(value=self.property_data.get("description", ""), id="prop-description"),
                    classes="form-row"
                ),
                Horizontal(
                    Label("Required:"), 
                    Switch(value=self.property_data.get("required", False), id="prop-required"),
                    classes="form-row"
                ),
                Horizontal(
                    Label("Enum Values (comma-separated):"), 
                    Input(value=",".join(self.property_data.get("enum", [])), id="prop-enum"),
                    classes="form-row"
                ),
                Horizontal(
                    Button("Save", id="save-prop-btn", variant="primary"),
                    Button("Cancel", id="cancel-prop-btn"),
                    classes="dialog-buttons"
                ),
                id="property-form"
            ),
            classes="editor-modal"
        )
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        if button_id == "save-prop-btn":
            prop_name = self.query_one("#prop-name").value
            prop_type = self.query_one("#prop-type").value
            prop_description = self.query_one("#prop-description").value
            prop_required = self.query_one("#prop-required").value
            prop_enum_text = self.query_one("#prop-enum").value
            
            # Validate inputs
            if not prop_name:
                self.app.push_screen(
                    ErrorDialog("Property name cannot be empty."),
                    lambda _: None
                )
                return
            
            prop_enum = []
            if prop_enum_text:
                prop_enum = [item.strip() for item in prop_enum_text.split(",")]
            
            # Collect property data
            property_data = {
                "name": prop_name,
                "type": prop_type,
                "description": prop_description,
                "required": prop_required,
                "enum": prop_enum
            }
            
            self.dismiss(property_data)
        elif button_id == "cancel-prop-btn":
            self.dismiss(None)

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

class Tui(App):
    """A TUI application for managing tool specifications."""
    
    TITLE = "Forged Heroes: Tool Manager"
    SUB_TITLE = "Create, Edit, and Delete Tools for your Heroes"
    CSS_PATH = "tui.css"
    
    BINDINGS = [
        Binding("f1", "new_tool", "New Tool"),
        Binding("f2", "edit_tool", "Edit Tool"),
        Binding("f3", "delete_tool", "Delete Tool"),
        Binding("f4", "view_tool", "View Tool"),
        Binding("f5", "refresh", "Refresh"),
        Binding("f10", "help", "Help"),
        Binding("q", "quit", "Quit"),
    ]
    
    def __init__(self):
        super().__init__()
        self.running = True
        # Create tool_specs directory if it doesn't exist
        os.makedirs(TOOL_SPECS_DIR, exist_ok=True)
        
    def compose(self) -> ComposeResult:
        """Create child widgets for the app."""
        yield Header()
        yield Container(
            DirectoryTree(TOOL_SPECS_DIR, id="file-tree"),
            Container(
                Static("Select a tool specification to view", id="preview-title"),
                Static("", id="preview-content"),
                id="preview-container"
            ),
            id="main-container"
        )
        yield Footer()
        
    def on_mount(self) -> None:
        """Event handler called when the app is mounted."""
        # Focus on the directory tree initially
        self.query_one(DirectoryTree).focus()
        
    def action_new_tool(self) -> None:
        """Create a new tool specification."""
        self.push_screen(ToolWizard())
        
    def action_edit_tool(self) -> None:
        """Edit the selected tool specification."""
        tree = self.query_one(DirectoryTree)
        node = tree.cursor_node
        
        if node is None:
            self.push_screen(
                ErrorDialog("Please select a tool specification file to edit."),
                lambda _: None
            )
            return
            
        filepath = str(node.data.path)
        if not os.path.isfile(filepath) or not filepath.endswith(".json"):
            self.push_screen(
                ErrorDialog("Only JSON files can be edited."),
                lambda _: None
            )
            return
            
        try:
            with open(filepath, "r") as f:
                content = f.read()
                json_data = json.loads(content)
            self.push_screen(ToolWizard(filepath, json_data))
        except json.JSONDecodeError:
            self.push_screen(
                ErrorDialog("The selected file contains invalid JSON."),
                lambda _: None
            )
        except Exception as e:
            self.push_screen(
                ErrorDialog(f"Error opening file: {e}"),
                lambda _: None
            )
            
    def action_delete_tool(self) -> None:
        """Delete the selected tool specification."""
        tree = self.query_one(DirectoryTree)
        node = tree.cursor_node
        
        if node is None:
            self.push_screen(
                ErrorDialog("Please select a tool specification file to delete."),
                lambda _: None
            )
            return
            
        filepath = str(node.data.path)
        if not os.path.isfile(filepath) or not filepath.endswith(".json"):
            self.push_screen(
                ErrorDialog("Only JSON files can be deleted."),
                lambda _: None
            )
            return
            
        self.push_screen(DeleteConfirmDialog(filepath))
        
    def action_view_tool(self) -> None:
        """View the selected tool specification."""
        tree = self.query_one(DirectoryTree)
        node = tree.cursor_node
        
        if node is None:
            return
            
        filepath = str(node.data.path)
        if not os.path.isfile(filepath) or not filepath.endswith(".json"):
            return
            
        try:
            with open(filepath, "r") as f:
                content = f.read()
                
            # Format the JSON for display
            try:
                json_obj = json.loads(content)
                formatted_json = json.dumps(json_obj, indent=2)
                syntax = Syntax(formatted_json, "json", theme="monokai", line_numbers=True)
                
                # Update the preview
                self.query_one("#preview-title").update(f"File: {os.path.basename(filepath)}")
                self.query_one("#preview-content").update(syntax)
            except json.JSONDecodeError:
                # If JSON is invalid, just show as raw text
                self.query_one("#preview-title").update(f"File: {os.path.basename(filepath)} (Invalid JSON)")
                self.query_one("#preview-content").update(content)
        except Exception as e:
            self.query_one("#preview-title").update("Error")
            self.query_one("#preview-content").update(f"Error reading file: {e}")
            
    def action_refresh(self) -> None:
        """Refresh the file list."""
        self.query_one(DirectoryTree).reload()
        
    def action_help(self) -> None:
        """Show the help screen."""
        self.push_screen(HelpScreen())
        
    def action_quit(self) -> None:
        """Quit the application."""
        self.stop()
        
    def on_directory_tree_file_selected(self, event):
        """Handler for file selection event."""
        self.action_view_tool()

    def start(self):
        """Start the TUI application."""
        self.run()

    def stop(self):
        """Stop the TUI application."""
        self.running = False
        self.exit()
