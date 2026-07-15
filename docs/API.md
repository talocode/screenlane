# HTTP API

Default bind: `127.0.0.1:3070`

```bash
screenlane serve
```

## Auth

Local-first: **no auth required** by default.

When `SCREENLANE_REQUIRE_AUTH=true`:

```http
Authorization: Bearer <TALOCODE_API_KEY>
```

or:

```http
X-Talocode-Api-Key: <TALOCODE_API_KEY>
```

Health endpoints stay public:

- `GET /health`
- `GET /v1/screenlane/health`

## Routes

### Health

- `GET /health`
- `GET /v1/screenlane/health`

```json
{ "ok": true, "service": "screenlane", "version": "0.1.2" }
```

### Doctor

- `GET /v1/screenlane/doctor`

### Capture

- `POST /v1/screenlane/capture`

```json
{ "source": "text", "text": "...", "save": true }
```

### Dictate

- `POST /v1/screenlane/dictate`

```json
{ "text": "Fix this error", "save": false }
```

### Command

- `POST /v1/screenlane/command`

```json
{
  "text": "Fix this error",
  "contextText": "TypeError: ...",
  "target": "codra",
  "save": true
}
```

### Send

- `POST /v1/screenlane/send`

```json
{ "target": "stdout", "text": "..." }
```

### Lists

- `GET /v1/screenlane/contexts`
- `GET /v1/screenlane/contexts/:id`
- `GET /v1/screenlane/commands`
- `GET /v1/screenlane/commands/:id`

### Demo

- `POST /v1/screenlane/demo`
