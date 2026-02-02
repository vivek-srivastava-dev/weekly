import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/auth.tsx"),
  route(
    ".well-known/appspecific/com.chrome.devtools.json",
    "routes/chrome-devtools.ts"
  ),
  route("events", "routes/events.tsx"),
] satisfies RouteConfig;
