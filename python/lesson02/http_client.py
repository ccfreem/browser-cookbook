"""Lesson 2: an HTTP/1.1 client on raw sockets. No urllib.request, no http.client.

Usage:
    python3 http_client.py https://example.com
    python3 http_client.py -v https://httpbin.org/get https://httpbin.org/headers
    python3 http_client.py -v -X POST -d 'hello' https://httpbin.org/anything
"""
import argparse
import socket
import ssl
import string
import sys
import time
from dataclasses import dataclass, field
from urllib.parse import quote, urljoin, urlsplit

USER_AGENT = "BrowserCookbook/0.2 (+lesson-02)"
DEFAULT_PORTS = {"http": 80, "https": 443}
REDIRECT_STATUSES = {301, 302, 303, 307, 308}
RETRYABLE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE", "PUT", "DELETE"}  # idempotent (RFC 9110 §9.2.2)
CROSS_ORIGIN_DROP = {"authorization", "proxy-authorization", "cookie", "host"}
MAX_REDIRECTS = 20  # the Fetch Standard's limit
MAX_LINE = 64 * 1024  # longest status line, field line or chunk-size line we accept
MAX_HEAD = 256 * 1024  # largest header (or trailer) section we accept, in bytes
MAX_FIELDS = 200
MAX_INTERIM = 10  # 1xx responses accepted before the real one
# Characters allowed in a field name (RFC 9110 "token"). chr(96) is the backtick, spelled
# that way so the course app can embed this file in a JavaScript template string.
TCHARS = set(string.ascii_letters + string.digits + "!#$%&'*+-.^_|~" + chr(96))
HEXDIGITS = set(string.hexdigits)


class ProtocolError(Exception):
    """The peer sent bytes that are not a valid HTTP/1.1 response."""


class ConnectionClosed(ProtocolError):
    """The peer closed the connection before the message was complete."""


def is_digits(text):
    return text.isascii() and text.isdigit()  # str.isdigit() alone accepts "²" and "٣"


# -- Part 1: a connection with a read buffer ---------------------------------


class Connection:
    """A socket plus a buffer, so we can read lines and exact byte counts from a stream."""

    def __init__(self, sock):
        self.sock = sock
        self.buffer = bytearray()
        self.number = 0  # set by the pool, for logging

    @classmethod
    def open(cls, scheme, host, port, timeout):
        sock = socket.create_connection((host, port), timeout=timeout)
        if scheme == "https":
            context = ssl.create_default_context()  # verifies the chain and the hostname
            context.set_alpn_protocols(["http/1.1"])
            sock = context.wrap_socket(sock, server_hostname=host)  # also sends SNI
        return cls(sock)

    def send(self, data):
        self.sock.sendall(data)

    def _fill(self):
        data = self.sock.recv(65536)
        if not data:
            raise ConnectionClosed("connection closed before the response was complete")
        self.buffer += data

    def read_line(self, strict=False):
        """One line without its terminator. Accepts CRLF, or a bare LF (RFC 9112 §2.2)
        unless strict, which chunked framing uses: there, a bare LF is a smuggling vector."""
        while True:
            end = self.buffer.find(b"\n")
            if end > MAX_LINE:
                raise ProtocolError("line too long")
            if end != -1:
                line = bytes(self.buffer[:end])
                del self.buffer[:end + 1]
                if line.endswith(b"\r"):
                    return line[:-1]
                if strict:
                    raise ProtocolError("expected CRLF, got a bare LF")
                return line
            if len(self.buffer) > MAX_LINE:
                raise ProtocolError("line too long")
            self._fill()

    def read_exact(self, n):
        while len(self.buffer) < n:
            self._fill()
        data = bytes(self.buffer[:n])
        del self.buffer[:n]
        return data

    def read_to_eof(self):
        chunks = [bytes(self.buffer)]
        self.buffer.clear()
        while data := self.sock.recv(65536):
            chunks.append(data)
        return b"".join(chunks)

    def close(self):
        self.sock.close()


# -- Part 2: writing the request ---------------------------------------------


