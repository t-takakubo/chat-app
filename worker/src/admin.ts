import type { Env } from "./env";

type RoomSummary = {
  room_id: string;
  created_at: number;
  message_count: number;
  first_message_at: number | null;
  last_message_at: number | null;
};

type MessageRow = {
  id: number;
  room_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: number;
};

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let mismatch = 0;
  for (let i = 0; i < aBytes.length; i++) {
    mismatch |= aBytes[i] ^ bBytes[i];
  }
  return mismatch === 0;
}

function unauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  const header = request.headers.get("Authorization");
  if (!header || !header.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length));
  } catch {
    return false;
  }
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  return timingSafeEqual(user, env.ADMIN_USER) && timingSafeEqual(password, env.ADMIN_PASSWORD);
}

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function messagesToCsv(rows: MessageRow[]): string {
  const header = ["room_id", "id", "author_id", "author_name", "body", "created_at_iso"];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.room_id,
        String(row.id),
        row.author_id,
        row.author_name,
        row.body,
        new Date(row.created_at).toISOString(),
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return lines.join("\n");
}

function csv(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function listRooms(env: Env): Promise<RoomSummary[]> {
  const result = await env.DB.prepare(
    `SELECT r.room_id as room_id,
            r.created_at as created_at,
            COUNT(m.id) as message_count,
            MIN(m.created_at) as first_message_at,
            MAX(m.created_at) as last_message_at
     FROM rooms r
     LEFT JOIN messages m ON m.room_id = r.room_id
     GROUP BY r.room_id
     ORDER BY COALESCE(MAX(m.created_at), r.created_at) DESC`,
  ).all<RoomSummary>();
  return result.results;
}

async function listMessages(env: Env, roomId: string): Promise<MessageRow[]> {
  const result = await env.DB.prepare(
    `SELECT id, ? as room_id, author_id, author_name, body, created_at
     FROM messages WHERE room_id = ? ORDER BY id ASC`,
  )
    .bind(roomId, roomId)
    .all<MessageRow>();
  return result.results;
}

async function listAllMessages(env: Env): Promise<MessageRow[]> {
  const result = await env.DB.prepare(
    `SELECT id, room_id, author_id, author_name, body, created_at
     FROM messages ORDER BY room_id, id ASC`,
  ).all<MessageRow>();
  return result.results;
}

const ADMIN_PAGE_HTML = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>チャット履歴 管理画面</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", sans-serif; margin: 0; padding: 24px; background: #0b0d12; color: #e6e8ec; }
  h1 { font-size: 18px; margin-bottom: 16px; }
  a { color: #7dabff; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #262a33; font-size: 13px; vertical-align: top; }
  th { color: #9aa3b2; font-weight: 600; }
  tr:hover td { background: #14171e; }
  .room-link { cursor: pointer; text-decoration: underline; }
  .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
  .muted { color: #9aa3b2; font-size: 12px; }
  .body-cell { white-space: pre-wrap; max-width: 480px; }
  button { background: #1c2029; color: #e6e8ec; border: 1px solid #333947; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 12px; }
  button:hover { background: #262b36; }
  #back { display: none; margin-bottom: 12px; }
</style>
</head>
<body>
<h1>チャット履歴 管理画面</h1>
<div class="toolbar">
  <a href="/admin/api/export.csv">全ルームCSVエクスポート</a>
  <span class="muted">|</span>
  <a href="/admin/api/rooms">JSON API</a>
</div>
<button id="back">← ルーム一覧に戻る</button>
<div id="content">読み込み中...</div>
<script>
  const content = document.getElementById("content");
  const back = document.getElementById("back");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  async function showRooms() {
    back.style.display = "none";
    content.textContent = "読み込み中...";
    const res = await fetch("/admin/api/rooms");
    const rooms = await res.json();
    if (rooms.length === 0) {
      content.textContent = "ルームがありません。";
      return;
    }
    let html = "<table><thead><tr><th>Room ID</th><th>作成日時</th><th>メッセージ数</th><th>最終メッセージ</th><th></th></tr></thead><tbody>";
    for (const r of rooms) {
      html += "<tr>" +
        "<td>" + esc(r.room_id) + "</td>" +
        "<td>" + new Date(r.created_at).toLocaleString("ja-JP") + "</td>" +
        "<td>" + r.message_count + "</td>" +
        "<td>" + (r.last_message_at ? new Date(r.last_message_at).toLocaleString("ja-JP") : "-") + "</td>" +
        "<td><span class=\\"room-link\\" data-room=\\"" + esc(r.room_id) + "\\">メッセージを見る</span> / <a href=\\"/admin/api/rooms/" + encodeURIComponent(r.room_id) + "/export.csv\\">CSV</a></td>" +
        "</tr>";
    }
    html += "</tbody></table>";
    content.innerHTML = html;
    content.querySelectorAll(".room-link").forEach((el) => {
      el.addEventListener("click", () => showMessages(el.dataset.room));
    });
  }

  async function showMessages(roomId) {
    back.style.display = "inline-block";
    content.textContent = "読み込み中...";
    const res = await fetch("/admin/api/rooms/" + encodeURIComponent(roomId) + "/messages");
    const messages = await res.json();
    let html = "<p class=\\"muted\\">Room: " + esc(roomId) + "</p>";
    html += "<table><thead><tr><th>時刻</th><th>投稿者</th><th>本文</th></tr></thead><tbody>";
    for (const m of messages) {
      html += "<tr>" +
        "<td>" + new Date(m.created_at).toLocaleString("ja-JP") + "</td>" +
        "<td>" + esc(m.author_name) + "</td>" +
        "<td class=\\"body-cell\\">" + esc(m.body) + "</td>" +
        "</tr>";
    }
    html += "</tbody></table>";
    content.innerHTML = html;
  }

  back.addEventListener("click", showRooms);
  showRooms();
</script>
</body>
</html>`;

export async function handleAdminRequest(request: Request, env: Env, url: URL): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return unauthorized();
  }

  if (url.pathname === "/admin") {
    return new Response(ADMIN_PAGE_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (url.pathname === "/admin/api/rooms") {
    return json(await listRooms(env));
  }

  if (url.pathname === "/admin/api/export.csv") {
    return csv(messagesToCsv(await listAllMessages(env)), "chat-messages-all.csv");
  }

  const roomMessagesMatch = url.pathname.match(/^\/admin\/api\/rooms\/([^/]+)\/messages$/);
  if (roomMessagesMatch) {
    return json(await listMessages(env, decodeURIComponent(roomMessagesMatch[1])));
  }

  const roomExportMatch = url.pathname.match(/^\/admin\/api\/rooms\/([^/]+)\/export\.csv$/);
  if (roomExportMatch) {
    const roomId = decodeURIComponent(roomExportMatch[1]);
    return csv(messagesToCsv(await listMessages(env, roomId)), `chat-messages-${roomId}.csv`);
  }

  return new Response("Not found", { status: 404 });
}
