# HTTP API

```bash
screenlane serve
```

- Local: `http://127.0.0.1:3070`
- Cloud: `https://api.talocode.site`
- Key: `TALOCODE_API_KEY`

## Auth

Open by default. With `SCREENLANE_REQUIRE_AUTH=true`:

```http
Authorization: Bearer <TALOCODE_API_KEY>
```

`GET /health` and `GET /v1/screenlane/health` stay public.

## Routes

| Method | Path |
|--------|------|
| GET | `/health`, `/v1/screenlane/health` |
| GET | `/v1/screenlane/doctor` |
| POST | `/v1/screenlane/capture` |
| POST | `/v1/screenlane/dictate` |
| POST | `/v1/screenlane/command` |
| POST | `/v1/screenlane/send` |
| GET | `/v1/screenlane/contexts`, `/contexts/:id` |
| GET | `/v1/screenlane/commands`, `/commands/:id` |
| POST | `/v1/screenlane/demo` |
