"""Tests for Lesson 2. Offline: canned bytes over socketpair(), scripted servers, and the local test server.

    python3 -m unittest discover -s python/lesson02 -v
"""
import base64
import contextlib
import hashlib
import io
import json
import os
import shutil
import socket
import ssl
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))

import http_client as hc  # noqa: E402
import testserver  # noqa: E402

OK = b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok"


class ScriptedServer:
    """A raw socket server. Connection i answers each request with the next payload in scripts[i],
    then closes. It records every request head it reads."""

    def __init__(self, scripts):
        self.scripts = list(scripts)
        self.requests = []
        self.connections = 0
        self.sock = socket.create_server(("127.0.0.1", 0))
        self.url = f"http://127.0.0.1:{self.sock.getsockname()[1]}"
        threading.Thread(target=self._serve, daemon=True).start()

    def _serve(self):
        while True:
            try:
                conn, _ = self.sock.accept()
            except OSError:
                return
            script = self.scripts[self.connections] if self.connections < len(self.scripts) else []
            self.connections += 1
            with conn:
                for payload in script:
                    data = b""
                    while b"\r\n\r\n" not in data:
                        chunk = conn.recv(65536)
                        if not chunk:
                            break
                        data += chunk
                    if b"\r\n\r\n" not in data:
                        break
                    self.requests.append(data.split(b"\r\n\r\n", 1)[0])
                    conn.sendall(payload)

    def close(self):
        self.sock.close()


