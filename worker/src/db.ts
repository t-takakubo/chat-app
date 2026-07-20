export type RoomSummary = {
  room_id: string;
  created_at: number;
  message_count: number;
  first_message_at: number | null;
  last_message_at: number | null;
};

export type D1MessageRow = {
  id: number;
  room_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: number;
};

export async function recordRoomCreated(
  db: D1Database,
  roomId: string,
  createdAt: number,
): Promise<void> {
  await db
    .prepare("INSERT OR IGNORE INTO rooms (room_id, created_at) VALUES (?, ?)")
    .bind(roomId, createdAt)
    .run();
}

export async function insertMessage(
  db: D1Database,
  params: {
    roomId: string;
    authorId: string;
    authorName: string;
    body: string;
    createdAt: number;
  },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO messages (room_id, author_id, author_name, body, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(params.roomId, params.authorId, params.authorName, params.body, params.createdAt)
    .run();
}

export async function listRooms(db: D1Database): Promise<RoomSummary[]> {
  const result = await db
    .prepare(
      `SELECT r.room_id as room_id,
              r.created_at as created_at,
              COUNT(m.id) as message_count,
              MIN(m.created_at) as first_message_at,
              MAX(m.created_at) as last_message_at
       FROM rooms r
       LEFT JOIN messages m ON m.room_id = r.room_id
       GROUP BY r.room_id
       ORDER BY COALESCE(MAX(m.created_at), r.created_at) DESC`,
    )
    .all<RoomSummary>();
  return result.results;
}

export async function listMessages(db: D1Database, roomId: string): Promise<D1MessageRow[]> {
  const result = await db
    .prepare(
      `SELECT id, ? as room_id, author_id, author_name, body, created_at
       FROM messages WHERE room_id = ? ORDER BY id ASC`,
    )
    .bind(roomId, roomId)
    .all<D1MessageRow>();
  return result.results;
}

export async function listAllMessages(db: D1Database): Promise<D1MessageRow[]> {
  const result = await db
    .prepare(
      `SELECT id, room_id, author_id, author_name, body, created_at
       FROM messages ORDER BY room_id, id ASC`,
    )
    .all<D1MessageRow>();
  return result.results;
}
