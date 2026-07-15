from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import __version__
from .client import ScreenLaneClient, ScreenLaneError, build_local_command


def _print(data: object) -> None:
    if isinstance(data, str):
        print(data)
    else:
        print(json.dumps(data, indent=2))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="screenlane-py",
        description="Python CLI for ScreenLane (HTTP client + offline helpers)",
    )
    parser.add_argument("--base-url", default="http://127.0.0.1:3070")
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("health", help="GET /v1/screenlane/health")
    sub.add_parser("doctor", help="GET /v1/screenlane/doctor")
    sub.add_parser("demo", help="POST /v1/screenlane/demo (or offline fallback)")

    p_cmd = sub.add_parser("command", help="Build agent command via API or offline")
    p_cmd.add_argument("--text", required=True)
    p_cmd.add_argument("--context-file")
    p_cmd.add_argument("--context-text", default="")
    p_cmd.add_argument("--target", default="stdout")
    p_cmd.add_argument("--offline", action="store_true", help="Do not call server")

    p_cap = sub.add_parser("capture", help="POST capture")
    p_cap.add_argument("--text")
    p_cap.add_argument("--source", default="text")

    args = parser.parse_args(argv)
    client = ScreenLaneClient(base_url=args.base_url)

    try:
        if args.cmd == "health":
            _print(client.health())
            return 0
        if args.cmd == "doctor":
            _print(client.doctor())
            return 0
        if args.cmd == "demo":
            try:
                _print(client.demo())
            except ScreenLaneError:
                # offline deterministic demo
                _print(
                    build_local_command(
                        "Fix this error",
                        "TypeError: cannot read map of undefined at Dashboard.tsx:42",
                        target="codra",
                    )
                )
            return 0
        if args.cmd == "command":
            ctx = args.context_text or ""
            if args.context_file:
                ctx = Path(args.context_file).read_text(encoding="utf-8")
            if args.offline:
                _print(build_local_command(args.text, ctx, args.target))
                return 0
            try:
                _print(
                    client.command(
                        {
                            "text": args.text,
                            "contextText": ctx,
                            "target": args.target,
                            "save": False,
                        }
                    )
                )
            except ScreenLaneError:
                _print(build_local_command(args.text, ctx, args.target))
            return 0
        if args.cmd == "capture":
            _print(client.capture({"source": args.source, "text": args.text, "save": False}))
            return 0
    except ScreenLaneError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
