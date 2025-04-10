#!./.venv/bin/python
import traceback
import sys
from internal.logger_config import setup_logging

# Set up logging before any other imports
logger = setup_logging()

# Now import Tui after logging is configured
from internal.tui import Tui


def main():
    print("Forged Heroes: The Forge is now active.")
    logger.info("Application starting")
    
    tui = Tui()
    try:
        tui.start()
    except KeyboardInterrupt:
        logger.info("Application terminated by user (KeyboardInterrupt)")
        print("\nExiting...")
        tui.stop()
    except Exception as e:
        error_details = traceback.format_exc()
        logger.critical(f"Unhandled exception: {e}\n{error_details}")
        print(f"A critical error occurred: {e}")
        tui.stop()
        return 1
    
    logger.info("Application exited normally")
    return 0


if __name__ == "__main__":
    sys.exit(main())
