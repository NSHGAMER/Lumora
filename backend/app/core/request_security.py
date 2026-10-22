"""Origin checks for cookie endpoints and bounded per-process abuse protection."""
import time
from collections import OrderedDict
from fastapi.responses import JSONResponse


def error(status, code, message):
    return JSONResponse(status_code=status, content={"success": False, "error": {"code": code, "message": message, "details": None}})


def install_request_security(app, settings):
    buckets = OrderedDict()

    @app.middleware("http")
    async def protect(request, call_next):
        path = request.url.path
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            origin = request.headers.get("origin")
            if path.startswith(settings.api_v1_prefix + "/auth") and origin and origin not in settings.cors_origins:
                return error(403, "ORIGIN_FORBIDDEN", "Request origin is not allowed")
            if path.startswith(settings.api_v1_prefix + "/auth") or path.startswith(settings.api_v1_prefix + "/jsr"):
                host = request.client.host if request.client else "unknown"
                key = (host, "jsr" if "/jsr" in path else "auth")
                now = time.monotonic()
                start, count = buckets.get(key, (now, 0))
                if now - start >= 60:
                    start, count = now, 0
                buckets[key] = (start, count + 1)
                buckets.move_to_end(key)
                if len(buckets) > 10000:
                    buckets.popitem(last=False)
                if count >= (20 if key[1] == "jsr" else 60):
                    result = error(429, "RATE_LIMITED", "Too many requests. Please retry in a minute.")
                    result.headers["Retry-After"] = "60"
                    return result
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        if path.startswith(settings.api_v1_prefix):
            response.headers["Cache-Control"] = "no-store"
        return response
