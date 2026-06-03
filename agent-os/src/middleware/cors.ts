import { createMiddleware } from "hono/factory";
import type { Env } from "../types.js";

/**
 * CORS middleware. Restricts to a known allow-list of frontend origins.
 * Replace these with your own deployed frontends.
 */
const ALLOWED_ORIGINS = [
  "https://example.com",
  "https://app.example.com",
  "http://localhost:5173",
  "http://localhost:4173",
];

const METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const HEADERS = "Content-Type, Authorization";

export const corsMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const origin = c.req.header("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": METHODS,
        "Access-Control-Allow-Headers": HEADERS,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  await next();

  c.res.headers.set("Access-Control-Allow-Origin", allowed);
  c.res.headers.set("Access-Control-Allow-Methods", METHODS);
  c.res.headers.set("Access-Control-Allow-Headers", HEADERS);
});