def split_url(url):
    """Return (scheme, host, port, target): the origin plus the request target."""
    parts = urlsplit(url)
    if parts.scheme not in DEFAULT_PORTS:
        raise ValueError(f"unsupported scheme: {parts.scheme!r}")
    if not parts.hostname:
        raise ValueError(f"no host in {url!r}")
    host = parts.hostname.encode("idna").decode("ascii")
    port = parts.port if parts.port is not None else DEFAULT_PORTS[parts.scheme]
    target = (parts.path or "/") + (f"?{parts.query}" if parts.query else "")
    # A browser's URL parser has already percent-encoded spaces and non-ASCII by now.
    return parts.scheme, host, port, quote(target, safe="/?:@!$&'()*+,;=%~[]")


def host_header(scheme, host, port):
    name = f"[{host}]" if ":" in host else host
    return name if port == DEFAULT_PORTS[scheme] else f"{name}:{port}"


def serialize_request(method, target, headers, body=b""):
    """The request line, the field lines, an empty line, then the body."""
    if not method or not set(method) <= TCHARS:
        raise ValueError(f"invalid method {method!r}")
    lines = [f"{method} {target} HTTP/1.1"]
    for name, value in headers:
        if not name or not set(name) <= TCHARS or any(c in value for c in "\r\n\0"):
            raise ValueError(f"refusing to send malformed header field {name!r}")
        lines.append(f"{name}: {value}")
    return ("\r\n".join(lines) + "\r\n\r\n").encode("ascii") + body


def request_headers(method, scheme, host, port, extra, body):
    for name, _ in extra:
        if name.lower() in ("content-length", "transfer-encoding"):
            raise ValueError(f"{name} describes the body's framing, so the client sets it, not you")
    headers = [
        ("Host", host_header(scheme, host, port)),
        ("User-Agent", USER_AGENT),
        ("Accept", "*/*"),
        ("Accept-Encoding", "identity"),  # we can't decompress yet (an exercise)
    ]
    overrides = {name.lower() for name, _ in extra}
    headers = [(n, v) for n, v in headers if n.lower() not in overrides] + list(extra)
    if body or method in ("POST", "PUT", "PATCH"):
        headers.append(("Content-Length", str(len(body))))
    return headers


# -- Part 3: reading the status line and fields ------------------------------


def parse_status_line(line):
    if b"\r" in line or b"\0" in line:
        raise ProtocolError(f"CR or NUL inside the status line: {line[:80]!r}")
    text = line.decode("latin-1")
    version, _, rest = text.partition(" ")
    code, _, reason = rest.partition(" ")
    if len(version) != 8 or not version.startswith("HTTP/1.") or not is_digits(version[7]):
        raise ProtocolError(f"not an HTTP/1.x status line: {text[:80]!r}")
    if len(code) != 3 or not is_digits(code) or code[0] not in "12345":
        raise ProtocolError(f"invalid status code in {text[:80]!r}")
    return version, int(code), reason


def read_fields(conn):
    """Field lines up to the empty line, as [(name, value)] in order, duplicates kept."""
    fields = []
    size = 0
    while line := conn.read_line():
        size += len(line) + 2
        if size > MAX_HEAD:
            raise ProtocolError("header section too large")
        if b"\r" in line or b"\0" in line:
            raise ProtocolError(f"CR or NUL inside a field line: {line[:80]!r}")  # RFC 9110 §5.5
        if line[:1] in (b" ", b"\t"):
            # obs-fold: an obsolete continuation line. Replace the fold with a space.
            if not fields:
                raise ProtocolError("continuation line before any field")
            name, value = fields[-1]
            continuation = line.strip(b" \t").decode("latin-1")
            fields[-1] = (name, f"{value} {continuation}")
            continue
        name, colon, value = line.partition(b":")
        name = name.decode("latin-1")
        if not colon or not name or not set(name) <= TCHARS:
            raise ProtocolError(f"malformed field line: {line[:80]!r}")
        if len(fields) == MAX_FIELDS:
            raise ProtocolError("too many header fields")
        fields.append((name, value.strip(b" \t").decode("latin-1")))
    return fields


def field_value(fields, name):
    """Case-insensitive lookup. Repeated fields are joined with ", " (RFC 9110 §5.3)."""
    values = [v for n, v in fields if n.lower() == name.lower()]
    return ", ".join(values) if values else None


# -- Part 4: where does the body end? ----------------------------------------


