import { apiBaseUrl } from "@/lib/media";

export async function GET(_request: Request, context: RouteContext<"/media/[filename]">) {
  const { filename } = await context.params;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return new Response("Not found", { status: 404 });

  const response = await fetch(`${apiBaseUrl()}/media/${encodeURIComponent(filename)}`, {
    cache: "force-cache",
  });
  if (!response.ok || !response.body) return new Response("Not found", { status: 404 });

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": response.headers.get("cache-control") || "public, max-age=604800",
    },
  });
}
