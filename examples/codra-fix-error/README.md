# Example: Codra fix error

```bash
cat > /tmp/error.txt <<'EOF'
TypeError: Cannot read properties of undefined (reading 'map')
    at renderList (src/components/Dashboard.tsx:42:18)
EOF

screenlane command \
  --text "Fix this error" \
  --context-file /tmp/error.txt \
  --target codra \
  --out prompt --save
```