def read_body(conn, method, status, headers):
    """Apply RFC 9112 §6.3 in order. Returns (framing, body, trailers, chunk_count)."""
    if method == "HEAD" or status in (204, 304) or 100 <= status < 200:
        return "none", b"", [], 0

    transfer_encoding = field_value(headers, "Transfer-Encoding")
    if transfer_encoding is not None:
        codings = [c.strip().lower() for c in transfer_encoding.split(",")]
        if codings[-1] != "chunked":
            return "until-close", conn.read_to_eof(), [], 0
        if codings != ["chunked"]:
            raise ProtocolError(f"unsupported transfer coding: {transfer_encoding!r}")
        body, trailers, count = read_chunked(conn)
        return "chunked", body, trailers, count

    content_length = field_value(headers, "Content-Length")
    if content_length is not None:
        values = {v.strip() for v in content_length.split(",")}
        value = values.pop() if len(values) == 1 else ""
        if not is_digits(value) or len(value) > 18:
            raise ProtocolError(f"invalid Content-Length: {content_length!r}")
        return "content-length", conn.read_exact(int(value)), [], 0

    return "until-close", conn.read_to_eof(), [], 0


def read_chunked(conn):
    """Decode the chunked transfer coding (RFC 9112 §7.1)."""
    body = bytearray()
    count = 0
    while True:
        size_field, semicolon, _extensions = conn.read_line(strict=True).partition(b";")
        if semicolon:
            size_field = size_field.rstrip(b" \t")  # whitespace is allowed only before extensions
        size_text = size_field.decode("latin-1")
        if not size_text or len(size_text) > 15 or not set(size_text) <= HEXDIGITS:
            raise ProtocolError(f"invalid chunk size: {size_field[:20]!r}")  # int(x, 16) accepts "0x1f", "1_f"
        size = int(size_text, 16)
        if size == 0:
            break
        body += conn.read_exact(size)
        count += 1
        if conn.read_line(strict=True) != b"":
            raise ProtocolError("chunk data was not followed by CRLF")
    trailers = read_fields(conn)  # the trailer section ends with an empty line too
    return bytes(body), trailers, count


# -- Part 5: one response, and whether the connection survives it -------------


@dataclass
class Response:
    url: str
    version: str
    status: int
    reason: str
    headers: list
    body: bytes = b""
    trailers: list = field(default_factory=list)
    framing: str = "none"
    chunks: int = 0
    interim: list = field(default_factory=list)  # 1xx responses that arrived first
    history: list = field(default_factory=list)  # redirect responses that led here
    connection: int = 0
    reused: bool = False
    elapsed: float = 0.0

    def header(self, name):
        return field_value(self.headers, name)


def read_response(conn, method, url, status_line):
    version, status, reason = parse_status_line(status_line)
    headers = read_fields(conn)
    interim = []
    while 100 <= status < 200:
        if status == 101:
            raise ProtocolError("unexpected 101 Switching Protocols: we never asked to upgrade")
        if len(interim) == MAX_INTERIM:
            raise ProtocolError("too many 1xx responses")
        interim.append((version, status, reason, headers))  # 103 Early Hints, 100 Continue, ...
        version, status, reason = parse_status_line(conn.read_line())
        headers = read_fields(conn)
    framing, body, trailers, chunks = read_body(conn, method, status, headers)
    return Response(url, version, status, reason, headers, body, trailers, framing, chunks, interim)


def connection_tokens(fields):
    return {t.strip().lower() for t in (field_value(fields, "Connection") or "").split(",")}


def can_reuse(response):
    tokens = connection_tokens(response.headers)
    if response.framing == "until-close" or "close" in tokens:
        return False
    if response.header("Transfer-Encoding") and response.header("Content-Length"):
        return False  # conflicting framing: possible smuggling, so never trust this stream again
    if response.version == "HTTP/1.0":
        return "keep-alive" in tokens and not response.header("Transfer-Encoding")
    return True


# -- Part 6: a pool of idle connections ---------------------------------------


