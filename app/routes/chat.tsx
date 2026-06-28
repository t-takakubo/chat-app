import { Link } from "react-router";

export default function Chat() {
  const rooms = [
    { id: "1", name: "一般" },
    { id: "2", name: "雑談" },
    { id: "3", name: "質問" },
  ];

  return (
    <div>
      <h1>チャット一覧</h1>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <Link to={`/chat/${room.id}`}>{room.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
