from talocode_screenlane.client import build_local_command
from talocode_screenlane import __version__


def test_version():
    assert __version__ == "0.1.2"


def test_build_local_command_debug():
    cmd = build_local_command(
        "Fix this error",
        "TypeError: boom at app.ts:1",
        target="codra",
    )
    assert cmd["intent"] == "debug_error"
    assert "Fix this error" in cmd["prompt"]
    assert cmd["offline"] is True


def test_build_local_command_explain():
    cmd = build_local_command("Explain this page", "Hello docs", target="stdout")
    assert cmd["intent"] == "explain"
