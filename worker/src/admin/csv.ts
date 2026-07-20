import type { D1MessageRow } from "../db";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function messagesToCsv(rows: D1MessageRow[]): string {
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

export function csv(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
