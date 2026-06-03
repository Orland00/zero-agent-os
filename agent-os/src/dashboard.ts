import { Hono } from "hono";
import type { Env } from "./types.js";

export const dashboardApp = new Hono<{ Bindings: Env }>();

/**
 * Minimal operations dashboard, served at /os/.
 *
 * In deployed environments this is protected by an upstream access proxy (e.g. Cloudflare
 * Access) rather than handling auth itself. Here it is a static placeholder so
 * the route shape is visible without shipping any real internal UI.
 */
dashboardApp.get("/", (c) =>
  c.html(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agent OS</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; margin: 0; background:#0b0f0c; color:#d7e3da; }
    main { max-width: 640px; margin: 12vh auto; padding: 0 24px; }
    h1 { font-size: 2rem; letter-spacing: -0.02em; }
    code { background:#16201a; padding:2px 6px; border-radius:4px; }
    .muted { color:#7c8a82; }
  </style>
</head>
<body>
  <main>
    <h1>Agent OS</h1>
    <p>Single-Worker control plane for multi-tenant automations.</p>
    <p class="muted">This is the public demo dashboard placeholder. The API lives under
    <code>/api/*</code> (bearer auth) and webhooks under <code>/webhooks/*</code>.</p>
  </main>
</body>
</html>`)
);
