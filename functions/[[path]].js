const TARGET = "https://6c642c4f7a9fbc4c1939eccc19418e91.loophole.site";

export async function onRequest(context) {
  const incomingUrl = new URL(context.request.url);
  const targetHost = new URL(TARGET).host;

  const targetUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    TARGET
  );

  const requestHeaders = new Headers(context.request.headers);

  // 🔥 Skip Horizon warning
  requestHeaders.set("x-hrzn-skip-warning", "true");

  // Non‑standard user agent (extra bypass method)
  requestHeaders.set("user-agent", "CloudflareProxy/1.0");

  // Ensure correct host
  requestHeaders.set("host", targetHost);

  const response = await fetch(targetUrl.toString(), {
    method: context.request.method,
    headers: requestHeaders,
    body: context.request.body,
    redirect: "manual"
  });

  const responseHeaders = new Headers(response.headers);

  // 🔥 Fix redirect loops
  if (responseHeaders.has("location")) {
    let location = responseHeaders.get("location");

    if (location.includes("hrzn.run")) {
      location = location.replace(TARGET, incomingUrl.origin);
      responseHeaders.set("location", location);
    }
  }

  // 🔥 Rewrite cookies to your Pages domain
  const setCookie = responseHeaders.get("set-cookie");
  if (setCookie) {
    const rewrittenCookie = setCookie.replace(
      /Domain=[^;]+/i,
      `Domain=${incomingUrl.hostname}`
    );
    responseHeaders.set("set-cookie", rewrittenCookie);
  }

  const contentType = responseHeaders.get("content-type") || "";

  // 🔥 Rewrite HTML so all links stay on Pages
  if (contentType.includes("text/html")) {
    let text = await response.text();

    text = text.replaceAll(TARGET, incomingUrl.origin);
    text = text.replaceAll(targetHost, incomingUrl.host);

    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-security-policy");

    return new Response(text, {
      status: response.status,
      headers: responseHeaders
    });
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders
  });
}
