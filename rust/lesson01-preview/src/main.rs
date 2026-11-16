// A raw HTTP/1.1 GET over a plain TCP socket, std only.
use std::io::{Read, Write};
use std::net::TcpStream;

fn main() -> std::io::Result<()> {
    let host = "example.com";
    let mut stream = TcpStream::connect((host, 80))?;

    let request = format!(
        "GET / HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\nUser-Agent: BrowserCookbook/0.1\r\n\r\n"
    );
    stream.write_all(request.as_bytes())?;

    let mut response = Vec::new();
    stream.read_to_end(&mut response)?;

    let text = String::from_utf8_lossy(&response);
    let (head, body) = text.split_once("\r\n\r\n").unwrap_or((&*text, ""));
    println!("{head}\n\n[{} body bytes, still chunk-encoded]", body.len());
    Ok(())
}
