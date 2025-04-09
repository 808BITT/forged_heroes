"""
Property editor screen for editing tool parameters.
"""

from textual.screen import ModalScreen
from textual.widgets import Button, Static, Input, Select, Label, Switch
from textual.containers import Container, Horizontal, Vertical
from textual.app import ComposeResult

from internal.tui.dialogs.error import ErrorDialog

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