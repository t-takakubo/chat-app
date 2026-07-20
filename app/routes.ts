import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/chat.tsx"),
  route("chat/room/:roomId", "routes/chat.room.$roomId.tsx"),
] satisfies RouteConfig;
