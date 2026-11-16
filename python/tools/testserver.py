"""A local, offline stand-in for httpbin.org, plus HTTP/1.1 framing cases for Lesson 2.

Usage:
    python3 python/tools/testserver.py                     # http://localhost:8080
    python3 python/tools/testserver.py --port 9000 --idle-timeout 2

Every route answers GET and HEAD; /anything and /redirect-to also answer POST, PUT, PATCH and DELETE.

    /get, /headers, /ip        the request as JSON (like httpbin)
    /anything                  the request as JSON, including method and body
    /raw                       the exact request head bytes you sent, CRLFs made visible
    /status/<code>             that status code with an empty body
    /redirect/<n>              n relative redirects, then /get   (alias: /relative-redirect/<n>)
    /absolute-redirect/<n>     n absolute redirects, then /get
    /redirect-to?url=&status_code=   one redirect to url (default status 302)
    /delay/<seconds>           wait, then respond like /get (at most 10 s)
    /drip?duration=&numbytes=  numbytes asterisks spread evenly over duration seconds
    /bytes/<n>                 n bytes of a repeating pattern, with Content-Length
    /gzip                      a gzip-compressed JSON body (Content-Encoding: gzip)
    /chunked?chunks=&delay=    a chunked body, one line per chunk
    /trailers                  a chunked body that ends with a Content-Digest trailer field
    /close                     no Content-Length, no chunking: the body ends when the socket closes
    /early-hints               a 103 Early Hints interim response, then the real 200
    /etag/<etag>               200 with that ETag, or 304 if If-None-Match matches
    /cache/<seconds>           a response with Cache-Control: max-age=<seconds>
    /cookies                   the cookies you sent, as JSON
    /cookies/set?name=value    Set-Cookie for each query parameter, then a redirect to /cookies
    /response-headers?K=V      a response carrying the header fields you ask for
    /html                      a small HTML document

The server binds to 127.0.0.1 only. It is a teaching tool, not a production server.
"""
import argparse
import base64
import gzip
import hashlib
import json
import string
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlsplit

MAX_DELAY = 10
MAX_BYTES = 10 * 1024 * 1024
TOKEN_CHARS = set(string.ascii_letters + string.digits + "!#$%&'*+-.^_|~" + chr(96))
COOKIE_CHARS = set(string.ascii_letters + string.digits + "!#$%&'()*+-./:<=>?@[]^_{|}~" + chr(96))  # RFC 6265 cookie-octet

HTML_PAGE = b"""<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Test page</title></head>
<body>
<h1>Hello from the test server</h1>
<p>A <b>tiny</b> document for your parser.</p>
</body>
</html>
"""


