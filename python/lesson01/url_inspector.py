"""Lesson 1: take a URL apart and resolve its host, using only the standard library.

Usage:
    python3 url_inspector.py "https://user@example.com:8443/a/b%20c?q=1&lang=en#top"
"""
import socket
import sys
from urllib.parse import parse_qsl, unquote, urlsplit

DEFAULT_PORTS = {"http": 80, "https": 443}


def inspect_url(url):
    """Split a URL into the pieces a browser needs before it can open a connection."""
    parts = urlsplit(url)
    if parts.scheme not in DEFAULT_PORTS:
        raise ValueError(f"unsupported scheme: {parts.scheme!r}")
    if not parts.hostname:
        raise ValueError("URL has no host")
    port = parts.port if parts.port is not None else DEFAULT_PORTS[parts.scheme]

    return {
        "scheme": parts.scheme,
        "username": parts.username,
        "host": parts.hostname,  # lowercased, brackets stripped from IPv6 literals
        "port": port,
        "explicit_port": parts.port is not None,
        "origin": (parts.scheme, parts.hostname, port),
        "path": parts.path or "/",
        "decoded_path": unquote(parts.path or "/"),
        "query": parse_qsl(parts.query, keep_blank_values=True),
        "fragment": parts.fragment,  # never sent to the server
        "request_target": (parts.path or "/") + (f"?{parts.query}" if parts.query else ""),
    }


def resolve(host, port):
    """Ask the OS resolver for every address we could connect to, deduplicated."""
    addresses = []
    for family, _type, _proto, _canon, sockaddr in socket.getaddrinfo(
        host, port, type=socket.SOCK_STREAM
    ):
        entry = ("IPv6" if family == socket.AF_INET6 else "IPv4", sockaddr[0])
        if entry not in addresses:
            addresses.append(entry)
    return addresses


def main(argv):
    if len(argv) != 2:
        print(__doc__.strip())
        return 2

    try:
        info = inspect_url(argv[1])
    except ValueError as err:
        print(f"error: {err}")
        return 1

    width = max(len(key) for key in info)
    for key, value in info.items():
        print(f"{key:<{width}}  {value!r}")

    print()
    try:
        for family, address in resolve(info["host"], info["port"]):
            print(f"{family:<4}  {address}")
    except (socket.gaierror, UnicodeError) as err:  # UnicodeError: a label IDNA can't encode
        print(f"DNS lookup failed: {err}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
