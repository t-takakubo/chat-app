import { Link, useParams } from "react-router";

export default function ChatRoom() {
  const { id } = useParams();

  return (
    <div>
      <Link to="/chat">← 一覧に戻る</Link>
      <h1>チャットルーム: {id}</h1>
    </div>
  );
}