class ParsingTests(unittest.TestCase):
    """Feed exact bytes to the parser through a socket pair: no network, no server."""

    def parse(self, raw, method="GET"):
        ours, theirs = socket.socketpair()
        self.addCleanup(ours.close)

        def write():  # in a thread, so inputs bigger than the socket buffer can't deadlock
            with contextlib.suppress(OSError):
                theirs.sendall(raw)
            theirs.close()  # the peer hangs up after sending `raw`

        threading.Thread(target=write, daemon=True).start()
        ours.settimeout(5)
        conn = hc.Connection(ours)
        return hc.read_response(conn, method, "http://test/", conn.read_line()), conn

    def assertRejected(self, raw, method="GET"):
        with self.assertRaises(hc.ProtocolError):
            self.parse(raw, method)

    def test_content_length_reads_exactly_that_many_bytes(self):
        raw = b"HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nhelloHTTP/1.1 204 No Content\r\n\r\n"
        response, conn = self.parse(raw)
        self.assertEqual(response.body, b"hello")
        self.assertEqual(response.framing, "content-length")
        self.assertTrue(conn.buffer.startswith(b"HTTP/1.1 204"), "the next response must stay in the buffer")

    def test_chunked_with_extensions_and_trailers(self):
        raw = (b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n"
               b"5 ;name=value\r\nhello\r\n6\r\n world\r\n0\r\nChecksum: abc\r\n\r\n")
        response, _ = self.parse(raw)
        self.assertEqual(response.body, b"hello world")
        self.assertEqual(response.chunks, 2)
        self.assertEqual(response.trailers, [("Checksum", "abc")])

    def test_rejects_chunk_sizes_that_int_would_accept(self):
        for size in (b"0x5", b"+5", b"5_0", b"-5", b"", b" 5", b"5 ", b"1" * 16):
            with self.subTest(size=size):
                self.assertRejected(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n" + size + b"\r\nhello\r\n0\r\n\r\n")

    def test_chunk_framing_requires_crlf(self):
        self.assertRejected(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\nhello\r\n0\r\n\r\n")
        self.assertRejected(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nhello\n0\r\n\r\n")

    def test_chunk_longer_than_its_size_is_rejected(self):
        self.assertRejected(b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n3\r\nhello\r\n0\r\n\r\n")

    def test_content_length_validation(self):
        for value in (b"+5", b"5, 6", b"-1", b"5_0", b"\xb2", b"", b"1" * 19):
            with self.subTest(value=value):
                self.assertRejected(b"HTTP/1.1 200 OK\r\nContent-Length: " + value + b"\r\n\r\nhello")
        response, _ = self.parse(b"HTTP/1.1 200 OK\r\nContent-Length: 5, 5\r\n\r\nhello")
        self.assertEqual(response.body, b"hello")

    def test_transfer_encoding_overrides_content_length_and_poisons_the_connection(self):
        raw = (b"HTTP/1.1 200 OK\r\nContent-Length: 3\r\nTransfer-Encoding: chunked\r\n\r\n"
               b"5\r\nhello\r\n0\r\n\r\n")
        response, _ = self.parse(raw)
        self.assertEqual(response.body, b"hello")
        self.assertFalse(hc.can_reuse(response))

    def test_head_response_has_no_body_whatever_the_headers_say(self):
        response, _ = self.parse(b"HTTP/1.1 200 OK\r\nContent-Length: 100\r\n\r\n", method="HEAD")
        self.assertEqual(response.body, b"")
        self.assertEqual(response.framing, "none")

    def test_204_and_304_have_no_body(self):
        for status in (b"204 No Content", b"304 Not Modified"):
            with self.subTest(status=status):
                response, _ = self.parse(b"HTTP/1.1 " + status + b"\r\nContent-Length: 10\r\n\r\n")
                self.assertEqual(response.body, b"")

    def test_body_until_close(self):
        response, _ = self.parse(b"HTTP/1.1 200 OK\r\n\r\nall of this")
        self.assertEqual(response.body, b"all of this")
        self.assertFalse(hc.can_reuse(response))

    def test_bare_lf_line_endings_are_accepted_in_the_head(self):
        response, _ = self.parse(b"HTTP/1.1 200 OK\nContent-Length: 2\n\nok")
        self.assertEqual(response.body, b"ok")

    def test_obs_fold_is_replaced_with_a_space(self):
        response, _ = self.parse(b"HTTP/1.1 200 OK\r\nX-Long: part one\r\n \t part two\r\nContent-Length: 0\r\n\r\n")
        self.assertEqual(response.header("x-long"), "part one part two")

    def test_repeated_fields_are_kept_and_joined_on_lookup(self):
        response, _ = self.parse(b"HTTP/1.1 200 OK\r\nVary: A\r\nvary: B\r\nContent-Length: 0\r\n\r\n")
        self.assertEqual(len(response.headers), 3)
        self.assertEqual(response.header("Vary"), "A, B")

    def test_interim_responses_are_skipped(self):
        raw = (b"HTTP/1.1 103 Early Hints\r\nLink: </a.css>; rel=preload\r\n\r\n"
               b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok")
        response, _ = self.parse(raw)
        self.assertEqual(response.status, 200)
        self.assertEqual([i[1] for i in response.interim], [103])

    def test_http10_needs_keep_alive_to_be_reused(self):
        response, _ = self.parse(b"HTTP/1.0 200 OK\r\nContent-Length: 0\r\n\r\n")
        self.assertFalse(hc.can_reuse(response))
        response, _ = self.parse(b"HTTP/1.0 200 OK\r\nConnection: keep-alive\r\nContent-Length: 0\r\n\r\n")
        self.assertTrue(hc.can_reuse(response))

    def test_connection_close_is_honoured(self):
        response, _ = self.parse(b"HTTP/1.1 200 OK\r\nConnection: keep-alive, close\r\nContent-Length: 0\r\n\r\n")
        self.assertFalse(hc.can_reuse(response))

    def test_malformed_input_is_rejected(self):
        for raw in (b"HTTP/2 200 OK\r\n\r\n", b"HTTP/1.1 2000 OK\r\n\r\n", b"ICY 200 OK\r\n\r\n",
                    b"HTTP/1. 200 OK\r\n\r\n", b"HTTP/1.1junk 200 OK\r\n\r\n", b"HTTP/1.1 000 Zero\r\n\r\n",
                    b"HTTP/1.1 200 OK\r\nNo colon here\r\n\r\n", b"HTTP/1.1 200 OK\r\nBad Name: x\r\n\r\n",
                    b"HTTP/1.1 200 OK\r\nX: a\rb\r\n\r\n", b"HTTP/1.1 200 OK\r\nX: a\0b\r\n\r\n",
                    b"HTTP/1.1 200 O\rK\r\nContent-Length: 0\r\n\r\n",
                    b"HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\n\r\n" + OK,
                    b"HTTP/1.1 200 OK\r\nContent-Length: 10\r\n\r\nshort"):
            with self.subTest(raw=raw):
                self.assertRejected(raw)

    def test_limits_bound_memory(self):
        cases = {
            "a line with no end": b"HTTP/1.1 200 OK\r\nX: " + b"a" * (hc.MAX_LINE + 10),
            "a long line that does end": b"HTTP/1.1 200 OK\r\nX: " + b"a" * (hc.MAX_LINE + 10) + b"\r\n\r\n",
            "too many fields": b"HTTP/1.1 200 OK\r\n" + b"X: y\r\n" * (hc.MAX_FIELDS + 5) + b"\r\n",
            "endless folding": b"HTTP/1.1 200 OK\r\nX: a\r\n" + (b" " + b"b" * 1000 + b"\r\n") * 300 + b"\r\n",
            "endless 1xx": b"HTTP/1.1 103 Early Hints\r\n\r\n" * (hc.MAX_INTERIM + 2) + OK,
        }
        for name, raw in cases.items():
            with self.subTest(name):
                self.assertRejected(raw)


class RequestTests(unittest.TestCase):
    def test_split_url(self):
        self.assertEqual(hc.split_url("https://Example.com"), ("https", "example.com", 443, "/"))
        self.assertEqual(hc.split_url("http://e.com:8080/a b?q=\u00fc#frag"), ("http", "e.com", 8080, "/a%20b?q=%C3%BC"))
        self.assertEqual(hc.split_url("https://b\u00fccher.example/")[1], "xn--bcher-kva.example")

    def test_host_header(self):
        self.assertEqual(hc.host_header("https", "example.com", 443), "example.com")
        self.assertEqual(hc.host_header("https", "example.com", 8443), "example.com:8443")
        self.assertEqual(hc.host_header("http", "::1", 8080), "[::1]:8080")

    def test_serialize_request(self):
        raw = hc.serialize_request("GET", "/", [("Host", "e.com")])
        self.assertEqual(raw, b"GET / HTTP/1.1\r\nHost: e.com\r\n\r\n")

    def test_refuses_header_and_method_injection(self):
        for name, value in (("X-Evil", "a\r\nInjected: 1"), ("Bad Name", "x"), ("", "x"), ("X", "a\nb")):
            with self.subTest(name=name), self.assertRaises(ValueError):
                hc.serialize_request("GET", "/", [(name, value)])
        for method in ("GET / HTTP/1.1\r\nX: 1\r\n\r\nDELETE", "GET /x", ""):
            with self.subTest(method=method), self.assertRaises(ValueError):
                hc.serialize_request(method, "/", [])

    def test_request_headers(self):
        headers = hc.request_headers("GET", "http", "e.com", 80, [("user-agent", "mine")], b"")
        self.assertEqual([v for n, v in headers if n.lower() == "user-agent"], ["mine"])
        self.assertNotIn("Content-Length", dict(headers))
        post = dict(hc.request_headers("POST", "http", "e.com", 80, [], b""))
        self.assertEqual(post["Content-Length"], "0")
        for name in ("Content-Length", "transfer-encoding"):
            with self.subTest(name=name), self.assertRaises(ValueError):
                hc.request_headers("POST", "http", "e.com", 80, [(name, "5")], b"hello")

    def test_redirect_method_rules(self):
        cases = [(301, "POST", "GET"), (302, "POST", "GET"), (303, "POST", "GET"), (303, "PUT", "GET"),
                 (303, "HEAD", "HEAD"), (307, "POST", "POST"), (308, "POST", "POST"), (301, "PUT", "PUT")]
        for status, method, expected in cases:
            with self.subTest(status=status, method=method):
                self.assertEqual(hc.redirect_method(status, method, b"x")[0], expected)


class ScriptedServerTests(unittest.TestCase):
    """Exact responses, including broken ones, delivered over real connections."""

    def serve(self, *scripts):
        server = ScriptedServer(scripts)
        self.addCleanup(server.close)
        return server

    def client(self, **kwargs):
        client = hc.Client(timeout=5, log=lambda message: None, **kwargs)
        self.addCleanup(client.close)
        return client

    def test_partial_response_is_not_retried(self):
        server = self.serve([OK, b"HTTP/1.1 2"], [OK])
        client = self.client()
        client.request(server.url + "/a")
        with self.assertRaises(hc.ProtocolError):
            client.request(server.url + "/b")
        self.assertEqual(server.connections, 1)

    def test_leftover_bytes_retire_the_connection(self):
        server = self.serve([b"HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nHELLO"], [OK])
        client = self.client()
        client.request(server.url + "/", method="HEAD")
        self.assertEqual(client.request(server.url + "/").body, b"ok")
        self.assertEqual(server.connections, 2)

    def test_connection_close_from_either_side_retires_the_connection(self):
        closing = b"HTTP/1.1 200 OK\r\nConnection: close\r\nContent-Length: 2\r\n\r\nok"
        server = self.serve([closing], [OK], [OK])
        client = self.client()
        client.request(server.url + "/")
        client.request(server.url + "/", headers=[("Connection", "close")])
        client.request(server.url + "/")
        self.assertEqual(server.connections, 3)

    def test_utf8_location_is_percent_encoded_once(self):
        server = self.serve([b"HTTP/1.1 302 Found\r\nLocation: /caf\xc3\xa9\r\nContent-Length: 0\r\n\r\n", OK])
        self.assertEqual(self.client().request(server.url + "/").status, 200)
        self.assertTrue(server.requests[1].startswith(b"GET /caf%C3%A9 HTTP/1.1"), server.requests[1])

    def test_conflicting_locations_are_rejected(self):
        server = self.serve([b"HTTP/1.1 302 Found\r\nLocation: /a\r\nLocation: /b\r\nContent-Length: 0\r\n\r\n"])
        with self.assertRaises(hc.ProtocolError):
            self.client().request(server.url + "/")

    def test_redirect_to_a_non_http_scheme_is_refused(self):
        server = self.serve([b"HTTP/1.1 302 Found\r\nLocation: file:///etc/passwd\r\nContent-Length: 0\r\n\r\n"])
        with self.assertRaises(hc.ProtocolError):
            self.client().request(server.url + "/")


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server, cls.base = testserver.serve_in_background(idle_timeout=0.5)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def client(self, **kwargs):
        client = hc.Client(timeout=5, log=lambda message: None, **kwargs)
        self.addCleanup(client.close)
        return client

    def echo(self, url, **kwargs):
        return json.loads(self.client().request(url, **kwargs).body)

    def test_keep_alive_reuses_one_connection(self):
        client = self.client()
        responses = [client.request(self.base + p) for p in ("/get", "/headers", "/html")]
        self.assertEqual(client.pool.opened, 1)
        self.assertEqual([r.reused for r in responses], [False, True, True])

    def test_redirects_ride_the_same_connection(self):
        client = self.client()
        response = client.request(self.base + "/redirect/3")
        self.assertEqual(response.status, 200)
        self.assertEqual(len(response.history), 3)
        self.assertEqual(client.pool.opened, 1)

    def test_redirect_limit_is_exact(self):
        self.assertEqual(self.client(max_redirects=3).request(self.base + "/redirect/3").status, 200)
        with self.assertRaises(hc.ProtocolError):
            self.client(max_redirects=3).request(self.base + "/redirect/4")

    def test_303_turns_post_into_get_and_drops_body_headers(self):
        url = self.base + "/redirect-to?url=/anything&status_code=303"
        echo = self.echo(url, method="POST", headers=[("Content-Type", "text/plain")], body=b"hello")
        self.assertEqual((echo["method"], echo["data"]), ("GET", ""))
        self.assertNotIn("Content-Type", echo["headers"])

    def test_307_preserves_method_and_body(self):
        url = self.base + "/redirect-to?url=/anything&status_code=307"
        echo = self.echo(url, method="POST", body=b"hello")
        self.assertEqual((echo["method"], echo["data"]), ("POST", "hello"))

    def test_cross_origin_redirect_drops_credentials(self):
        port = self.server.server_address[1]
        creds = [("Authorization", "Bearer secret"), ("Cookie", "session=1")]
        same = self.base + f"/redirect-to?url=http://127.0.0.1:{port}/headers"
        other = self.base + f"/redirect-to?url=http://localhost:{port}/headers"
        kept = self.echo(same, headers=creds)["headers"]
        dropped = self.echo(other, headers=creds)["headers"]
        self.assertEqual((kept.get("Authorization"), kept.get("Cookie")), ("Bearer secret", "session=1"))
        self.assertEqual((dropped.get("Authorization"), dropped.get("Cookie")), (None, None))

    def test_close_delimited_body_ends_the_connection(self):
        client = self.client()
        self.assertEqual(client.request(self.base + "/close").framing, "until-close")
        client.request(self.base + "/get")
        self.assertEqual(client.pool.opened, 2)

    def test_stale_pooled_connection_is_retried(self):
        client = self.client()
        client.request(self.base + "/get")
        time.sleep(1.0)  # the server drops idle connections after 0.5 s
        response = client.request(self.base + "/get")
        self.assertEqual(response.status, 200)
        self.assertFalse(response.reused)
        self.assertEqual(client.pool.opened, 2)

    def test_stale_connection_is_not_retried_for_post(self):
        client = self.client()
        client.request(self.base + "/anything", method="POST", body=b"one")
        time.sleep(1.0)
        with self.assertRaises((hc.ProtocolError, ConnectionError)):
            client.request(self.base + "/anything", method="POST", body=b"two")

    def test_trailers_carry_a_digest_of_the_body(self):
        response = self.client().request(self.base + "/trailers")
        name, value = response.trailers[0]
        self.assertEqual(name, "Content-Digest")
        digest = base64.b64encode(hashlib.sha256(response.body).digest()).decode()
        self.assertEqual(value, f"sha-256=:{digest}:")

    def test_raw_echo_shows_exactly_what_we_sent(self):
        body = self.client().request(self.base + "/raw").body.decode()
        self.assertTrue(body.startswith("GET /raw HTTP/1.1\\r\\n\nHost: 127.0.0.1:"))

    def test_command_line(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            status = hc.main(["-v", self.base + "/redirect/2", "--body", "0"])
        self.assertEqual(status, 0)
        self.assertIn("< 200 OK", out.getvalue())
        self.assertIn("3 requests, the last on connection #1 (reused)", out.getvalue())


@unittest.skipUnless(shutil.which("openssl"), "needs the openssl command to make a throwaway certificate")
class TlsTests(unittest.TestCase):
    def test_untrusted_certificate_is_rejected(self):
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        with tempfile.TemporaryDirectory() as tmp:
            cert, key = os.path.join(tmp, "cert.pem"), os.path.join(tmp, "key.pem")
            subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
                            "-subj", "/CN=127.0.0.1", "-keyout", key, "-out", cert],
                           check=True, capture_output=True)
            context.load_cert_chain(cert, key)
        listener = socket.create_server(("127.0.0.1", 0))
        self.addCleanup(listener.close)

        def handshake():
            conn, _ = listener.accept()
            with conn, contextlib.suppress(ssl.SSLError, OSError):
                context.wrap_socket(conn, server_side=True)

        threading.Thread(target=handshake, daemon=True).start()
        with self.assertRaises(ssl.SSLCertVerificationError):
            hc.Connection.open("https", "127.0.0.1", listener.getsockname()[1], timeout=5)


if __name__ == "__main__":
    unittest.main()