class ConnectionPool:
    """Idle connections keyed by origin, so the next request can skip DNS, TCP and TLS."""

    def __init__(self, timeout):
        self.timeout = timeout
        self.idle = {}  # (scheme, host, port) -> [Connection]
        self.opened = 0

    def get(self, origin):
        if self.idle.get(origin):
            return self.idle[origin].pop(), True
        return self.connect(origin), False

    def connect(self, origin):
        conn = Connection.open(*origin, timeout=self.timeout)
        self.opened += 1
        conn.number = self.opened
        return conn

    def release(self, origin, conn):
        self.idle.setdefault(origin, []).append(conn)

    def close(self):
        for conns in self.idle.values():
            for conn in conns:
                conn.close()
        self.idle.clear()


# -- Part 7: the client: one exchange, then redirects --------------------------


def redirect_method(status, method, body):
    """Fetch Standard, HTTP-redirect fetch: when a redirect turns into a GET."""
    if (status in (301, 302) and method == "POST") or (status == 303 and method not in ("GET", "HEAD")):
        return "GET", b""
    return method, body


class Client:
    def __init__(self, timeout=10.0, verbose=False, max_redirects=MAX_REDIRECTS, log=print):
        self.pool = ConnectionPool(timeout)
        self.verbose = verbose
        self.max_redirects = max_redirects
        self.log = log

    def request(self, url, method="GET", headers=(), body=b""):
        history = []
        while True:
            response = self.exchange(url, method, headers, body)
            locations = {v for n, v in response.headers if n.lower() == "location"}
            if response.status not in REDIRECT_STATUSES or not locations:
                response.history = history
                return response
            if len(locations) > 1:
                raise ProtocolError(f"conflicting Location fields: {sorted(locations)}")
            if len(history) >= self.max_redirects:
                raise ProtocolError(f"too many redirects (more than {self.max_redirects})")
            history.append(response)
            # Field values were decoded as Latin-1, but servers send UTF-8 here. Decode it properly
            # (split_url then IDNA-encodes the host and quotes the rest), or percent-encode the raw bytes.
            raw_location = locations.pop().encode("latin-1")
            try:
                location = raw_location.decode("utf-8")
            except UnicodeDecodeError:
                location = quote(raw_location, safe=string.punctuation)
            next_url = urljoin(url, location)
            if urlsplit(next_url).scheme not in DEFAULT_PORTS:
                raise ProtocolError(f"refusing to follow a redirect to {next_url!r}")
            self.log(f"* {response.status} redirect: {url} -> {next_url}")
            new_method, body = redirect_method(response.status, method, body)
            if new_method != method:
                headers = [(n, v) for n, v in headers if not n.lower().startswith("content-")]
            if split_url(next_url)[:3] != split_url(url)[:3]:
                # Credentials (and a Host override) meant for one origin must not reach another.
                headers = [(n, v) for n, v in headers if n.lower() not in CROSS_ORIGIN_DROP]
            method, url = new_method, next_url

    def exchange(self, url, method, extra_headers, body):
        scheme, host, port, target = split_url(url)
        origin = (scheme, host, port)
        headers = request_headers(method, scheme, host, port, extra_headers, body)
        raw = serialize_request(method, target, headers, body)

        started = time.perf_counter()
        conn, reused = self.pool.get(origin)
        self.trace(f"* {'reusing' if reused else 'opened'} connection #{conn.number} to {host}:{port}")
        self.trace_lines(">", raw.split(b"\r\n\r\n", 1)[0])
        try:
            try:
                conn.send(raw)
                status_line = conn.read_line()
            except (ConnectionClosed, ConnectionError, ssl.SSLError):
                # A server may close an idle connection at any moment. If it did so before
                # answering anything, retry once on a fresh connection, if that's safe.
                if not reused or conn.buffer or method not in RETRYABLE_METHODS:
                    raise
                conn.close()
                self.trace(f"* connection #{conn.number} was closed by the server while idle; retrying")
                conn, reused = self.pool.connect(origin), False
                self.trace(f"* opened connection #{conn.number} to {host}:{port}")
                conn.send(raw)
                status_line = conn.read_line()
            response = read_response(conn, method, url, status_line)
        except BaseException:
            conn.close()
            raise
        response.connection, response.reused = conn.number, reused
        response.elapsed = time.perf_counter() - started

        for version, status, reason, fields in response.interim:
            self.trace_lines("<", f"{version} {status} {reason}".encode("latin-1"), fields)
        final_line = f"{response.version} {response.status} {response.reason}"
        self.trace_lines("<", final_line.encode("latin-1"), response.headers)
        # Leftover bytes (say, a body on a HEAD response) mean we no longer know where the stream is.
        keep = can_reuse(response) and not conn.buffer and "close" not in connection_tokens(headers)
        self.trace(f"* body: {describe_framing(response)}; {response.elapsed * 1000:.0f} ms; "
                   f"connection #{conn.number} {'kept for reuse' if keep else 'closed'}")
        if keep:
            self.pool.release(origin, conn)
        else:
            conn.close()
        return response

    def trace(self, message):
        if self.verbose:
            self.log(message)

    def trace_lines(self, prefix, head, fields=None):
        if not self.verbose:
            return
        lines = head.decode("latin-1").split("\r\n")
        lines += [f"{name}: {value}" for name, value in fields or []]
        for line in lines + [""]:
            self.log(f"{prefix} {line}".rstrip())

    def close(self):
        self.pool.close()


