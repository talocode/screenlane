export class ScreenLaneError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code = "SCREENLANE_ERROR", statusCode = 400) {
    super(message);
    this.name = "ScreenLaneError";
    this.code = code;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
    };
  }
}

export class AuthError extends ScreenLaneError {
  constructor(message = "Unauthorized") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthError";
  }
}

export class NotFoundError extends ScreenLaneError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ProviderError extends ScreenLaneError {
  constructor(message: string) {
    super(message, "PROVIDER_ERROR", 502);
    this.name = "ProviderError";
  }
}

export class CaptureError extends ScreenLaneError {
  constructor(message: string) {
    super(message, "CAPTURE_ERROR", 400);
    this.name = "CaptureError";
  }
}

export class ConfigError extends ScreenLaneError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR", 400);
    this.name = "ConfigError";
  }
}

/** Redact secrets from strings for safe logging/output */
export function redactSecrets(text: string): string {
  if (!text) return text;
  return text
    .replace(/(TALOCODE_API_KEY|TERA_API_KEY|CODRA_API_KEY|GATELANE_API_KEY|OPENAI_API_KEY|SCREENLANE_API_KEY)\s*[=:]\s*["']?[^\s"']+/gi, "$1=***")
    .replace(/(Bearer\s+)[A-Za-z0-9._\-+/=]+/gi, "$1***")
    .replace(/(sk-[A-Za-z0-9]{8})[A-Za-z0-9]+/g, "$1***")
    .replace(/(talo_[A-Za-z0-9]{4})[A-Za-z0-9]+/g, "$1***");
}

export function maskKey(key: string | undefined | null): string {
  if (!key) return "(not set)";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}
