"""Offline tests for Lesson 1. Run from the repo root:

    python3 -m unittest discover -s python/lesson01 -v
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))

import fetch  # noqa: E402
import testserver  # noqa: E402
from url_inspector import inspect_url  # noqa: E402


class InspectUrlTests(unittest.TestCase):
    def test_default_port_and_origin(self):
        info = inspect_url("https://Example.COM/a")
        self.assertEqual(info["host"], "example.com")
        self.assertEqual(info["port"], 443)
        self.assertFalse(info["explicit_port"])
        self.assertEqual(info["origin"], ("https", "example.com", 443))

    def test_explicit_port_changes_the_origin(self):
        info = inspect_url("http://example.com:8080/")
        self.assertEqual(info["origin"], ("http", "example.com", 8080))
        self.assertTrue(info["explicit_port"])

    def test_ipv6_literal_loses_its_brackets(self):
        info = inspect_url("http://[::1]:8000/x")
        self.assertEqual(info["host"], "::1")
        self.assertEqual(info["port"], 8000)

    def test_fragment_is_not_part_of_the_request_target(self):
        info = inspect_url("https://example.com/p?q=1#frag")
        self.assertEqual(info["request_target"], "/p?q=1")
        self.assertEqual(info["fragment"], "frag")

    def test_empty_path_becomes_slash(self):
        self.assertEqual(inspect_url("https://example.com")["request_target"], "/")

    def test_blank_query_values_are_kept(self):
        self.assertEqual(inspect_url("https://e.com/?a=1&flag")["query"], [("a", "1"), ("flag", "")])

    def test_rejects_unsupported_scheme(self):
        with self.assertRaises(ValueError):
            inspect_url("ftp://example.com/")

    def test_rejects_missing_host(self):
        with self.assertRaises(ValueError):
            inspect_url("https:///path")

    def test_rejects_out_of_range_port(self):
        with self.assertRaises(ValueError):
            inspect_url("https://example.com:99999/")

    def test_urlsplit_does_not_treat_backslash_as_slash(self):
        # A parser differential: new URL() in a browser gives host "example.com".
        self.assertEqual(inspect_url("https://example.com\\path")["host"], "example.com\\path")


class FetchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server, cls.base = testserver.serve_in_background()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_404_is_a_response_not_an_exception(self):
        result = fetch.fetch(self.base + "/status/404", timeout=5)
        self.assertEqual(result["status"], 404)
        self.assertFalse(result["refused"])

    def test_redirect_hops_are_recorded(self):
        result = fetch.fetch(self.base + "/redirect/3", timeout=5)
        self.assertEqual(result["status"], 200)
        self.assertEqual([hop[0] for hop in result["redirects"]], [302, 302, 302])
        self.assertTrue(result["final_url"].endswith("/get"))

    def test_redirect_limit(self):
        result = fetch.fetch(self.base + "/redirect/12", timeout=5)
        self.assertTrue(result["refused"])
        self.assertEqual(result["status"], 302)
        self.assertEqual(result["reason"], "Found")
        self.assertEqual(len(result["redirects"]), fetch.RecordingRedirectHandler.max_redirections)

    def test_urllib_will_not_resend_a_post_body_on_307(self):
        url = self.base + "/redirect-to?url=/anything&status_code=307"
        result = fetch.fetch(url, method="POST", timeout=5)
        self.assertTrue(result["refused"])
        self.assertEqual((result["status"], result["redirects"]), (307, []))

    def test_urllib_turns_post_into_get_on_302(self):
        url = self.base + "/redirect-to?url=/anything&status_code=302"
        result = fetch.fetch(url, method="POST", timeout=5)
        self.assertEqual(result["status"], 200)
        self.assertIn(b'"method": "GET"', result["body"])

    def test_head_has_no_body(self):
        result = fetch.fetch(self.base + "/get", method="HEAD", timeout=5)
        self.assertEqual(result["body"], b"")
        self.assertIn("Content-Length", result["headers"])

    def test_timeout_is_per_operation_not_a_deadline(self):
        # 4 bytes over ~1.2 s, with a 0.6 s timeout: every recv() succeeds in time.
        result = fetch.fetch(self.base + "/drip?duration=1.2&numbytes=4", timeout=0.6)
        self.assertEqual(result["body"], b"****")
        self.assertGreater(result["elapsed"], 0.6)


if __name__ == "__main__":
    unittest.main()
