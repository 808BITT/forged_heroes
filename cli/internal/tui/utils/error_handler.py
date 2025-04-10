"""
Error handling utilities for the TUI.
"""

import logging
import traceback
from functools import wraps

logger = logging.getLogger(__name__)

def show_error_dialog(app, message, callback=None):
    """Show an error dialog with the given message."""
    from internal.tui.dialogs.error import ErrorDialog
    
    if callback is None:
        callback = lambda _: None
    
    app.push_screen(
        ErrorDialog(message),
        callback
    )

def handle_errors(method=None, *, show_dialog=True):
    """
    Decorator to handle errors in methods.
    
    Args:
        method: The method to decorate.
        show_dialog: Whether to show an error dialog.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            try:
                return func(self, *args, **kwargs)
            except Exception as e:
                error_details = traceback.format_exc()
                logger.error(f"Error in {func.__name__}: {e}\n{error_details}")
                
                if show_dialog and hasattr(self, 'app'):
                    show_error_dialog(
                        self.app, 
                        f"An error occurred: {e}"
                    )
                return None
                
        return wrapper
        
    if method is not None:
        return decorator(method)
    return decorator