class _RecordingReader:
    """Wraps rfile and keeps a copy of every header line the request parser reads."""

    def __init__(self, inner):
        self.inner = inner
        self.data = bytearray()

    def readline(self, limit=-1):
        line = self.inner.readline(limit)
        self.data += line
        return line

    def __getattr__(self, name):
        return getattr(self.inner, name)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"  # keep connections open unless someone asks to close
    server_version = "CookbookTestServer/1.0"
    timeout = 15  # seconds an idle keep-alive connection survives; see --idle-timeout

    # -- plumbing ---------------------------------------------------------

    def parse_request(self):
        recorder = _RecordingReader(self.rfile)
        self.rfile = recorder
        try:
            return super().parse_request()
        finally:
            self.rfile = recorder.inner
            self.raw_head = bytes(self.raw_requestline) + bytes(recorder.data)

    def log_message(self, format, *args):
        if not getattr(self.server, "quiet", False):
            super().log_message(format, *args)

    # Tell the client when we are about to hang up, so it doesn't pool a dead connection.
    def send_response_only(self, code, message=None):
        self.status_code, self.connection_header_sent = code, False
        super().send_response_only(code, message)

    def send_header(self, keyword, value):
        if keyword.lower() == "connection":
            self.connection_header_sent = True
        super().send_header(keyword, value)

    def end_headers(self):
        if self.close_connection and self.status_code >= 200 and not self.connection_header_sent:
            super().send_header("Connection", "close")
        super().end_headers()

    def do_GET(self):
        self.route()

    def do_HEAD(self):
        self.route()

    def do_POST(self):
        self.route()

    do_PUT = do_PATCH = do_DELETE = do_POST

    def read_request_body(self):
        """Always consume the body, or it would be misread as the next request on this connection."""
        if self.request_version == "HTTP/0.9":  # no headers, no body (and some Pythons give a plain dict here)
            return b""
        if "Transfer-Encoding" in self.headers:
            self.close_connection = True
            raise ValueError("chunked request bodies are not supported; send Content-Length")
        if len(self.headers.get_all("Content-Length", [])) > 1:
            self.close_connection = True  # which one is right? Guessing is how requests get smuggled
            raise ValueError("more than one Content-Length field")
        length = self.headers.get("Content-Length", "0")
        if not length.isascii() or not length.isdigit() or int(length) > MAX_BYTES:
            self.close_connection = True
            raise ValueError("invalid or oversized Content-Length")
        return self.rfile.read(int(length))

    def send_body(self, status, body, content_type="application/json", headers=()):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        for name, value in headers:
            self.send_header(name, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def send_json(self, data, status=200):
        body = (json.dumps(data, indent=2) + "\n").encode()
        self.send_body(status, body)

    def fail(self, status, message):
        self.send_json({"error": message}, status)

    def start_chunked(self, content_type="text/plain; charset=utf-8", headers=()):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Transfer-Encoding", "chunked")
        for name, value in headers:
            self.send_header(name, value)
        self.end_headers()

    def write_chunk(self, data):
        self.wfile.write(b"%x\r\n%s\r\n" % (len(data), data))
        self.wfile.flush()

    # -- routes -----------------------------------------------------------

    def route(self):
        url = urlsplit(self.path)
        self.query = {k: v[-1] for k, v in parse_qs(url.query, keep_blank_values=True).items()}
        segments = [s for s in url.path.split("/") if s]
        name = segments[0] if segments else ""
        arg = segments[1] if len(segments) > 1 else None

        try:
            self.request_body = self.read_request_body()
        except ValueError as err:
            return self.fail(400, str(err))
        if self.command not in ("GET", "HEAD") and name not in ("anything", "redirect-to"):
            return self.fail(405, f"{self.command} is only accepted on /anything and /redirect-to")

        handler = {
            "get": self.r_echo, "headers": self.r_headers, "ip": self.r_ip, "anything": self.r_echo,
            "raw": self.r_raw, "status": self.r_status,
            "redirect": self.r_redirect, "relative-redirect": self.r_redirect,
            "absolute-redirect": self.r_absolute_redirect, "redirect-to": self.r_redirect_to,
            "delay": self.r_delay, "drip": self.r_drip, "bytes": self.r_bytes, "gzip": self.r_gzip,
            "chunked": self.r_chunked, "trailers": self.r_trailers, "close": self.r_close,
            "early-hints": self.r_early_hints, "etag": self.r_etag, "cache": self.r_cache,
            "cookies": self.r_cookies, "response-headers": self.r_response_headers, "html": self.r_html,
        }.get(name)
        if handler is None:
            return self.fail(404, f"no route for {url.path}")
        try:
            handler(arg)
        except ValueError as err:
            self.fail(400, str(err))

    def int_arg(self, value, name, low, high):
        if value is None or not value.isascii() or not value.isdigit():
            raise ValueError(f"{name} must be a whole number")
        number = int(value)
        if not low <= number <= high:
            raise ValueError(f"{name} must be between {low} and {high}")
        return number

    def r_echo(self, _arg):
        host = self.headers.get("Host", "localhost")
        self.send_json({
            "method": self.command,
            "url": f"http://{host}{self.path}",
            "args": self.query,
            "headers": dict(self.headers.items()),
            "data": self.request_body.decode("utf-8", errors="replace"),
        })

    def r_headers(self, _arg):
        self.send_json({"headers": dict(self.headers.items())})

    def r_ip(self, _arg):
        self.send_json({"origin": self.client_address[0]})

    def r_gzip(self, _arg):
        body = json.dumps({"gzipped": True, "method": self.command, "headers": dict(self.headers.items())}, indent=2)
        self.send_body(200, gzip.compress(body.encode() + b"\n"), headers=[("Content-Encoding", "gzip")])

    def r_raw(self, _arg):
        lines = []
        for line in self.raw_head.splitlines(keepends=True):
            text = line.rstrip(b"\r\n").decode("latin-1")
            ending = "\\r\\n" if line.endswith(b"\r\n") else "\\n" if line.endswith(b"\n") else ""
            lines.append(text + ending)
        self.send_body(200, ("\n".join(lines) + "\n").encode("utf-8"), "text/plain; charset=utf-8")

    def r_status(self, arg):
        code = self.int_arg(arg, "status", 200, 599)
        if code in (204, 304):
            self.send_response(code)
            self.end_headers()
        else:
            self.send_body(code, b"", "text/plain")

    def redirect(self, location, status=302):
        # Percent-encode anything outside printable ASCII, so a CR LF in ?url= can't add header lines.
        location = quote(location, safe=string.punctuation)
        self.send_body(status, b"", "text/plain", headers=[("Location", location)])

    def r_redirect(self, arg):
        n = self.int_arg(arg, "n", 1, 50)
        self.redirect("/get" if n == 1 else f"/relative-redirect/{n - 1}")

    def r_absolute_redirect(self, arg):
        n = self.int_arg(arg, "n", 1, 50)
        base = f"http://{self.headers.get('Host', 'localhost')}"
        self.redirect(base + ("/get" if n == 1 else f"/absolute-redirect/{n - 1}"))

    def r_redirect_to(self, _arg):
        if "url" not in self.query:
            raise ValueError("url is required")
        status = self.int_arg(self.query.get("status_code", "302"), "status_code", 300, 399)
        self.redirect(self.query["url"], status)

    def r_delay(self, arg):
        time.sleep(self.int_arg(arg, "seconds", 0, MAX_DELAY))
        self.r_echo(None)

    def r_drip(self, _arg):
        duration = float(self.query.get("duration", "2"))
        if not 0 <= duration <= MAX_DELAY:
            raise ValueError(f"duration must be between 0 and {MAX_DELAY}")
        numbytes = self.int_arg(self.query.get("numbytes", "10"), "numbytes", 1, 10_000)
        self.send_response(200)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Length", str(numbytes))
        self.end_headers()
        if self.command == "HEAD":
            return
        pause = duration / (numbytes - 1) if numbytes > 1 else 0  # first byte now, last at `duration`
        for i in range(numbytes):
            if i:
                time.sleep(pause)
            self.wfile.write(b"*")
            self.wfile.flush()

    def r_bytes(self, arg):
        n = self.int_arg(arg, "n", 0, MAX_BYTES)
        pattern = b"0123456789abcdef"
        self.send_body(200, (pattern * (n // len(pattern) + 1))[:n], "application/octet-stream")

    def r_chunked(self, _arg):
        chunks = self.int_arg(self.query.get("chunks", "3"), "chunks", 0, 1000)
        delay = float(self.query.get("delay", "0"))
        if not 0 <= delay <= 2:
            raise ValueError("delay must be between 0 and 2")
        self.start_chunked()
        if self.command == "HEAD":
            return
        for i in range(chunks):
            self.write_chunk(f"chunk {i + 1} of {chunks}\n".encode())
            time.sleep(delay)
        self.wfile.write(b"0\r\n\r\n")

    def r_trailers(self, _arg):
        parts = [b"The digest of this body\n", b"is only known\n", b"after the last chunk.\n"]
        digest = base64.b64encode(hashlib.sha256(b"".join(parts)).digest()).decode()
        self.start_chunked(headers=[("Trailer", "Content-Digest")])
        if self.command == "HEAD":
            return
        for part in parts:
            self.write_chunk(part)
        self.wfile.write(f"0\r\nContent-Digest: sha-256=:{digest}:\r\n\r\n".encode())

    def r_close(self, _arg):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Connection", "close")  # also tells BaseHTTPRequestHandler to hang up
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(b"No length, no chunks.\nThis body ends when the server closes the connection.\n")

    def r_early_hints(self, _arg):
        if self.request_version != "HTTP/1.0":  # 1xx responses don't exist in HTTP/1.0
            self.send_response_only(103)
            self.send_header("Link", "</style.css>; rel=preload; as=style")
            self.end_headers()
            self.wfile.flush()
        time.sleep(0.2)  # the "server think time" that Early Hints lets the browser use
        self.send_body(200, HTML_PAGE, "text/html; charset=utf-8",
                       headers=[("Link", "</style.css>; rel=preload; as=style")])

    def r_etag(self, arg):
        if not arg:
            raise ValueError("etag is required")
        etag = f'"{arg}"'
        candidates = [t.strip() for t in self.headers.get("If-None-Match", "").split(",")]
        if etag in candidates or "*" in candidates:
            self.send_response(304)
            self.send_header("ETag", etag)
            self.end_headers()
        else:
            self.send_body(200, json.dumps({"etag": arg}).encode() + b"\n", headers=[("ETag", etag)])

    def r_cache(self, arg):
        seconds = self.int_arg(arg, "seconds", 0, 31_536_000)
        body = json.dumps({"max_age": seconds}).encode() + b"\n"
        self.send_body(200, body, headers=[("Cache-Control", f"public, max-age={seconds}")])

    def r_cookies(self, arg):
        if arg == "set":
            pairs = list(self.query.items())
            for name, value in pairs:
                if not name or not set(name) <= TOKEN_CHARS or not set(value) <= COOKIE_CHARS:
                    raise ValueError("cookie names must be tokens, and values plain ASCII without ; , \\ \" or spaces")
            self.send_response(302)
            for name, value in pairs:
                self.send_header("Set-Cookie", f"{name}={value}; Path=/")
            self.send_header("Location", "/cookies")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        cookies = {}
        for item in self.headers.get("Cookie", "").split(";"):
            name, eq, value = item.strip().partition("=")
            if eq:
                cookies[name] = value
        self.send_json({"cookies": cookies})

    def r_response_headers(self, _arg):
        fields = list(self.query.items())
        for name, value in fields:
            # Validate everything before sending anything: a failure halfway through the head
            # would leave a half-written 200 on the wire, followed by the 400.
            if not name or not set(name) <= TOKEN_CHARS or any(c in value for c in "\r\n\0"):
                raise ValueError(f"refusing to send malformed header field {name!r}")
            if not value.isascii():
                raise ValueError(f"header values must be ASCII; percent-encode {name!r} yourself")
            if name.lower() in ("content-length", "transfer-encoding", "connection"):
                raise ValueError(f"{name} controls framing; this route won't send it")
        content_type = next((v for n, v in fields if n.lower() == "content-type"), "application/json")
        extra = [(n, v) for n, v in fields if n.lower() != "content-type"]
        self.send_body(200, json.dumps(dict(fields)).encode() + b"\n", content_type, headers=extra)

    def r_html(self, _arg):
        self.send_body(200, HTML_PAGE, "text/html; charset=utf-8")


def make_server(port=8080, idle_timeout=15, quiet=False):
    handler = type("ConfiguredHandler", (Handler,), {"timeout": idle_timeout})
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    server.daemon_threads = True
    server.quiet = quiet
    return server


def serve_in_background(idle_timeout=15):
    """Start a quiet server on a free port in a daemon thread. Returns (server, base_url)."""
    server = make_server(port=0, idle_timeout=idle_timeout, quiet=True)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_address[1]}"


def main(argv=None):
    parser = argparse.ArgumentParser(description="Offline httpbin-style server for the Browser Cookbook.")
    parser.add_argument("--port", type=int, default=8080, help="port to listen on (default: 8080)")
    parser.add_argument("--idle-timeout", type=float, default=15,
                        help="seconds before an idle keep-alive connection is closed (default: 15)")
    args = parser.parse_args(argv)

    server = make_server(args.port, args.idle_timeout)
    print(f"Serving on http://localhost:{server.server_address[1]}  (Ctrl-C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print()
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
