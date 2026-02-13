import subprocess
import sys
import tempfile
import os


class CodeRunner:
    def __init__(self, timeout: int = 30):
        self.timeout = timeout

    def execute(self, code: str) -> dict:
        """Execute Python code in a sandboxed subprocess."""
        # Create temp file, close it, then write — avoids Windows file locking
        fd, filepath = tempfile.mkstemp(suffix=".py", text=True)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(code)

            result = subprocess.run(
                [sys.executable, filepath],
                capture_output=True,
                text=True,
                timeout=self.timeout,
                cwd=tempfile.gettempdir(),
            )
            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr,
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "output": "", "error": f"Timeout ({self.timeout}s)"}
        except Exception as e:
            return {"success": False, "output": "", "error": str(e)}
        finally:
            try:
                os.unlink(filepath)
            except OSError:
                pass
