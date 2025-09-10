import type { PagesFunction } from '@cloudflare/workers-types'

export const onRequest: PagesFunction = async (ctx) => {
  const { request } = ctx
  const url = new URL(request.url)

  // Strip the prefix /api/auth/ and forward the rest
  const rest = url.pathname.replace(/^\/api\/auth\//, "")
  const upstream = `https://api.uchinokiroku.com/api/auth/${rest}${url.search}`

  // Clone request for upstream
  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
    // Only pass body for non-GET/HEAD
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
    redirect: "manual",
  }

  const resp = await fetch(upstream, init)

  // Return upstream response as-is so Set-Cookie and redirect headers flow through
  return new Response(resp.body, {
    status: resp.status,
    headers: resp.headers,
  })
}
