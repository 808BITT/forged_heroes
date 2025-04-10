from textual.widgets import Select

# Define the folder options somewhere in your code
folder_options = [("Folder 1", "folder1"), ("Folder 2", "folder2")]

# Find the Select widget with id='folder-select' and modify it
folder_select = Select(
    id="folder-select",
    options=[("Choose a folder", "placeholder")] + folder_options,  # Use placeholder instead of empty string
    allow_blank=True
)

def on_mount(self) -> None:
    """Handle the mount event."""
    super().on_mount()
    
    # Make sure to populate options before the Select widget tries to use them
    folder_select = self.query_one("#folder-select", Select)
    
    # Populate with at least one option before it's mounted/accessed
    if not folder_select.options:
        folder_options = self._get_folder_options()  # Method to get your folders
        folder_select.set_options(folder_options)
        
        # If folders are available, set the first one as default
        if folder_options:
            folder_select.value = folder_options[0][1]
        else:
            # If no folders available, you might need to handle this case
            # by showing a message or disabling certain functionality
            pass

def _get_folder_options(self) -> list[tuple[str, str]]:
    """Get folder options for the select widget."""
    # Your existing folder gathering logic
    folders = []  # Replace with your actual folder retrieval code
    return [(folder, folder) for folder in folders] or [("Default Folder", "default")]