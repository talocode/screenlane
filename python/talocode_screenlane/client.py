from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any, Optional


class ScreenLaneError(Exception):
    def __init__(self, message: str, status: Optional[int] = None):
        super().__init__(message)
        self.status = status


class ScreenLaneClient:
    """HTTP client for a local ScreenLane server + local helpers."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
    ) -> None:
        # Local ScreenLane server by default; cloud is https://api.talocode.site
        self.base_url = (
            base_url
            or os.environ.get("SCREENLANE_API_BASE_URL")
            or os.environ.get("TALOCODE_API_BASE_URL")
            or os.environ.get("TALOCODE_BASE_URL")
            or "http://127.0.0.1:3070"
        ).rstrip("/")
        self.api_key = api_key or os.environ.get("TALOCODE_API_KEY")
        self.timeout = timeout

    def _request(self, method: str, path: str, body: Any = None) -> Any:
        url = f"{self.base_url}{path}"
        data = None if body is None else json.dumps(body).encode("utf-8")
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["X-Talocode-Api-Key"] = self.api_key
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="replace")
            raise ScreenLaneError(f"HTTP {e.code}: {detail[:300]}", status=e.code) from e
        except urllib.error.URLError as e:
            raise ScreenLaneError(
                f"Cannot reach ScreenLane at {self.base_url}: {e.reason}. "
                "Start the server with `screenlane serve`."
            ) from e

    def health(self) -> Any:
        return self._request("GET", "/v1/screenlane/health")

    def doctor(self) -> Any:
        return self._request("GET", "/v1/screenlane/doctor")

    def capture(self, payload: Optional[dict] = None) -> Any:
        return self._request("POST", "/v1/screenlane/capture", payload or {})

    def dictate(self, payload: Optional[dict] = None) -> Any:
        return self._request("POST", "/v1/screenlane/dictate", payload or {})

    def command(self, payload: Optional[dict] = None) -> Any:
        return self._request("POST", "/v1/screenlane/command", payload or {})

    def send(self, payload: Optional[dict] = None) -> Any:
        return self._request("POST", "/v1/screenlane/send", payload or {})

    def list_contexts(self) -> Any:
        return self._request("GET", "/v1/screenlane/contexts")

    def list_commands(self) -> Any:
        return self._request("GET", "/v1/screenlane/commands")

    def demo(self) -> Any:
        return self._request("POST", "/v1/screenlane/demo", {})


def build_local_command(
    instruction: str,
    context_text: str = "",
    target: str = "stdout",
) -> dict:
    """Deterministic offline helper (no server required)."""
    intent = "general_action"
    lower = f"{instruction}\n{context_text}".lower()
    if any(k in lower for k in ("fix", "error", "debug", "exception")):
        intent = "debug_error"
    elif any(k in lower for k in ("explain", "summarize")):
        intent = "explain"
    elif "reply" in lower or "email" in lower:
        intent = "write_reply"
    prompt = (
        f"Target: {target}\nIntent: {intent}\n\n"
        f"Screen context:\n```\n{context_text[:4000]}\n```\n\n"
        f"User instruction:\n{instruction}\n\n"
        "Act on the instruction using the context. Prefer minimal, safe changes."
    )
    return {
        "intent": intent,
        "instruction": instruction,
        "target": target,
        "prompt": prompt,
        "offline": True,
    }
