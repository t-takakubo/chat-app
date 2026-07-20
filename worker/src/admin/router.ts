import type { Env } from "../env";
import { listAllMessages, listMessages, listRooms } from "../db";
import { isAuthorized, unauthorized } from "./auth";
import { csv, messagesToCsv } from "./csv";
import { ADMIN_PAGE_HTML } from "./page";

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

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
    return json(await listRooms(env.DB));
  }

  if (url.pathname === "/admin/api/export.csv") {
    return csv(messagesToCsv(await listAllMessages(env.DB)), "chat-messages-all.csv");
  }

  const roomMessagesMatch = url.pathname.match(/^\/admin\/api\/rooms\/([^/]+)\/messages$/);
  if (roomMessagesMatch) {
    return json(await listMessages(env.DB, decodeURIComponent(roomMessagesMatch[1])));
  }

  const roomExportMatch = url.pathname.match(/^\/admin\/api\/rooms\/([^/]+)\/export\.csv$/);
  if (roomExportMatch) {
    const roomId = decodeURIComponent(roomExportMatch[1]);
    return csv(messagesToCsv(await listMessages(env.DB, roomId)), `chat-messages-${roomId}.csv`);
  }

  return new Response("Not found", { status: 404 });
}
