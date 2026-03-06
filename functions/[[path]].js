export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url)

  const target = new URL("https://zum-replacement-gmc-substances.trycloudflare.com")
  target.pathname = incomingUrl.pathname || "/"
  target.search = incomingUrl.search

  const headers = new Headers(context.request.headers)
  headers.set("host", "6c642c4f7a9fbc4c1939eccc19418e91.loophole.site")

  return fetch(target.toString(), {
    method: context.request.method,
    headers,
    body: context.request.body
  })
}
