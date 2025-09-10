// @ts-nocheck
// Generic proxy for all /api/* requests to the upstream API server.
// This avoids browser CORS by serving via the same origin (Cloudflare Pages).

export const onRequest = async (ctx) => {
  const { request } = ctx
  const url = new URL(request.url)

  // Remove leading /api/ and forward rest of the path
  const rest = url.pathname.replace(/^\/api\//, "")
  const upstreamBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.uchinokiroku.com').replace(/\/$/, '')
  const upstream = `${upstreamBase}/api/${rest}${url.search}`

  const headers = new Headers(request.headers)
  headers.set('host', new URL(upstream).host)
  const init = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: "manual",
  }

  const resp = await fetch(upstream, init)
  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  })
}
