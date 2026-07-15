# Install

## npm (primary)

```bash
npm install -g @talocode/screenlane
screenlane --help
screenlane doctor
```

One-shot without global install:

```bash
npx @talocode/screenlane@latest demo
```

From source:

```bash
git clone https://github.com/talocode/screenlane.git
cd screenlane
npm install
npm run build
node dist/cli.js demo
```

## Python

```bash
pip install talocode-screenlane
screenlane-py --help
```

Python talks to the Node local API by default. Start it with:

```bash
screenlane serve
```

## Optional OS tools

### Linux screenshots

Install one of: `grim`, `gnome-screenshot`, `scrot`, `spectacle`, ImageMagick `import`.

### Linux clipboard

`wl-clipboard` (`wl-paste` / `wl-copy`) or `xclip` / `xsel`.

### macOS

`screencapture` and `pbcopy` / `pbpaste` ship with the OS (permissions may be required).

### Windows

PowerShell screenshot helper is attempted; document limitations if it fails — use `--source text|file`.

## Permissions

- macOS Screen Recording permission may be required for live capture  
- Microphone is **not** used by default in v0.1  

## Verify

```bash
screenlane init
screenlane doctor
screenlane demo
```
