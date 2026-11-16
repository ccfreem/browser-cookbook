"""Lesson 1: a tiny HTTP client built on urllib, showing the conversation it hides.

Usage:
    python3 fetch.py https://example.com
    python3 fetch.py https://httpbin.org/redirect/3
    python3 fetch.py --timeout 2 https://httpbin.org/delay/3
    python3 fetch.py --wire https://httpbin.org/headers
"""
import argparse
import http.client
import sys
import time
import urllib.error
import urllib.request

USER_AGENT = "BrowserCookbook/0.1 (+lesson-01)"


class RecordingRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Follows redirects exactly like the default handler, but remembers each hop."""

    def __init__(self):
        super().__init__()
        self.hops = []

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        new = super().redirect_request(req, fp, code, msg, headers, newurl)
        self.hops.append((code, req.full_url, newurl))
        return new


def fetch(url, method="GET", timeout=10.0, wire=False):
    redirects = RecordingRedirectHandler()
    handlers = [redirects]
    if wire:
        # debuglevel=1 makes http.client print every line it sends and receives.
        handlers += [urllib.request.HTTPHandler(debuglevel=1), urllib.request.HTTPSHandler(debuglevel=1)]
    opener = urllib.request.build_opener(*handlers)
    request = urllib.request.Request(
        url, method=method, headers={"User-Agent": USER_AGENT, "Accept": "*/*"}
    )

    started = time.perf_counter()
    refused = False
    try:
        response = opener.open(request, timeout=timeout)
    except urllib.error.HTTPError as err:
        response = err  # 4xx/5xx raise, but an HTTPError is also a full response
        if err.reason.startswith(redirects.inf_msg):
            redirects.hops.pop()  # accepted, then refused: too many hops, or a loop
        # A redirect urllib won't follow (that, or a POST on 307/308) also lands here.
        refused = 300 <= err.code < 400 and "Location" in err.headers
    with response:
        body = response.read()
    elapsed = time.perf_counter() - started

    final_url, reason = response.geturl(), response.reason
    if refused:
        # The URL that answered is where the last followed hop went; an HTTPError may carry the
        # refused target instead, and its reason may carry an explanation.
        final_url = redirects.hops[-1][2] if redirects.hops else request.full_url
        reason = reason.removeprefix(redirects.inf_msg).split(" - Redirection to url")[0]

    return {
        "request": request,
        "redirects": redirects.hops,
        "refused": refused,
        "final_url": final_url,
        "status": response.status,
        "reason": reason,
        "headers": response.headers,
        "body": body,
        "elapsed": elapsed,
    }


def print_exchange(result, body_limit):
    request = result["request"]
    print(f"> {request.get_method()} {request.selector or '/'} HTTP/1.1")
    for name, value in request.header_items():
        print(f"> {name}: {value}")
    print(">")

    for code, source, target in result["redirects"]:
        print(f"* {code} redirect: {source} -> {target}")
    if result["refused"]:
        print("* urllib would not follow the redirect below, so that 3xx response is the result")

    print(f"< {result['status']} {result['reason']}   ({result['final_url']})")
    for name, value in result["headers"].items():
        print(f"< {name}: {value}")
    print("<")

    body = result["body"]
    charset = result["headers"].get_content_charset() or "utf-8"
    try:
        preview = body[:body_limit].decode(charset, errors="replace")
    except LookupError:  # a charset Python has never heard of
        preview = body[:body_limit].decode("utf-8", errors="replace")
    print(preview)
    if len(body) > body_limit:
        print(f"... ({len(body) - body_limit} more bytes)")
    print(f"\n* {len(body)} body bytes in {result['elapsed'] * 1000:.0f} ms")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Fetch a URL and show the HTTP exchange.")
    parser.add_argument("url")
    parser.add_argument("--method", default="GET", help="HTTP method (default: GET)")
    parser.add_argument("--timeout", type=float, default=10.0, help="seconds (default: 10)")
    parser.add_argument("--body", type=int, default=400, help="body bytes to print (default: 400)")
    parser.add_argument("--wire", action="store_true", help="also print the exact lines http.client sends and receives")
    args = parser.parse_args(argv)

    try:
        result = fetch(args.url, method=args.method.upper(), timeout=args.timeout, wire=args.wire)
    except TimeoutError:
        print(f"* timed out after {args.timeout:g}s waiting for {args.url}")
        return 1
    except urllib.error.URLError as err:
        print(f"* request failed: {err.reason}")
        return 1
    except (ValueError, OSError, http.client.HTTPException) as err:  # e.g. no scheme, a bad port, a cut-off body
        print(f"* request failed: {err!r}")
        return 1

    print_exchange(result, args.body)
    return 0


if __name__ == "__main__":
    sys.exit(main())
