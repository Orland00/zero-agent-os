import { Hono } from "hono";
import type { Env } from "./types.js";
import { createSupabaseClient } from "./db.js";

export const webhooksApp = new Hono<{ Bindings: Env }>();

const TELEGRAM_API = "https://api.telegram.org";

/** Send a Telegram message. */
async function sendMessage(token: string, chatId: number | string, text: string) {
  await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

/**
 * POST /webhooks/telegram
 *
 * Telegram webhook (webhook mode — never polling). The request is verified by
 * the secret token Telegram echoes in the X-Telegram-Bot-Api-Secret-Token
 * header, which must match TELEGRAM_WEBHOOK_SECRET.
 */
webhooksApp.post("/telegram", async (c) => {
  const secret = c.req.header("X-Telegram-Bot-Api-Secret-Token");
  if (secret !== c.env.TELEGRAM_WEBHOOK_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const update = await c.req.json<any>();
  const message = update.message;
  if (!message?.text) return c.json({ ok: true });

  const chatId = message.chat.id;
  const text: string = message.text.trim();
  const db = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY);

  // Touch the conversation session (used by the cron session-expiry job).
  await db.from("sessions").upsert(
    { telegram_chat_id: chatId, active: true, last_seen_at: new Date().toISOString() },
    { onConflict: "telegram_chat_id" }
  );

  // Minimal command router. Real tenants extend this with their own intents.
  if (text.startsWith("/start")) {
    await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, "👋 Welcome. Send /help to see what I can do.");
  } else if (text.startsWith("/help")) {
    await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, "Commands:\n/start — begin\n/help — this message");
  } else {
    await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, "Got it. (Demo handler — extend me.)");
  }

  return c.json({ ok: true });
});
