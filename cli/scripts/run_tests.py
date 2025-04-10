import os
import sys
import subprocess

# Add the project root to the Python module search path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

if __name__ == "__main__":
    # Run tests using 'python -m unittest discover internal'
    result = subprocess.run([sys.executable, "-m", "unittest", "discover", "internal"], check=False)

    # Exit with the same status as the test run
    sys.exit(result.returncode)