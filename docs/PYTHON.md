# Python package

**Name:** `talocode-screenlane`  
**Import:** `talocode_screenlane`  
**CLI:** `screenlane-py`

## Role

Lightweight HTTP client + offline command helper. Full OS capture lives in the Node package.

## Install

```bash
pip install talocode-screenlane
# from source
cd python && pip install -e ".[dev]"
```

## Auth

Uses `TALOCODE_API_KEY` when the server enables `SCREENLANE_REQUIRE_AUTH=true`.

## Build / publish

```bash
cd python
python3 -m pip install build twine
python3 -m build
python3 -m twine upload dist/*
```
