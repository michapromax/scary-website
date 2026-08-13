// Cloudflare Pages Function — /api/guestbook
// Requires a KV namespace bound to this project as "GUESTBOOK" (see setup notes).

const MAX_ENTRIES = 200;
const MAX_TEXT_LEN = 500;
const MAX_NAME_LEN = 40;

export async function onRequestGet({ env }) {
  const raw = await env.GUESTBOOK.get("entries");
  const entries = raw ? JSON.parse(raw) : [];
  return new Response(JSON.stringify(entries), {
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), { status: 400 });
  }

  const text = (body.text || "").toString().trim().slice(0, MAX_TEXT_LEN);
  const who = (body.who || "").toString().trim().slice(0, MAX_NAME_LEN);

  if (!text) {
    return new Response(JSON.stringify({ error: "empty" }), { status: 400 });
  }

  const raw = await env.GUESTBOOK.get("entries");
  const entries = raw ? JSON.parse(raw) : [];

  entries.unshift({ who, text, ts: Date.now() });
  const trimmed = entries.slice(0, MAX_ENTRIES);

  await env.GUESTBOOK.put("entries", JSON.stringify(trimmed));

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
}
