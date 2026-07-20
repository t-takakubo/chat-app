import { SearchX } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import { TooltipProvider } from "~/components/ui/tooltip";

import type { Route } from "./+types/root";
import "./app.css";

// Applies the saved (or system) theme before first paint to avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function NotFoundPage() {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <div className="flex shrink-0 items-center justify-end px-4 py-3.5">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
        <div className="flex w-full max-w-xs animate-rise-in flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <SearchX className="size-7 text-muted-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="mb-2 text-lg font-semibold tracking-[-0.01em]">ページが見つかりません</h1>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            URLが正しいかご確認いただくか、ホームに戻ってください。
          </p>
          <Button asChild className="w-full rounded-xl px-8">
            <Link to="/">ホームに戻る</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = "Error";
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
