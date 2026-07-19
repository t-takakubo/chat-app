import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("chat", "routes/chat.tsx"),
  route("chat/match", "routes/chat.match.tsx"),
  route("chat/room/:roomId", "routes/chat.room.$roomId.tsx"),
  route("chat/:id", "routes/chat.$id.tsx"),
] satisfies RouteConfig;
