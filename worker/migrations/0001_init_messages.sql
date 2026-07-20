-- Migration number: 0001 	 2026-07-20T09:39:43.194Z

CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_room_id_created_at ON messages (room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