def describe_framing(response):
    if response.framing == "chunked":
        trailers = f", trailers: {', '.join(n for n, _ in response.trailers)}" if response.trailers else ""
        chunks = f"{response.chunks} chunk{'' if response.chunks == 1 else 's'}"
        return f"chunked, {chunks}, {len(response.body)} bytes{trailers}"
    if response.framing == "content-length":
        return f"Content-Length, {len(response.body)} bytes"
    if response.framing == "until-close":
        return f"read until close, {len(response.body)} bytes"
    return "none"


def charset_of(content_type):
    for param in (content_type or "").split(";")[1:]:
        key, _, value = param.strip().partition("=")
        if key.lower() == "charset":
            return value.strip('"')
    return "utf-8"


def preview(response, limit):
    try:
        text = response.body[:limit].decode(charset_of(response.header("Content-Type")), errors="replace")
    except (LookupError, UnicodeError):
        text = response.body[:limit].decode("utf-8", errors="replace")
    more = len(response.body) - limit
    return text + (f"\n... ({more} more bytes)" if more > 0 else "")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Fetch URLs over raw sockets and show the HTTP/1.1 exchange.")
    parser.add_argument("urls", nargs="+", metavar="url", help="one or more URLs, fetched in order over a shared pool")
    parser.add_argument("-X", "--method", default="GET", help="request method (default: GET)")
    parser.add_argument("-H", "--header", action="append", default=[], metavar="'Name: value'",
                        help="add or replace a request header field (repeatable)")
    parser.add_argument("-d", "--data", default="", help="request body, sent as UTF-8")
    parser.add_argument("-v", "--verbose", action="store_true", help="print connections, request and response heads")
    parser.add_argument("--timeout", type=float, default=10.0, help="seconds per socket operation (default: 10)")
    parser.add_argument("--body", type=int, default=400, help="body bytes to print (default: 400)")
    parser.add_argument("--max-redirects", type=int, default=MAX_REDIRECTS, help="default: 20")
    parser.add_argument("--pause", type=float, default=0, help="seconds to wait between URLs (default: 0)")
    args = parser.parse_args(argv)

    extra = []
    for item in args.header:
        name, colon, value = item.partition(":")
        if not colon:
            parser.error(f"header must look like 'Name: value', got {item!r}")
        extra.append((name.strip(), value.strip()))

    client = Client(timeout=args.timeout, verbose=args.verbose, max_redirects=args.max_redirects)
    try:
        for i, url in enumerate(args.urls):
            if i:
                print()
                time.sleep(args.pause)
            started = time.perf_counter()
            response = client.request(url, args.method.upper(), extra, args.data.encode())
            elapsed = time.perf_counter() - started
            print(f"< {response.status} {response.reason}   ({response.url})")
            if args.body > 0:
                print(preview(response, args.body))
            where = f"connection #{response.connection} ({'reused' if response.reused else 'new'})"
            if response.history:
                where = f"{len(response.history) + 1} requests, the last on {where}"
            print(f"\n* {len(response.body)} body bytes in {elapsed * 1000:.0f} ms, {where}")
    except (OSError, ProtocolError, ValueError) as err:
        print(f"* error: {err}")
        return 1
    finally:
        client.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
