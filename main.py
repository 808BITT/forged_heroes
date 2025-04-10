#!./.venv/bin/python
from internal.tui import Tui


def main():
    print("Forged Heroes: The Forge is now active.")
    tui = Tui()
    try:
        tui.start()
    except KeyboardInterrupt:
        print("\nExiting...")
        tui.stop()
    except Exception as e:
        print(f"An error occurred: {e}")
        tui.stop()


if __name__ == "__main__":
    main()
