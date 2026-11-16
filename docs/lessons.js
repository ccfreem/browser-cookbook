/*
 * The Browser Cookbook — course content.
 *
 * This file is pure data. The UI in app.js renders whatever is defined here.
 * See README.md ("Adding a lesson") for the full content model.
 *
 * Conventions:
 *   - Everything here is trusted author content. Inline HTML is allowed in prose
 *     fields: `html`, list `items`, table cells, definition descriptions and
 *     experiment `observe` notes. Titles, labels, captions, commands, output and
 *     code are always escaped.
 *   - Code is written with String.raw so backslashes survive untouched.
 *     Avoid backticks and "${" inside code samples.
 */
(function () {
  'use strict';

  const COURSE = {
    id: 'browser-cookbook',
    title: 'The Browser Cookbook',
    subtitle: 'Build a browser from the wire to the window.',
    weeklyCommitment: 'A few hours',
    path: ['Prototype in Python', 'Rebuild the core in Rust', 'Ship a desktop browser'],

    parts: [
      { id: 'network', numeral: 'I', title: 'Understanding the network', tagline: 'Understand the network',
        summary: 'URLs, DNS, TCP, TLS and HTTP — everything that happens before the first byte of HTML.' },
      { id: 'documents', numeral: 'II', title: 'Understanding documents', tagline: 'Understand documents',
        summary: 'Turn bytes into a DOM and a set of computed styles.' },
      { id: 'pixels', numeral: 'III', title: 'Understanding pixels', tagline: 'Understand pixels',
        summary: 'Layout, painting, rasterization and compositing.' },
      { id: 'applications', numeral: 'IV', title: 'Understanding applications', tagline: 'Understand applications',
        summary: 'JavaScript engines, the event loop and the APIs that make pages interactive.' },
      { id: 'architecture', numeral: 'V', title: 'Understanding browser architecture', tagline: 'Understand browser architecture',
        summary: 'Processes, IPC, navigation, storage and the security model.' },
      { id: 'engineering', numeral: 'VI', title: 'Performance, accessibility and compatibility', tagline: 'Become a browser engineer',
        summary: 'Measure, invalidate incrementally, expose an accessibility tree and test against WPT.' },
      { id: 'rust', numeral: 'VII', title: 'Shipping it in Rust', tagline: 'Ship a desktop browser',
        summary: 'Assemble the engine in Rust, wrap it in a native desktop shell, and benchmark it against Chromium.' },
    ],

    milestones: [
      { id: 'm1', title: 'First bytes', lessons: ['l01', 'l02', 'l03'],
        summary: 'A Python network stack: HTTP/1.1 over raw TCP and TLS sockets, plus your own DNS resolver.' },
      { id: 'm2', title: 'A document in memory', lessons: ['l04', 'l05', 'l06', 'l07'],
        summary: 'Parse HTML and CSS into a DOM annotated with computed styles.' },
      { id: 'm3', title: 'First pixels', lessons: ['l08', 'l09', 'l10', 'l11', 'l12'],
        summary: 'Fetch, style, lay out and paint simple real pages into a window.' },
      { id: 'm4', title: 'Interactive pages', lessons: ['l13', 'l14', 'l15', 'l16', 'l17'],
        summary: 'Run scripts, dispatch events and fetch data.' },
      { id: 'm5', title: 'A real architecture', lessons: ['l18', 'l19', 'l20', 'l21', 'l22', 'l23'],
        summary: 'Split the browser into sandboxed processes with tabs, storage and a security model.' },
      { id: 'm6', title: 'Browser engineer', lessons: ['l24', 'l25', 'l26', 'l27'],
        summary: 'Measure, invalidate incrementally, expose accessibility and test against WPT.' },
      { id: 'm7', title: 'Rust engine', lessons: ['l28'],
        summary: 'The core engine in Rust, with parity tests against the Python prototype.' },
      { id: 'm8', title: 'Desktop browser', lessons: ['l29', 'l30'],
        summary: 'A native desktop browser for the static web, benchmarked phase by phase against Chromium.' },
    ],

    environments: [
      {
        id: 'local',
        title: 'Local terminal (macOS / Linux)',
        html: '<p>You need Python 3.11 or newer; Parts I and II use only the standard library. Run every command from the repo root. <code>dig</code>, <code>curl</code>, <code>nc</code> and <code>openssl</code> are used for observation.</p>' +
          '<p><strong>On macOS</strong>, <code>/usr/bin/openssl</code> is LibreSSL: it rejects <code>-brief</code> and can\u2019t negotiate post-quantum key exchange. Install OpenSSL 3.5 or newer (<code>brew install openssl@3</code>) and put it first on your <code>PATH</code>.</p>',
        commands: ['git clone <your-repo-url> browser-cookbook', 'cd browser-cookbook', 'python3 --version', 'python3 python/lesson01/url_inspector.py https://example.com'],
      },
      {
        id: 'testserver',
        title: 'Local test server (offline httpbin)',
        html: '<p>Many experiments use <a href="https://httpbin.org" target="_blank" rel="noopener">httpbin.org</a>, which is sometimes slow or down. <code>python/tools/testserver.py</code> serves the same routes on <code>http://localhost:8080</code>, plus the framing cases Lesson 2 needs: <code>/chunked</code>, <code>/trailers</code>, <code>/close</code>, <code>/early-hints</code> and <code>/raw</code>, which echoes back the exact bytes you sent. Leave it running in a second terminal and swap <code>https://httpbin.org</code> for <code>http://localhost:8080</code> in the course\u2019s commands. (Timings and a few headers differ, and it speaks plain HTTP, not HTTPS.)</p>',
        commands: ['python3 python/tools/testserver.py', 'python3 python/lesson01/fetch.py http://localhost:8080/redirect/3'],
      },
      {
        id: 'tests',
        title: 'Running the tests',
        html: '<p>Each lesson folder with code has a <code>test_*.py</code> file. The tests run offline: they start their own copy of the test server on a free port. Run them before you start an exercise and again when you think you\u2019ve finished.</p>',
        commands: ['python3 -m unittest discover -s python/lesson01 -v', 'python3 -m unittest discover -s python/lesson02 -v'],
      },
      {
        id: 'gui',
        title: 'Graphics with Tkinter (from Lesson 8)',
        html: '<p>Part III draws into a window with Tkinter. <code>python3 -m tkinter</code> should open a small window. Homebrew\u2019s Python ships without Tk, so install the formula matching <code>python3 --version</code>, for example <code>brew install python-tk@3.14</code>. On Debian or Ubuntu, install <code>python3-tk</code>.</p>',
        commands: ['python3 -m tkinter'],
      },
      {
        id: 'codespaces',
        title: 'GitHub Codespaces',
        html: '<p>Push this repo to GitHub, then open <strong>Code → Codespaces → Create codespace on main</strong>. The default image ships Python 3 and can install Rust. A Codespace has no display, so it covers Parts I and II but not the Tkinter windows of Part III, unless you add the <code>desktop-lite</code> dev container feature and use its browser-based desktop.</p>',
        commands: ['python3 --version', 'python3 python/lesson01/fetch.py https://example.com'],
      },
      {
        id: 'rust',
        title: 'Rust toolchain',
        html: '<p>Rust appears as previews and optional <em>Rust track</em> stretch challenges from Lesson 1, and becomes the main language in Part VII. Install it with <a href="https://rustup.rs" target="_blank" rel="noopener">rustup</a>.</p>',
        commands: ["curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh", 'cargo run --manifest-path rust/lesson01-preview/Cargo.toml'],
      },
    ],

    diagrams: {},
    lessons: [],
  };

  /* ------------------------------------------------------------------ */
  /* Diagrams. Types: sequence, pipeline, url, tree, boxes.              */
  /* Lessons reference them with { type: 'diagram', id: '...' }.         */
  /* ------------------------------------------------------------------ */

  COURSE.diagrams['url-anatomy'] = {
    type: 'url',
    title: 'Anatomy of a URL',
    caption: 'Tap a component (or step through) to see what the browser does with it.',
    parts: [
      { text: 'https', label: 'scheme', detail: 'Selects the protocol and the default port (443). "https" is a special scheme in the WHATWG URL Standard, which gives it different parsing rules: a backslash counts as a slash, for one.' },
      { text: '://' },
      { text: 'user', label: 'userinfo', detail: 'Legacy inline credentials. Browsers strip or warn about them; they are a phishing vector (https://bank.com@evil.example/).' },
      { text: '@' },
      { text: 'example.com', label: 'host', detail: 'A domain name, IPv4 address or [bracketed] IPv6 literal. Domains are lowercased and converted to ASCII via IDNA before DNS sees them.' },
      { text: ':' },
      { text: '8443', label: 'port', detail: 'Optional. When omitted, the scheme default applies. Scheme + host + port together form the origin, the unit of web security.' },
      { text: '/a/b%20c', label: 'path', detail: 'Hierarchical and percent-encoded. Dot segments (/./ and /../) are resolved by the parser. This plus the query becomes the HTTP request target.' },
      { text: '?' },
      { text: 'q=1&lang=en', label: 'query', detail: 'Opaque to HTTP. The key=value&... shape is just the application/x-www-form-urlencoded convention.' },
      { text: '#' },
      { text: 'top', label: 'fragment', detail: 'Client-side only: never sent to the server. Changing it does not trigger a network navigation, which is why early SPAs routed with it.' },
    ],
  };

  COURSE.diagrams['client-server'] = {
    type: 'pipeline',
    title: 'From a browser tab to an origin server',
    caption: 'The browser never touches the wire itself. It hands bytes to the kernel, which hands packets to the network.',
    stages: [
      { label: 'Browser', sub: 'Application: builds HTTP messages, runs TLS', detail: 'Decides what to request, encrypts it with TLS (BoringSSL in Chromium, NSS in Firefox) and writes bytes into a socket.' },
      { label: 'Kernel TCP/IP stack', sub: 'Transport + network: sockets, TCP, IP', detail: 'A socket is a kernel object behind a file descriptor. The kernel segments the stream, numbers bytes, retransmits losses and routes packets.' },
      { label: 'Home router / NAT', sub: 'Rewrites source address and port (IPv4)', detail: 'For IPv4, your private 192.168.x.x address is translated to a public one, and NAT keeps a table keyed by the connection 5-tuple. IPv6 usually needs no NAT: your device has a public address of its own.' },
      { label: 'ISP and internet backbone', sub: 'Routing between autonomous systems', detail: 'BGP routes packets across many networks. Each hop adds latency; the speed of light sets a hard floor on the round-trip time.' },
      { label: 'CDN edge', sub: 'Terminates TCP/TLS close to you', detail: 'example.com is served by Cloudflare. The edge terminates TLS near the user and answers from cache (note "cf-cache-status: HIT").' },
      { label: 'Origin server', sub: 'Generates the response', detail: 'The application server that actually owns the content. On a cache miss, the edge forwards the request here over its own connection.' },
    ],
  };

  COURSE.diagrams['dns-resolution'] = {
    type: 'sequence',
    title: 'Recursive DNS resolution (cold cache)',
    caption: 'From the stub resolver onward, every arrow is usually one UDP datagram to port 53. A warm cache short-circuits most of this.',
    actors: ['Browser', 'OS', 'Resolver', 'Root', 'TLD', 'Auth'],
    steps: [
      { note: 0, label: 'host cache miss', detail: 'The browser keeps its own host cache (chrome://net-internals/#dns). Miss — ask the operating system.' },
      { from: 0, to: 1, label: 'getaddrinfo()', detail: 'The OS stub resolver checks /etc/hosts and its own cache. It never walks the hierarchy itself.' },
      { from: 1, to: 2, label: 'A? example.com', detail: 'The stub forwards the query to the recursive resolver configured by DHCP: your ISP, 1.1.1.1, 8.8.8.8, and so on.' },
      { from: 2, to: 3, label: 'A? example.com', detail: 'Cold cache: the resolver asks a root server. There are 13 root server identities (a. to m.root-servers.net), each anycast from many sites: well over a thousand machines in all. Many resolvers send less than the full name (QNAME minimisation, RFC 9156): the root is only asked about "com.".' },
      { from: 3, to: 2, label: 'go ask .com NS', dashed: true, detail: 'The root does not know the answer. It returns a referral: the name servers for the .com TLD.' },
      { from: 2, to: 4, label: 'A? example.com', detail: 'The resolver repeats the question to a .com TLD server.' },
      { from: 4, to: 2, label: 'go ask example NS', dashed: true, detail: 'Another referral, this time to the authoritative name servers for example.com.' },
      { from: 2, to: 5, label: 'A? example.com', detail: 'Finally the authoritative server, which owns the zone.' },
      { from: 5, to: 2, label: 'A 104.20.23.154', dashed: true, detail: 'The answer, with a TTL. The resolver caches it, along with the referrals, for the TTL duration.' },
      { from: 2, to: 1, label: 'answer', dashed: true, detail: 'The resolver returns the final answer to the stub resolver.' },
      { from: 1, to: 0, label: 'addresses', dashed: true, detail: 'getaddrinfo returns a list of addresses sorted by OS preference (RFC 6724). The browser can now connect.' },
    ],
  };

  COURSE.diagrams['tcp-handshake'] = {
    type: 'sequence',
    title: 'TCP three-way handshake',
    caption: 'One round trip before any application data can flow.',
    actors: ['Client', 'Server'],
    steps: [
      { note: 1, label: 'LISTEN', detail: 'The server has called listen() on port 443 and is waiting in accept().' },
      { from: 0, to: 1, label: 'SYN  seq=x', detail: 'The client picks a random initial sequence number x and advertises options: MSS, window scaling, SACK, timestamps. Client state: SYN-SENT.' },
      { from: 1, to: 0, label: 'SYN-ACK  seq=y ack=x+1', dashed: true, detail: 'The server acknowledges x (expecting byte x+1 next) and sends its own random sequence number y. Server state: SYN-RECEIVED.' },
      { from: 0, to: 1, label: 'ACK  ack=y+1', detail: 'The client acknowledges y. Both sides have now confirmed each other\u2019s sequence numbers. ESTABLISHED.' },
      { from: 0, to: 1, label: 'data (TLS ClientHello)', detail: 'The client may send data immediately alongside or after the ACK. With TLS, the first payload is the ClientHello.' },
    ],
  };

  COURSE.diagrams['tls-handshake'] = {
    type: 'sequence',
    title: 'TLS 1.3 full handshake',
    caption: 'Braces mean encrypted. One round trip, after which HTTP flows encrypted.',
    actors: ['Client', 'Server'],
    steps: [
      { from: 0, to: 1, label: 'ClientHello + key_share', detail: 'Supported cipher suites, a key share for its guessed group (X25519, or hybrid X25519MLKEM768), SNI with the hostname, and ALPN offering h2 and http/1.1.' },
      { from: 1, to: 0, label: 'ServerHello + key_share', dashed: true, detail: 'The server picks a cipher suite and returns its key share. Both sides can now derive handshake keys (with X25519MLKEM768, from ECDHE and ML-KEM together): everything after this is encrypted. Had the client guessed a group the server doesn\u2019t support, a HelloRetryRequest would cost an extra round trip.' },
      { from: 1, to: 0, label: '{EncryptedExtensions}', dashed: true, detail: 'Includes the ALPN result (for example h2). In TLS 1.2 this was visible to observers; in 1.3 it is encrypted.' },
      { from: 1, to: 0, label: '{Certificate}', dashed: true, detail: 'The certificate chain. The client verifies it up to a trusted root, checks the hostname, validity dates and Certificate Transparency.' },
      { from: 1, to: 0, label: '{CertificateVerify, Finished}', dashed: true, detail: 'CertificateVerify signs the handshake transcript, proving the server holds the private key. Finished is a MAC over the transcript.' },
      { from: 0, to: 1, label: '{Finished}', detail: 'The client confirms the transcript. Application traffic keys are derived.' },
      { from: 0, to: 1, label: '{GET / HTTP/1.1}', detail: 'The first HTTP request can ride in the same flight as the client Finished, so TLS 1.3 costs one RTT.' },
      { from: 1, to: 0, label: '{HTTP/1.1 200 OK}', dashed: true, detail: 'The encrypted response. From here on it is ordinary HTTP inside TLS records.' },
    ],
  };

  COURSE.diagrams['http-exchange'] = {
    type: 'sequence',
    title: 'An HTTP/1.1 request and response',
    caption: 'HTTP/1.1 is a text protocol. Framing is decided by the headers, not by packets.',
    actors: ['Browser', 'Server'],
    steps: [
      { from: 0, to: 1, label: 'GET /headers HTTP/1.1', detail: 'Request line: method, request target (path + query, not the full URL), protocol version. Lines end with CRLF.' },
      { from: 0, to: 1, label: 'Host, User-Agent, Accept', detail: 'Header fields. Host is mandatory in HTTP/1.1, because many sites share one IP address.' },
      { from: 0, to: 1, label: 'CRLF (end of headers)', detail: 'An empty line marks the end of the header section. GET has no body here.' },
      { note: 1, label: 'route + handle', detail: 'Server time: routing, application logic, database queries. This is the "S" in TTFB that the network can\u2019t fix.' },
      { from: 1, to: 0, label: 'HTTP/1.1 200 OK', dashed: true, detail: 'Status line: version, status code, reason phrase. Clients should ignore the reason phrase.' },
      { from: 1, to: 0, label: 'Content-Type, Content-Length', dashed: true, detail: 'Response headers. Content-Length or Transfer-Encoding: chunked tells the client where the body ends.' },
      { from: 1, to: 0, label: 'body bytes', dashed: true, detail: 'Exactly Content-Length bytes, or a series of chunks, or, with neither header, everything until the server closes the connection.' },
    ],
  };

  COURSE.diagrams['full-navigation'] = {
    type: 'sequence',
    title: 'A cold navigation to https://example.com',
    caption: 'Count the round trips: DNS, TCP, TLS, then HTTP — roughly four before the first byte of HTML.',
    actors: ['Browser', 'Resolver', 'Server'],
    steps: [
      { note: 0, label: 'parse URL', detail: 'Parse the omnibox input into a URL: scheme https, host example.com, port 443, path /.' },
      { from: 0, to: 1, label: 'DNS query', detail: 'Resolve example.com. Free if cached, one RTT to the resolver if the resolver has it cached, more if not.' },
      { from: 1, to: 0, label: 'A / AAAA records', dashed: true, detail: 'IP addresses arrive. Happy Eyeballs races IPv6 and IPv4 connection attempts.' },
      { from: 0, to: 2, label: 'SYN', detail: 'TCP handshake begins: round trip #2.' },
      { from: 2, to: 0, label: 'SYN-ACK', dashed: true, detail: 'The server accepts the connection.' },
      { from: 0, to: 2, label: 'ACK + ClientHello', detail: 'TCP is established; TLS starts immediately in the same flight: round trip #3.' },
      { from: 2, to: 0, label: 'ServerHello \u2026 Finished', dashed: true, detail: 'Keys agreed, certificate verified.' },
      { from: 0, to: 2, label: 'Finished + GET /', detail: 'The HTTP request rides with the client Finished: round trip #4.' },
      { from: 2, to: 0, label: '200 OK + HTML', dashed: true, detail: 'First byte of HTML. Parsing, styling, layout and painting (Parts II and III) start streaming from here.' },
    ],
  };

  COURSE.diagrams['html-parsing'] = {
    type: 'pipeline',
    title: 'The HTML parsing pipeline',
    caption: 'A streaming pipeline: the tree is built while bytes are still arriving.',
    stages: [
      { label: 'Bytes', sub: 'from the network, in chunks', detail: 'The parser receives bytes incrementally. It must not wait for the full document.' },
      { label: 'Decoding', sub: 'encoding sniffing → code points', detail: 'BOM, Content-Type charset, <meta charset> prescan within the first 1024 bytes, then a fallback. A late discovery forces a reparse.' },
      { label: 'Tokenizer', sub: 'state machine, ~80 states', detail: 'Emits DOCTYPE, start tag, end tag, comment, character and EOF tokens. The tree builder can switch its state (for example to RAWTEXT inside <style>).' },
      { label: 'Tree construction', sub: 'insertion modes + open element stack', detail: 'Applies insertion modes ("in head", "in body", "in table"...), implies missing tags and recovers from errors: adoption agency, foster parenting.' },
      { label: 'DOM', sub: 'Document, Element, Text nodes', detail: 'The result is observable by script while parsing. A classic <script> without async or defer pauses tree construction until it has run (module scripts are deferred by default), while a speculative preload scanner keeps fetching ahead.' },
    ],
  };

  COURSE.diagrams['dom-tree'] = {
    type: 'tree',
    title: 'Tree construction for a tiny document',
    caption: 'Input: <!doctype html><title>Hi</title><p>Hello <b>web</b>. Note the elements the parser invents.',
    nodes: [
      { depth: 0, label: '#document', kind: 'doc', detail: 'Created before any token is processed.' },
      { depth: 1, label: '<!DOCTYPE html>', kind: 'meta', detail: 'DOCTYPE token → DocumentType node. Its absence would switch the document to quirks mode.' },
      { depth: 1, label: '<html>', kind: 'element', detail: 'Implied: the <title> start tag in "before html" mode creates an html element automatically.' },
      { depth: 2, label: '<head>', kind: 'element', detail: 'Implied again, by "before head" mode.' },
      { depth: 3, label: '<title>', kind: 'element', detail: 'Start tag token. The tokenizer switches to RCDATA so "Hi" cannot contain tags.' },
      { depth: 4, label: '"Hi"', kind: 'text', detail: 'Character tokens coalesce into one Text node.' },
      { depth: 2, label: '<body>', kind: 'element', detail: 'A <p> can\u2019t go in head: "in head" mode pops head and moves to "after head", which implies <body> and reprocesses the <p>.' },
      { depth: 3, label: '<p>', kind: 'element', detail: 'Inserted into body and pushed onto the stack of open elements.' },
      { depth: 4, label: '"Hello "', kind: 'text', detail: 'Text node child of p.' },
      { depth: 4, label: '<b>', kind: 'element', detail: 'Formatting element: also recorded in the list of active formatting elements, which drives the adoption agency algorithm.' },
      { depth: 5, label: '"web"', kind: 'text', detail: 'The only child of b. The </b> end tag then pops b off the stack.' },
      { depth: 4, label: '"."', kind: 'text', detail: 'Back in p, the full stop becomes p\u2019s third child. EOF then closes p, body and html. No parse error was reported, despite all the missing tags.' },
    ],
  };

  COURSE.diagrams['css-cascade'] = {
    type: 'pipeline',
    title: 'Resolving one property on one element',
    caption: 'The cascade picks a winning declaration; inheritance and defaulting fill the gaps.',
    stages: [
      { label: 'Collect declarations', sub: 'all rules whose selectors match', detail: 'Selector matching, usually right-to-left with bloom filters for ancestor checks, gathers every declaration for this property.' },
      { label: 'Origin & importance', sub: 'UA < user < author; !important reverses', detail: 'Transitions and animations also sit in this ordering. !important flips the origin order.' },
      { label: 'Context', sub: 'shadow tree vs outer tree', detail: 'For normal declarations the outer (light DOM) context wins over rules inside a shadow tree; !important reverses that.' },
      { label: 'Style attribute', sub: 'element-attached declarations', detail: 'A style="" attribute beats every selector-based rule of the same origin and importance, whatever their specificity.' },
      { label: 'Layers', sub: '@layer order', detail: 'Later layers beat earlier ones and unlayered author styles beat all layers, for normal declarations. !important reverses the layer order.' },
      { label: 'Specificity', sub: '(ids, classes, types)', detail: 'Compared as a tuple, never as a base-10 number. :is() and :not() take their most specific argument; :where() contributes zero.' },
      { label: 'Order of appearance', sub: 'last one wins', detail: 'The final tiebreaker.' },
      { label: 'Defaulting', sub: 'inherit or initial', detail: 'No declaration? Inherited properties take the parent\u2019s computed value; others take the initial value.' },
      { label: 'Computed value', sub: 'resolve relative units, var()', detail: 'em → px, var() substitution, keywords resolved. Percentages often stay unresolved until layout (used value).' },
    ],
  };

  COURSE.diagrams['rendering-pipeline'] = {
    type: 'pipeline',
    title: 'The rendering pipeline',
    caption: 'Each stage consumes the previous stage\u2019s output. Invalidation decides how far back a change forces you to go.',
    stages: [
      { label: 'Parse', sub: 'HTML → DOM, CSS → stylesheets', detail: 'Part II covers this in depth.' },
      { label: 'Style', sub: 'computed style per element', detail: 'The cascade runs for every element, sharing work between siblings where possible.' },
      { label: 'Layout', sub: 'geometry: x, y, width, height', detail: 'Builds a layout tree, which is not the DOM: display:none is absent, ::before is present, anonymous boxes are added.' },
      { label: 'Paint', sub: 'display list of draw commands', detail: 'Records commands in stacking order (CSS2 Appendix E). Paint does not produce pixels.' },
      { label: 'Raster', sub: 'commands → pixels in tiles', detail: 'Off the main thread, on worker threads or the GPU. Chromium rasterizes with Skia; Firefox\u2019s WebRender draws most content directly on the GPU.' },
      { label: 'Composite', sub: 'layers → frame on screen', detail: 'Runs on the compositor thread, so scrolling and transform/opacity animations survive a busy main thread.' },
    ],
  };

  COURSE.diagrams['event-loop'] = {
    type: 'pipeline',
    title: 'One turn of the HTML event loop',
    caption: 'Tasks run to completion; microtasks drain completely after each one; rendering happens only at rendering opportunities. (Simplified: the current HTML Standard queues each rendering update as a task of its own, but the ordering rules shown here still hold.)',
    stages: [
      { label: 'Pick a task', sub: 'oldest runnable task from a chosen task queue', detail: 'There are several task queues (timers, networking, user interaction). The browser chooses which queue to service, which lets it prioritize input.' },
      { label: 'Run it to completion', sub: 'a script cannot be pre-empted', detail: 'A long task blocks input handling and rendering on this thread.' },
      { label: 'Microtask checkpoint', sub: 'drain promise jobs + MutationObserver', detail: 'Microtasks queued by microtasks run in the same checkpoint. An infinite promise chain starves rendering.' },
      { label: 'Update the rendering?', sub: 'only at a rendering opportunity (~vsync)', detail: 'Resize/scroll events, requestAnimationFrame callbacks, style, layout, paint. Skipped entirely when nothing changed or the tab is hidden.' },
      { label: 'Idle period', sub: 'requestIdleCallback', detail: 'If time remains before the next frame deadline.' },
    ],
  };

  COURSE.diagrams['multi-process'] = {
    type: 'boxes',
    title: 'Chromium-style multi-process architecture',
    caption: 'Untrusted web content runs in sandboxed renderers. Privileged work lives in other processes, reached via IPC.',
    groups: [
      { label: 'Browser process', sub: 'privileged, one for the whole browser', items: [
        { label: 'UI thread', detail: 'Tabs, address bar, navigation decisions, permission prompts.' },
        { label: 'IO thread', detail: 'Routes IPC messages between processes.' },
      ] },
      { label: 'Renderer processes', sub: 'sandboxed, roughly one per site', items: [
        { label: 'Main thread', detail: 'Blink + V8: parsing, style, layout, paint, JavaScript.' },
        { label: 'Compositor thread', detail: 'Scrolling and animations without the main thread.' },
        { label: 'Raster workers', detail: 'Prepare tiles and serialize paint operations. With out-of-process raster, the default, the GPU process does the actual rasterizing.' },
      ] },
      { label: 'GPU process', sub: 'talks to the graphics driver', items: [
        { label: 'Viz / display compositor', detail: 'Aggregates compositor frames from every renderer and the browser UI into one frame.' },
      ] },
      { label: 'Network service', sub: 'utility process', items: [
        { label: 'URLLoader', detail: 'DNS, sockets, TLS, HTTP cache, cookies. Renderers never open sockets themselves.' },
      ] },
    ],
  };

  COURSE.diagrams['request-bytes'] = {
    type: 'url',
    title: 'An HTTP/1.1 request head, byte by byte',
    caption: 'On the wire a request is one stream of ASCII. Lines end in CR LF (shown as \\r\\n), and an empty line ends the head.',
    parts: [
      { text: 'GET', label: 'method', detail: 'A case-sensitive token: "get" would be a different, unknown method.' },
      { text: ' ' },
      { text: '/raw', label: 'request target', detail: 'Path plus query, already percent-encoded. Never the fragment.' },
      { text: ' ' },
      { text: 'HTTP/1.1', label: 'version', detail: 'HTTP/1.1 means a mandatory Host field and connections that stay open by default.' },
      { text: '\\r\\n', label: 'CRLF', detail: 'Bytes 0x0D 0x0A end every line of the head. Recipients may also accept a bare LF, and browsers do.' },
      { text: 'Host', label: 'field name', detail: 'A token, compared case-insensitively. No whitespace is allowed before the colon: lenient parsing there is a request-smuggling vector.' },
      { text: ': ' },
      { text: 'localhost:8080', label: 'field value', detail: 'Surrounding spaces are trimmed. A value must never contain CR or LF, or whoever controls it can inject extra header lines.' },
      { text: '\\r\\n' },
      { text: '\\r\\n', label: 'empty line', detail: 'More field lines would go before this. The first empty line ends the head; a body, if any, follows immediately, and its length must be declared with Content-Length or Transfer-Encoding.' },
    ],
  };

  COURSE.diagrams['body-length'] = {
    type: 'pipeline',
    title: 'Where does a response body end? (RFC 9112 §6.3)',
    caption: 'The rules apply in this order, and the first one that matches decides. read_body() is these four boxes.',
    stages: [
      { label: 'No body at all', sub: 'HEAD request, or status 1xx, 204, 304', detail: 'Whatever Content-Length says. A HEAD response advertises the length a GET would have had; a client that waits for those bytes hangs until it times out.' },
      { label: 'Transfer-Encoding', sub: 'ends in chunked → decode chunks', detail: 'Overrides Content-Length when both are present. Both at once is a smuggling signature: decode by Transfer-Encoding, then close the connection. If chunked isn\u2019t the final coding, read until close. (This client only supports plain "chunked" and rejects stacked codings such as "gzip, chunked", which are almost never seen.)' },
      { label: 'Content-Length', sub: 'read exactly N bytes', detail: 'Digits only. A list of identical values ("5, 5") is allowed; anything else is a fatal framing error, never a guess.' },
      { label: 'Neither', sub: 'read until the server closes', detail: 'The HTTP/1.0 way. It works, but it costs the connection, and a truncated body looks exactly like a complete one.' },
    ],
  };

  COURSE.diagrams['chunked-body'] = {
    type: 'url',
    title: 'A chunked body with a trailer',
    caption: 'Two chunks, "Hello, " (7 bytes) and "world!" (6 bytes), then the last chunk, a trailer field and the final empty line.',
    parts: [
      { text: '7', label: 'chunk size', detail: 'Hexadecimal: "1a" would mean 26 bytes. Only hex digits are valid. Python\u2019s int(x, 16) also accepts "0x1a", "+1a" and "1_a", which is how two parsers come to disagree.' },
      { text: '\\r\\n' },
      { text: 'Hello, ', label: 'chunk data', detail: 'Exactly that many bytes, read with read_exact(). Chunk data can contain anything, CRLF included, so never scan it for line endings.' },
      { text: '\\r\\n', label: 'data CRLF', detail: 'Every chunk\u2019s data is followed by CRLF. Check it: if it is missing, the size was wrong and the stream is out of sync.' },
      { text: '6\\r\\nworld!\\r\\n' },
      { text: '0', label: 'last chunk', detail: 'A zero-size chunk ends the data. The body is "Hello, world!", but the message isn\u2019t over yet.' },
      { text: '\\r\\n' },
      { text: 'Content-Digest: …', label: 'trailer section', detail: 'Optional fields sent after the body, for metadata only known at the end, such as a checksum. Most clients ignore them, but you still have to read them to find the end of the message.' },
      { text: '\\r\\n' },
      { text: '\\r\\n', label: 'end', detail: 'An empty line ends the trailer section and the message. The next response on this connection starts with the very next byte.' },
    ],
  };

  COURSE.diagrams['keep-alive'] = {
    type: 'sequence',
    title: 'One connection, several requests',
    caption: 'Knowing exactly where each response ends is what makes the connection reusable.',
    actors: ['Client', 'Server'],
    steps: [
      { note: 0, label: 'open connection #1', detail: 'DNS, TCP and TLS: about three round trips when cold. The pool files the connection under its origin, (https, httpbin.org, 443).' },
      { from: 0, to: 1, label: 'GET /get', detail: 'The first request on the connection. Measured: 510 ms, handshakes included.' },
      { from: 1, to: 0, label: '200, Content-Length: 270', dashed: true, detail: 'The client reads exactly 270 body bytes. The next byte on the stream will belong to the next response.' },
      { note: 0, label: 'back to the pool', detail: 'No Connection: close and the body wasn\u2019t close-delimited, so the connection is idle, not finished.' },
      { from: 0, to: 1, label: 'GET /headers', detail: 'No DNS, no TCP, no TLS: just one round trip plus server time. Measured: 89 ms.' },
      { from: 1, to: 0, label: '200, Content-Length: 159', dashed: true, detail: 'Same rules again. The connection goes back to the pool.' },
      { note: 1, label: 'idle timeout', detail: 'The server closes the idle connection. Its FIN reaches the client\u2019s kernel, but nothing is reading the socket, so the client doesn\u2019t notice yet.' },
      { from: 0, to: 1, label: 'GET /ip', detail: 'sendall() succeeds even though the server has gone: the bytes just land in the kernel\u2019s send buffer. The server\u2019s kernel answers them with an RST.' },
      { from: 1, to: 0, label: 'recv() returns b""', dashed: true, detail: 'The client finally reads the FIN that arrived earlier: end of stream (or ConnectionResetError, if the RST got there first) before a single response byte. For an idempotent request on a reused connection, retry once on a fresh connection.' },
    ],
  };

  /* ------------------------------------------------------------------ */
  /* Lesson 1                                                           */
  /* ------------------------------------------------------------------ */

  const URL_INSPECTOR_PY = String.raw`"""Lesson 1: take a URL apart and resolve its host, using only the standard library.

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
    sys.exit(main(sys.argv))`;

  const FETCH_PY = String.raw`"""Lesson 1: a tiny HTTP client built on urllib, showing the conversation it hides.

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
    sys.exit(main())`;

  const RUST_PREVIEW = String.raw`// A raw HTTP/1.1 GET over a plain TCP socket, std only.
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
}`;

  COURSE.lessons.push({
    id: 'l01',
    number: 1,
    part: 'network',
    status: 'ready',
    title: 'What Actually Happens When You Open a Website?',
    summary: 'Follow one navigation from the address bar to the first byte of HTML: URL parsing, DNS, IP, TCP, TLS and HTTP. Then build a Python URL inspector and HTTP client.',
    minutes: 120,
    prerequisites: [],
    objectives: [
      'Trace one navigation through URL parsing, DNS, TCP, TLS and HTTP, naming the problem each layer solves.',
      'State what each step costs in round trips, and estimate a cold page load\u2019s latency from the RTT.',
      'Take a URL apart into its components and origin, and show inputs where browser and library parsers disagree.',
      'Make an HTTP request with Python and read the full exchange, including what the library added or hid.',
    ],
    build: 'python/lesson01/url_inspector.py and python/lesson01/fetch.py: a URL inspector with DNS lookup, and a urllib-based client that prints the HTTP conversation and redirect chain.',
    snippets: {
      url_inspector: { lang: 'python', file: 'python/lesson01/url_inspector.py', code: URL_INSPECTOR_PY },
      fetch: { lang: 'python', file: 'python/lesson01/fetch.py', code: FETCH_PY },
      rust_preview: { lang: 'rust', file: 'rust/lesson01-preview/src/main.rs', code: RUST_PREVIEW },
      raw_request: { lang: 'http', title: 'Request (the bytes fetch.py sends; each line ends in CRLF)', code: 'GET /headers HTTP/1.1\nAccept-Encoding: identity\nHost: httpbin.org\nUser-Agent: BrowserCookbook/0.1 (+lesson-01)\nAccept: */*\nConnection: close\n' },
      raw_response: { lang: 'http', title: 'Response', code: 'HTTP/1.1 200 OK\naccess-control-allow-credentials: true\naccess-control-allow-origin: *\naccess-control-expose-headers: Retry-After, RateLimit, RateLimit-Policy, WWW-Authenticate\ncontent-length: 159\ncontent-type: application/json\nx-content-type-options: nosniff\ndate: Sun, 15 Nov 2026 16:08:08 GMT\nconnection: close\n\n{\n  "headers": {\n    "Accept": "*/*",\n    "Accept-Encoding": "identity",\n    "Host": "httpbin.org",\n    "User-Agent": "BrowserCookbook/0.1 (+lesson-01)"\n  }\n}' },
      wire: { lang: 'text', title: 'fetch.py --wire https://httpbin.org/headers (first lines)', code: "send: b'GET /headers HTTP/1.1\\r\\nAccept-Encoding: identity\\r\\nHost: httpbin.org\\r\\nUser-Agent: BrowserCookbook/0.1 (+lesson-01)\\r\\nAccept: */*\\r\\nConnection: close\\r\\n\\r\\n'\nreply: 'HTTP/1.1 200 OK\\r\\n'\nheader: access-control-allow-credentials: true\nheader: access-control-allow-origin: *\nheader: content-length: 159\n...\n> GET /headers HTTP/1.1\n> Host: httpbin.org\n> User-agent: BrowserCookbook/0.1 (+lesson-01)\n> Accept: */*" },
    },
    body: [
      { type: 'h2', id: 'overview', text: 'The navigation, end to end' },
      { type: 'p', html: 'Press Enter in the address bar and the browser has a long list of jobs before a single byte of HTML arrives. It parses your input into a URL, resolves a name to an address, builds a reliable transport over an unreliable network, negotiates encryption and authenticates the server, and only then speaks HTTP. Each layer solves exactly one problem, and each has a price measured in <strong>round trips</strong>.' },
      { type: 'diagram', id: 'full-navigation' },
      { type: 'table', caption: 'Each phase, the problem it solves, and its latency cost.',
        head: ['Phase', 'Solves', 'Cost'],
        rows: [
          ['URL parsing', 'Text → scheme, host, port, path', 'Microseconds'],
          ['DNS', 'Name → IP addresses', '0 (cached) to several RTTs'],
          ['TCP', 'Reliable, ordered byte stream over lossy packets', '1 RTT'],
          ['TLS 1.3', 'Confidentiality, integrity, server identity', '1 RTT (0 with 0-RTT early data)'],
          ['HTTP', 'Request semantics, status, headers, body', '1 RTT + server time'],
        ] },
      { type: 'callout', tone: 'deep', title: 'Round trips are the unit of cost',
        html: '<p>A round-trip time (RTT) is how long a packet takes to get there and back. Bandwidth keeps improving, but the speed of light in fibre doesn\u2019t (about 200&nbsp;km per millisecond). On a 100&nbsp;ms mobile link, a cold navigation spends around 400&nbsp;ms in round trips before the first byte of HTML, before the server has done any work at all. Much of browser networking engineering — connection reuse, preconnect, 0-RTT resumption, HTTP/3 — exists to delete round trips.</p>' },

      { type: 'h2', id: 'urls', text: 'Anatomy of a URL' },
      { type: 'p', html: 'The browser\u2019s first job is pure computation. Before it can do anything on the network it needs to know which protocol to speak, which host to contact, on which port, and what to ask for.' },
      { type: 'diagram', id: 'url-anatomy' },
      { type: 'definitions', items: [
        ['scheme', 'Picks the protocol and the default port (<code>http</code> → 80, <code>https</code> → 443). In the WHATWG URL Standard, <em>special schemes</em> (http, https, ws, wss, ftp, file) get different parsing rules from <code>mailto:</code> or <code>data:</code>.'],
        ['host', 'A domain, an IPv4 address, or a bracketed IPv6 literal. Domains are case-insensitive and converted to ASCII with IDNA: <code>bücher.example</code> becomes <code>xn--bcher-kva.example</code>. DNS only sees the ASCII form.'],
        ['port', 'When omitted, the scheme default applies. <code>(scheme, host, port)</code> is the <strong>origin</strong>, the unit of the same-origin policy and of per-origin storage. Site isolation and storage partitioning use the coarser <em>site</em>: scheme plus registrable domain, ignoring the port (Lessons 21–23).'],
        ['path + query', 'Together they form the HTTP <em>request target</em>. Browsers resolve dot segments (<code>/a/./b/../c</code> → <code>/a/c</code>) and percent-encode disallowed characters.'],
        ['fragment', 'Never leaves the client. It is not in the request line, not in the Referer header, and not seen by the server.'],
      ] },
      { type: 'callout', tone: 'warn', title: 'There are two URL specifications',
        html: '<p><a href="https://www.rfc-editor.org/rfc/rfc3986.html" target="_blank" rel="noopener">RFC 3986</a> defines generic URI syntax. The <a href="https://url.spec.whatwg.org/" target="_blank" rel="noopener">WHATWG URL Standard</a> defines what browsers actually do, including error recovery for malformed input. Python\u2019s <code>urllib.parse</code> is closer to RFC 3986. When a URL is validated by one parser and fetched by another, the disagreement is a classic source of SSRF and open-redirect bugs.</p>' },
      { type: 'table', caption: 'Real disagreements. Check the browser column with new URL(...) in DevTools.',
        head: ['Input', 'Browser new URL()', 'urllib.parse.urlsplit'],
        rows: [
          ['<code>https://example.com\\path</code>', 'Backslash means slash: host <code>example.com</code>, path <code>/path</code>', 'netloc <code>example.com\\path</code>'],
          ['<code>https://example.com/a/../b</code>', 'path <code>/b</code>', 'path <code>/a/../b</code> (not resolved)'],
          ['<code>https://example.com:443/</code>', 'port <code>""</code> (default elided)', 'port <code>443</code>'],
          ['<code>https://bücher.example/</code>', 'host <code>xn--bcher-kva.example</code>', 'hostname <code>bücher.example</code>'],
        ] },

      { type: 'h2', id: 'client-server', text: 'Clients, servers and the OS in between' },
      { type: 'p', html: 'HTTP is a client/server protocol: the browser always initiates and the server always responds. But the browser never touches the network directly. It asks the kernel for a <strong>socket</strong>, an OS object behind a file descriptor, and writes bytes into it. The kernel\u2019s TCP/IP stack splits them into segments, numbers them, retransmits lost ones and routes packets out of a network interface. A connection is identified by its <strong>5-tuple</strong>: protocol, source IP, source port, destination IP, destination port.' },
      { type: 'diagram', id: 'client-server' },
      { type: 'table', caption: 'The layers involved in an HTTPS request.',
        head: ['Layer', 'Protocol', 'Unit', 'Implemented by'],
        rows: [
          ['Application', 'HTTP', 'Message', 'The browser'],
          ['Security', 'TLS', 'Record', 'The browser (BoringSSL, NSS)'],
          ['Transport', 'TCP, or QUIC over UDP', 'Segment / packet', 'Kernel (QUIC: user space)'],
          ['Network', 'IP', 'Packet', 'Kernel and routers'],
          ['Link', 'Ethernet, Wi-Fi, 5G', 'Frame', 'NIC and driver'],
        ] },
      { type: 'callout', tone: 'note', title: 'Why QUIC lives in user space',
        html: '<p>TCP is implemented in the kernel and in middleboxes all over the internet, so changing it takes a decade. QUIC (the transport under HTTP/3) runs over UDP and is implemented inside the browser. That is how Google could ship and iterate on it without waiting for OS upgrades.</p>' },

      { type: 'h2', id: 'dns', text: 'DNS: names to addresses' },
      { type: 'p', html: 'DNS is a distributed, hierarchical, heavily cached database. A query is usually a single UDP datagram to port 53, and the response is usually a single datagram back. Your machine runs a <em>stub resolver</em> that forwards questions to a <em>recursive resolver</em>, which does the actual walking of the hierarchy.' },
      { type: 'diagram', id: 'dns-resolution' },
      { type: 'p', html: 'There are caches at every layer: the browser\u2019s host cache, the OS cache, and the recursive resolver, all governed by each record\u2019s TTL. A warm lookup is free. A fully cold recursion can cost hundreds of milliseconds, which is why browsers prefetch DNS for links on the page and why <code>&lt;link rel="dns-prefetch"&gt;</code> exists.' },
      { type: 'definitions', items: [
        ['A / AAAA', 'IPv4 and IPv6 addresses for a name.'],
        ['CNAME', 'An alias: "go resolve this other name instead". Common for CDNs.'],
        ['NS', 'Delegation: which servers are authoritative for a zone.'],
        ['HTTPS / SVCB', 'Newer records (<a href="https://www.rfc-editor.org/rfc/rfc9460.html" target="_blank" rel="noopener">RFC 9460</a>): SVCB is type 64 and its web-specific form, HTTPS, is type 65. They advertise ALPN protocols (for example <code>h3</code>), address hints and ECH keys, so the browser can try HTTP/3 on the very first connection instead of learning about it from <code>Alt-Svc</code> afterwards.'],
      ] },
      { type: 'terminal', title: 'Observe DNS', commands: [
        'dig example.com',
        'dig +short AAAA example.com',
        'dig +trace example.com',
        'dig +short example.com TYPE65',
      ], output: '$ dig +short AAAA example.com\n2606:4700:10::ac42:93f3\n2606:4700:10::6814:179a\n\n$ dig +trace example.com\n.            518368  IN  NS  a.root-servers.net.\n...\ncom.         172800  IN  NS  a.gtld-servers.net.\n...\nexample.com.    300  IN  A   104.20.23.154\n\n$ dig +short example.com TYPE65\n\\# 61 00010000010006026833026832000400086814179AAC4293F3000600 202606470000100000000000006814179A2606470000100000000000 00AC4293F3' },
      { type: 'p', html: 'That last answer is raw hex because the <code>dig</code> bundled with macOS predates the HTTPS record type, so it falls back to the generic RFC&nbsp;3597 format. A newer <code>dig</code> (<code>brew install bind</code>) decodes it as <code>1 . alpn="h3,h2" ipv4hint=104.20.23.154,172.66.147.243 ipv6hint=2606:4700:10::6814:179a,2606:4700:10::ac42:93f3</code>. You will decode that hex by hand in Lesson 3.' },
      { type: 'callout', tone: 'deep', title: 'Encrypted DNS',
        html: '<p>Classic DNS is plaintext, so anyone on the path sees every hostname you visit. DNS-over-HTTPS (<a href="https://www.rfc-editor.org/rfc/rfc8484.html" target="_blank" rel="noopener">RFC 8484</a>) and DNS-over-TLS fix that. Browsers may bypass the OS resolver and speak DoH themselves. That is one reason Chromium ships its own async DNS resolver instead of always calling <code>getaddrinfo</code>.</p>' },

      { type: 'h2', id: 'ip', text: 'IP addresses and Happy Eyeballs' },
      { type: 'p', html: 'IPv4 addresses are 32 bits and IPv6 addresses are 128 bits. Most large sites are dual-stack, returning both A and AAAA records. Ports are 16-bit numbers that let one host run many services. Over IPv4 your laptop is almost certainly behind a NAT that rewrites your private source address; over IPv6 it usually has a public address of its own.' },
      { type: 'p', html: 'With several addresses in hand, which one should the browser connect to? <strong>Happy Eyeballs v2</strong> (<a href="https://www.rfc-editor.org/rfc/rfc8305.html" target="_blank" rel="noopener">RFC 8305</a>) starts with the preferred family (usually IPv6). If that hasn\u2019t connected within about 250&nbsp;ms, it races an IPv4 attempt and keeps whichever handshake completes first. A broken IPv6 path then costs a quarter-second instead of a 30-second timeout. Your <code>url_inspector.py</code> prints addresses in the order the OS prefers them (<a href="https://www.rfc-editor.org/rfc/rfc6724.html" target="_blank" rel="noopener">RFC 6724</a>).' },

      { type: 'h2', id: 'tcp', text: 'TCP and the three-way handshake' },
      { type: 'p', html: 'IP is best effort: packets can be lost, duplicated, reordered or corrupted. TCP builds a <strong>reliable, ordered, bidirectional byte stream</strong> on top of that, using sequence numbers, acknowledgements, retransmission timers, flow control (the receive window) and congestion control (the congestion window).' },
      { type: 'diagram', id: 'tcp-handshake' },
      { type: 'p', html: 'Why three messages? Each side picks a random initial sequence number (randomized to resist spoofing) and needs proof that the other side received it. The SYN also carries options that shape the whole connection: maximum segment size, window scaling, selective ACK and timestamps.' },
      { type: 'callout', tone: 'deep', title: 'A byte stream, not messages',
        html: '<p>TCP has no message boundaries. One <code>recv()</code> may return half a header line, or the tail of one response and the start of the next. This is why HTTP needs framing rules — <code>Content-Length</code>, chunked encoding, connection close — and handling them is the core problem of Lesson 2.</p>' },
      { type: 'p', html: 'Two more consequences matter for browsers. <strong>Slow start</strong>: a new connection may only send about 10 segments (~14&nbsp;KB) before waiting for ACKs, so the first 14&nbsp;KB of HTML arrives a full round trip earlier than the rest. <strong>Head-of-line blocking</strong>: one lost packet stalls every byte behind it, even bytes belonging to unrelated HTTP/2 streams. That is the main motivation for QUIC.' },
      { type: 'terminal', title: 'Speak HTTP over a raw TCP connection (port 80, no TLS)', commands: [
        "(printf 'GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n'; sleep 2) | nc example.com 80 | head -8",
      ], output: 'HTTP/1.1 200 OK\nDate: Sat, 14 Nov 2026 16:44:41 GMT\nContent-Type: text/html; charset=utf-8\nTransfer-Encoding: chunked\nConnection: close\nServer: cloudflare\nLast-Modified: Fri, 13 Nov 2026 18:54:38 GMT\nAllow: GET, HEAD' },
      { type: 'callout', tone: 'note', title: 'Watch the handshake',
        html: '<p>In a second terminal, run <code>sudo tcpdump -nn -i any \'tcp port 80 and host example.com\'</code>, then repeat the <code>nc</code> command. Look for the flags <code>[S]</code>, <code>[S.]</code> and <code>[.]</code>: SYN, SYN-ACK and ACK.</p>' },

      { type: 'h2', id: 'tls', text: 'TLS 1.3: encryption and identity' },
      { type: 'p', html: 'TLS adds confidentiality, integrity and server authentication on top of a TCP byte stream. TLS 1.3 (<a href="https://www.rfc-editor.org/rfc/rfc8446.html" target="_blank" rel="noopener">RFC 8446</a>) cut the handshake to a single round trip by having the client guess the key-exchange group and send its key share in the very first message.' },
      { type: 'diagram', id: 'tls-handshake' },
      { type: 'list', items: [
        '<strong>Key exchange</strong>: ephemeral Diffie–Hellman (X25519) gives forward secrecy. Chrome and Firefox now default to the hybrid post-quantum group <code>X25519MLKEM768</code>, and so does OpenSSL 3.5; you\u2019ll see it in the output below.',
        '<strong>SNI</strong> tells the server which certificate to present. It is sent in plaintext, so observers see the hostname. Encrypted Client Hello (ECH) fixes this, with keys distributed via the DNS HTTPS record.',
        '<strong>ALPN</strong> negotiates the application protocol, <code>h2</code> or <code>http/1.1</code>, inside the handshake, at no extra round-trip cost.',
        '<strong>Certificate validation</strong>: build a chain to a trusted root, check the hostname, validity dates, revocation status and Certificate Transparency.',
      ] },
      { type: 'callout', tone: 'warn', title: '0-RTT is replayable',
        html: '<p>With session resumption, a client can send "early data" in its first flight. An attacker can replay those bytes, so browsers only use 0-RTT for idempotent requests and servers have to opt in.</p>' },
      { type: 'terminal', title: 'Inspect a real TLS handshake (OpenSSL 3.5+)', commands: [
        'openssl s_client -connect example.com:443 -servername example.com -alpn h2,http/1.1 -brief </dev/null',
        "openssl s_client -connect example.com:443 -servername example.com -alpn h2,http/1.1 </dev/null 2>/dev/null | grep -E '^(Protocol|ALPN)'",
        "curl -sv -o /dev/null https://example.com 2>&1 | grep -E '^\\* (Connected|ALPN|SSL|.*TLS handshake)'",
      ], output: 'Connecting to 2606:4700:10::6814:179a\nCONNECTION ESTABLISHED\nProtocol version: TLSv1.3\nCiphersuite: TLS_AES_256_GCM_SHA384\nPeer certificate: CN=example.com\nHash used: SHA256\nSignature type: ecdsa_secp256r1_sha256\nVerification: OK\nNegotiated TLS1.3 group: X25519MLKEM768\nDONE\n\nProtocol: TLSv1.3\nALPN protocol: h2\n\n* Connected to example.com (2606:4700:10::6814:179a) port 443\n* ALPN: curl offers h2,http/1.1\n* (304) (OUT), TLS handshake, Client hello (1):\n* (304) (IN), TLS handshake, Server hello (2):\n...\n* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256 / [blank] / UNDEF\n* ALPN: server accepted h2' },
      { type: 'callout', tone: 'warn', title: 'macOS ships LibreSSL as openssl',
        html: '<p><code>/usr/bin/openssl</code> on macOS is LibreSSL 3.3, which answers <code>-brief</code> with <code>unknown option</code> and never negotiates <code>X25519MLKEM768</code>. Install OpenSSL 3.5 or newer with <code>brew install openssl@3</code> and check that <code>openssl version</code> says OpenSSL. Note too that <code>-brief</code> leaves out the ALPN result, which is why the second command greps the full output for it.</p>' },

      { type: 'h2', id: 'http', text: 'HTTP: request and response' },
      { type: 'p', html: 'HTTP <em>semantics</em> (methods, status codes, header meaning) are defined once in <a href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noopener">RFC 9110</a>. Each version has its own wire format: HTTP/1.1 is text (RFC 9112), HTTP/2 is binary frames over TCP (RFC 9113), and HTTP/3 is binary frames over QUIC (RFC 9114). Here is the actual HTTP/1.1 exchange from the <code>/headers</code> experiment, byte for byte, as <code>fetch.py --wire</code> shows it:' },
      { type: 'code', snippet: 'raw_request' },
      { type: 'code', snippet: 'raw_response' },
      { type: 'diagram', id: 'http-exchange' },
      { type: 'table', caption: 'Status classes and what a browser does with them.',
        head: ['Class', 'Meaning', 'Browser behaviour'],
        rows: [
          ['1xx', 'Informational', '103 Early Hints lets the browser start preloads before the real response.'],
          ['2xx', 'Success', 'Render it. 204 means stay on the current page.'],
          ['3xx', 'Redirection', 'Follow Location, up to 20 hops (Fetch Standard). 304 revalidates the cache.'],
          ['4xx', 'Client error', 'Still render the body: a 404 page is a normal document.'],
          ['5xx', 'Server error', 'Render the body. Some requests may be retried.'],
        ] },
      { type: 'definitions', items: [
        ['Host', 'Mandatory in HTTP/1.1, because thousands of sites can share one IP. HTTP/2 and 3 use the <code>:authority</code> pseudo-header instead.'],
        ['Content-Length / Transfer-Encoding', 'Framing: where the body ends. When the two disagree, you get request smuggling.'],
        ['Connection', 'Hop-by-hop control: <code>close</code> versus keep-alive. Forbidden in HTTP/2.'],
        ['Content-Type', 'MIME type plus charset. It drives which parser runs and how bytes decode to text.'],
        ['Location', 'The redirect target, possibly relative: resolve it against the request URL.'],
        ['Alt-Svc', 'Advertises HTTP/3. example.com returned <code>alt-svc: h3=":443"</code>, inviting the browser to switch to QUIC next time.'],
      ] },
      { type: 'callout', tone: 'note', title: 'Redirect semantics',
        html: '<p>301 and 302 historically let clients turn a POST into a GET (browsers do). 303 always means "GET this instead". 307 and 308 preserve the method and body. <code>urllib</code> follows all five (308 only since Python 3.11) and refuses the 11th hop. It also turns a POST into a GET on 301, 302 and 303, and simply refuses to follow a 307 or 308 for a POST, because re-sending a body is a decision it leaves to you. Browsers re-send it.</p>' },

      { type: 'h2', id: 'budget', text: 'Putting it together: the latency budget' },
      { type: 'table', caption: 'Cold navigation at 50 ms RTT, with the resolver already holding the record.',
        head: ['Step', 'Cost', 'Elapsed'],
        rows: [
          ['DNS query to recursive resolver', '1 RTT', '50 ms'],
          ['TCP handshake', '1 RTT', '100 ms'],
          ['TLS 1.3 handshake', '1 RTT', '150 ms'],
          ['HTTP request → first byte', '1 RTT + server time', '200 ms + S'],
          ['Same, on a reused HTTP/2 connection', '1 RTT + server time', '50 ms + S'],
          ['HTTP/3 with 0-RTT resumption', '~1 RTT + server time', '~50–100 ms + S'],
        ] },
      { type: 'p', html: 'This table explains a surprising amount of web performance advice. Reuse connections, keep critical resources on as few origins as possible, use <code>preconnect</code> for unavoidable ones, and fit the critical HTML into the first congestion window.' },

      { type: 'h2', id: 'implementation', text: 'Implementation: a URL inspector and an HTTP client' },
      { type: 'p', html: 'Lesson 1 deliberately uses the standard library\u2019s high-level APIs so you can <em>observe</em> the protocol before you implement it. In Lesson 2 you delete <code>urllib.request</code> and replace it with sockets. Both files live in <code>python/lesson01/</code>; run every command from the repo root.' },
      { type: 'h3', text: 'Part 1: url_inspector.py' },
      { type: 'code', snippet: 'url_inspector' },
      { type: 'terminal', commands: ['python3 python/lesson01/url_inspector.py "https://user@Example.COM:8443/a/b%20c?q=1&lang=en&flag#top"'],
        output: "scheme          'https'\nusername        'user'\nhost            'example.com'\nport            8443\nexplicit_port   True\norigin          ('https', 'example.com', 8443)\npath            '/a/b%20c'\ndecoded_path    '/a/b c'\nquery           [('q', '1'), ('lang', 'en'), ('flag', '')]\nfragment        'top'\nrequest_target  '/a/b%20c?q=1&lang=en&flag'\n\nIPv6  2606:4700:10::6814:179a\nIPv6  2606:4700:10::ac42:93f3\nIPv4  172.66.147.243\nIPv4  104.20.23.154" },
      { type: 'list', items: [
        '<code>urlsplit</code> rather than <code>urlparse</code>: the latter also splits RFC 2396 <code>;params</code> off the last path segment, which no modern code wants.',
        '<code>.hostname</code> lowercases the host and strips IPv6 brackets. <code>.port</code> raises <code>ValueError</code> for out-of-range ports, so <code>inspect_url</code> surfaces that error too.',
        '<code>origin</code> is the tuple that the same-origin policy compares. The username and the path don\u2019t affect it, but the port does: <code>https://example.com</code> and <code>https://example.com:8443</code> are different origins.',
        'The fragment is parsed and then never used: <code>request_target</code> is exactly what goes on the request line.',
        '<code>getaddrinfo</code> is the OS stub resolver, the same call the browser\u2019s network stack makes on many platforms.',
      ] },
      { type: 'h3', text: 'Part 2: fetch.py' },
      { type: 'code', snippet: 'fetch' },
      { type: 'terminal', commands: ['python3 python/lesson01/fetch.py https://example.com --body 120'],
        output: '> GET / HTTP/1.1\n> Host: example.com\n> User-agent: BrowserCookbook/0.1 (+lesson-01)\n> Accept: */*\n>\n< 200 OK   (https://example.com)\n< Date: Sun, 15 Nov 2026 16:07:57 GMT\n< Content-Type: text/html; charset=utf-8\n< Transfer-Encoding: chunked\n< Connection: close\n< Server: cloudflare\n< last-modified: Sat, 14 Nov 2026 20:05:46 GMT\n< allow: GET, HEAD\n< Accept-Ranges: bytes\n< Age: 6273\n< cf-cache-status: HIT\n< CF-RAY: a5af83078c45ac84-LAX\n< alt-svc: h3=":443"; ma=86400\n<\n<!doctype html><html lang=en><head><meta charset=utf-8><link rel=icon href=data:,><meta name=viewport content="width=dev\n... (457 more bytes)\n\n* 577 body bytes in 130 ms' },
      { type: 'list', items: [
        '<strong>The <code>&gt;</code> lines are a reconstruction.</strong> They come from the <code>Request</code> object, not from the socket. <code>Host</code> is there because urllib added it to the object while sending. <code>Connection: close</code> is missing because urllib adds it to a private copy of the headers, and <code>Accept-Encoding</code> because <code>http.client</code> adds it at the last moment. Run with <code>--wire</code> to see the real bytes (below).',
        '<strong>Connection: close</strong>: <code>urllib</code> opens a fresh TCP and TLS connection for every request, including every redirect hop. Compare the elapsed time for <code>/redirect/3</code>.',
        '<strong>Accept-Encoding: identity</strong>: <code>http.client</code> adds this so the server won\u2019t compress, because urllib can\u2019t decompress. Browsers send <code>gzip, deflate, br, zstd</code>.',
        '<strong>Transfer-Encoding: chunked</strong>: example.com didn\u2019t send a Content-Length. urllib quietly decoded the chunks; in Lesson 2 you will.',
        '<strong>User-agent</strong>: the <code>Request</code> object stores names with <code>str.capitalize()</code>, and the wire gets <code>str.title()</code> (<code>User-Agent</code>). Field names are case-insensitive, and HTTP/2 requires them in lowercase.',
        '<strong>HTTPError is a response</strong>: urllib raises on 4xx/5xx, but the exception carries status, headers and body. A browser treats a 404 as an ordinary document.',
      ] },
      { type: 'code', snippet: 'wire' },
      { type: 'p', html: 'The <code>send:</code> line is the request exactly as it left the process, with every CRLF visible. Compare it with the <code>&gt;</code> lines: different order, two extra fields, different capitalization. A tool that prints a tidy model of a request instead of the bytes can hide exactly the detail you are debugging.' },
      { type: 'h3', text: 'Part 3: the tests' },
      { type: 'p', html: '<code>test_lesson01.py</code> checks <code>inspect_url</code> on tricky inputs and runs <code>fetch</code> against a local test server, so it needs no network. It pins down behaviour this lesson describes: a 404 is a response, redirect hops are recorded, urllib gives up after 10 redirects, and a timeout applies to each socket operation rather than to the whole request.' },
      { type: 'terminal', commands: ['python3 -m unittest discover -s python/lesson01 -v'],
        output: 'test_404_is_a_response_not_an_exception (test_lesson01.FetchTests...) ... ok\ntest_head_has_no_body (test_lesson01.FetchTests...) ... ok\ntest_redirect_hops_are_recorded (test_lesson01.FetchTests...) ... ok\ntest_redirect_limit (test_lesson01.FetchTests...) ... ok\n...\n----------------------------------------------------------------------\nRan 17 tests in 1.474s\n\nOK' },

      { type: 'h2', id: 'hidden', text: 'What urllib is hiding from you' },
      { type: 'p', html: 'Make a list of everything that happened inside <code>opener.open()</code>. This list is your Lesson 2 backlog:' },
      { type: 'list', ordered: true, items: [
        'Resolving the host and choosing an address family.',
        'Opening a TCP socket, wrapping it with TLS, verifying the certificate and setting SNI.',
        'Serializing the request line and headers with CRLF line endings.',
        'Reading the status line and headers from a stream that has no message boundaries.',
        'Choosing a framing strategy: Content-Length, chunked, or read-until-close.',
        'Resolving relative Location headers and deciding whether to keep the method on a redirect.',
        'Decoding the body bytes into text using the charset.',
      ] },
    ],
    experiments: [
      { id: 'exp-example', title: 'Fetch https://example.com', lang: 'python',
        summary: 'The baseline: a small cached page served by a CDN.',
        commands: ['python3 python/lesson01/fetch.py https://example.com'],
        output: '< 200 OK   (https://example.com)\n< Content-Type: text/html; charset=utf-8\n< Transfer-Encoding: chunked\n< Server: cloudflare\n< Age: 6273\n< cf-cache-status: HIT\n< alt-svc: h3=":443"; ma=86400\n...\n* 577 body bytes in 130 ms',
        observe: ['There is no Content-Length: the body is chunked.', '<code>Age</code> (seconds the response has sat in a cache) and <code>cf-cache-status: HIT</code> show you got a CDN cache hit.', '<code>alt-svc</code> advertises HTTP/3.', 'Run it three times. How much does the timing vary, and why?'] },
      { id: 'exp-404', title: 'A 404 is still a response', lang: 'python',
        summary: 'urllib raises HTTPError, but the exception is a complete response object.',
        commands: ['python3 python/lesson01/fetch.py https://httpbin.org/status/404'],
        output: '< 404 Not Found   (https://httpbin.org/status/404)\n< access-control-allow-credentials: true\n< access-control-allow-origin: *\n< access-control-expose-headers: Retry-After, RateLimit, RateLimit-Policy, WWW-Authenticate\n< content-length: 0\n< content-type: text/html; charset=utf-8\n< x-content-type-options: nosniff\n< date: Sun, 15 Nov 2026 16:08:07 GMT\n< connection: close\n<\n\n* 0 body bytes in 478 ms',
        observe: ['<code>content-length: 0</code>: the body is empty, but the framing is still explicit.', 'Remove the <code>except urllib.error.HTTPError</code> branch and see what changes.', 'Open the URL in your browser. What does it render for an empty 404?'] },
      { id: 'exp-redirect', title: 'Follow a redirect chain', lang: 'python',
        summary: 'Three 302 hops with relative Location headers.',
        commands: ['python3 python/lesson01/fetch.py https://httpbin.org/redirect/3 --body 200'],
        output: '* 302 redirect: https://httpbin.org/redirect/3 -> https://httpbin.org/relative-redirect/2\n* 302 redirect: https://httpbin.org/relative-redirect/2 -> https://httpbin.org/relative-redirect/1\n* 302 redirect: https://httpbin.org/relative-redirect/1 -> https://httpbin.org/get\n< 200 OK   (https://httpbin.org/get)\n...\n* 270 body bytes in 1375 ms',
        observe: ['The server sent relative paths (<code>/relative-redirect/2</code>); urllib resolved them against the current URL.', 'Four requests, four TCP and TLS handshakes. Compare the elapsed time with a single request. Lesson 2\u2019s client does the same chain in about half the time.', 'Try <code>/redirect/12</code>. urllib follows ten hops, then hands you the eleventh 302 as the result. What does a browser show instead?'] },
      { id: 'exp-headers', title: 'See exactly what you sent', lang: 'python',
        summary: 'httpbin echoes back the request headers it received.',
        commands: ['python3 python/lesson01/fetch.py https://httpbin.org/headers'],
        output: '{\n  "headers": {\n    "Accept": "*/*",\n    "Accept-Encoding": "identity",\n    "Host": "httpbin.org",\n    "User-Agent": "BrowserCookbook/0.1 (+lesson-01)"\n  }\n}',
        observe: ['<code>Accept-Encoding: identity</code> was added by http.client, not by your code.', 'Load the same URL in Safari or Chrome and compare: <code>Sec-Fetch-*</code>, <code>Accept-Language</code>, client hints.', 'Add a custom header in <code>fetch()</code> and confirm it round-trips.'] },
      { id: 'exp-delay', title: 'Timeouts and slow servers', lang: 'python',
        summary: 'A server that waits 3 seconds, then one that sends a byte every 1.3 seconds.',
        commands: [
          'python3 python/lesson01/fetch.py --timeout 2 https://httpbin.org/delay/3',
          'python3 python/lesson01/fetch.py https://httpbin.org/delay/3 --body 80',
          'python3 python/lesson01/fetch.py --timeout 2 "https://httpbin.org/drip?duration=4&numbytes=4&delay=0" --body 20',
        ],
        output: '* timed out after 2s waiting for https://httpbin.org/delay/3\n\n< 200 OK   (https://httpbin.org/delay/3)\n< server-timing: initial_delay;dur=3000.00;desc="initial delay"\n...\n* 333 body bytes in 3320 ms\n\n< 200 OK   (https://httpbin.org/drip?duration=4&numbytes=4&delay=0)\n< content-length: 4\n...\n****\n\n* 4 body bytes in 4337 ms',
        observe: ['The <code>/drip</code> request took over 4 seconds with a 2-second timeout and still succeeded. urllib\u2019s timeout applies to each socket operation, not to the whole request, so a server that dribbles a byte every second never times out. Browsers enforce overall deadlines themselves.', '<code>server-timing</code> lets servers expose backend timings, and DevTools displays them.', 'Subtract 3000 ms from the <code>/delay/3</code> time: what remains is DNS + TCP + TLS + transfer.'] },
      { id: 'exp-wire', title: 'Watch the wire with curl and openssl', lang: 'shell',
        summary: 'The same handshakes, narrated by tools that show their work.',
        commands: ['curl -sv https://example.com -o /dev/null', 'openssl s_client -connect httpbin.org:443 -servername httpbin.org -brief </dev/null'],
        output: '* IPv6: 2606:4700:10::6814:179a, 2606:4700:10::ac42:93f3\n* IPv4: 172.66.147.243, 104.20.23.154\n*   Trying [2606:4700:10::6814:179a]:443...\n* Connected to example.com (2606:4700:10::6814:179a) port 443\n* ALPN: curl offers h2,http/1.1\n* (304) (OUT), TLS handshake, Client hello (1):\n* (304) (IN), TLS handshake, Server hello (2):\n* (304) (IN), TLS handshake, Unknown (8):\n* (304) (IN), TLS handshake, Certificate (11):\n* (304) (IN), TLS handshake, CERT verify (15):\n* (304) (IN), TLS handshake, Finished (20):\n* (304) (OUT), TLS handshake, Finished (20):\n* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256 / [blank] / UNDEF\n* ALPN: server accepted h2\n\nCONNECTION ESTABLISHED\nProtocol version: TLSv1.3\nCiphersuite: TLS_AES_256_GCM_SHA384\nPeer certificate: CN=httpbin.hbin02.postmanlabs.com\n...\nVerification: OK\nPeer Temp Key: X25519, 253 bits',
        observe: ['Match each curl line to a step in the TLS diagram. <code>Unknown (8)</code> is EncryptedExtensions, handshake message type 8: the TLS library in the macOS build of curl just doesn\u2019t name it.', 'curl negotiated <code>h2</code>. Python\u2019s <code>http.client</code> offers only <code>http/1.1</code> in its ALPN extension, so urllib always speaks HTTP/1.1.', 'Which TLS version and key-exchange group does httpbin.org use compared with example.com?'] },
      { id: 'exp-rust-preview', title: 'Preview: the same request in Rust', lang: 'rust', snippet: 'rust_preview',
        summary: 'A raw HTTP/1.1 request over std::net::TcpStream, with no TLS and no crates. A glimpse of Lesson 28.',
        commands: ['cargo run --manifest-path rust/lesson01-preview/Cargo.toml'],
        output: 'HTTP/1.1 200 OK\nDate: Sat, 14 Nov 2026 16:44:41 GMT\nContent-Type: text/html; charset=utf-8\nTransfer-Encoding: chunked\nConnection: close\nServer: cloudflare\n...\n\n[589 body bytes, still chunk-encoded]',
        observe: ['589 bytes, not 577: the body still holds the framing, a <code>241</code> size line (hex for 577) and the closing <code>0</code> chunk. Nothing de-chunked it for you.', 'Port 80, no TLS. Adding TLS in Rust means a crate (rustls) or a lot of work.', '<code>read_to_end</code> only terminates because of <code>Connection: close</code>.'] },
    ],
    exercises: [
      { id: 'ex-idna', title: 'Internationalized hostnames', html: 'Right now <code>https://bücher.example/</code> and <code>https://xn--bcher-kva.example/</code> print different origins, though a browser treats them as the same. Make <code>inspect_url</code> convert the host to its ASCII (punycode) form with <code>host.encode("idna").decode("ascii")</code> and confirm the origins now match. (The <code>.example</code> names never resolve, so the DNS lookup at the end failing is expected.) Then try <code>https://faß.de/</code>: Python\u2019s <code>idna</code> codec implements IDNA 2003 and maps it to <code>fass.de</code>, while browsers use UTS #46 nontransitional processing and send <code>xn--fa-hia.de</code>. Those are two different domains, resolving to different servers. Record that differential in your notes.' },
      { id: 'ex-parsers', title: 'Parser differential', html: 'Run the four inputs from the URL table, plus two of your own, through both <code>new URL()</code> in DevTools and <code>urlsplit</code>. Record the results in your notes for this lesson, and add one case that would let an attacker bypass a hostname allow-list.' },
      { id: 'ex-head', title: 'HEAD requests', html: 'Run <code>fetch.py --method HEAD</code> against example.com and httpbin.org/get. httpbin.org sends <code>content-length: 271</code> with an empty body; example.com sends neither a length nor chunks. Explain both, and what would happen to a client that trusted that Content-Length and waited for 271 bytes.' },
      { id: 'ex-dns-timing', title: 'Time DNS separately', html: 'Time <code>socket.getaddrinfo</code> on its own with <code>time.perf_counter()</code>. Run it twice in quick succession for a domain you have never visited. Explain the difference in terms of the cache layers.' },
      { id: 'ex-tls', title: 'TLS survey', html: 'For example.com, httpbin.org and a site of your choice, record the TLS version, cipher suite and key-exchange group (from <code>openssl s_client -brief</code>) and the ALPN result (from the full output: <code>grep \'ALPN protocol\'</code>). Which sites already use a post-quantum group?' },
      { id: 'ex-redirects', title: 'Redirect limits', html: 'Fetch <code>https://httpbin.org/redirect/12</code> and confirm where urllib stops. In the CPython source of <code>urllib/request.py</code>, find <code>max_redirections</code> and <code>max_repeats</code>: what kind of redirect loop does <code>max_repeats</code> catch sooner? Then find the browser\u2019s limit in the Fetch Standard ("HTTP-redirect fetch") and what Chrome shows when a site exceeds it.' },
      { id: 'ex-tests', title: 'Test your changes', html: 'Add tests to <code>test_lesson01.py</code> for your IDNA change and for a URL with both userinfo and an IPv6 literal, such as <code>http://user@[2001:db8::1]:8080/</code>. Run <code>python3 -m unittest discover -s python/lesson01 -v</code> until everything passes.' },
    ],
    stretch: [
      { id: 'st-raw-socket', title: 'No urllib allowed', html: 'Fetch <code>https://example.com/</code> using only <code>socket</code> and <code>ssl</code>: connect, wrap with <code>ssl.create_default_context().wrap_socket(sock, server_hostname=host)</code>, write the request bytes and print the raw response. This is the seed of Lesson 2.' },
      { id: 'st-phase-timing', title: 'Per-phase timings', html: 'Extend the raw-socket version to print DNS, TCP connect, TLS handshake, time to first byte and download time separately, like <code>curl -w "%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer}"</code>. Compare your numbers with curl\u2019s.' },
      { id: 'st-wireshark', title: 'Decrypt your own TLS', html: 'Set <code>SSLKEYLOGFILE</code>, add <code>ctx.keylog_filename</code> to your raw-socket client, capture with Wireshark and decrypt the session. Find the SNI, ALPN and key_share in the ClientHello.' },
      { id: 'st-rust-url', title: 'Rust track: URL inspector', html: 'Port <code>url_inspector.py</code> to Rust using only <code>std</code>: no <code>url</code> crate. Handle default ports, IPv6 literals and percent-decoding, and resolve the host with <code>ToSocketAddrs</code>.' },
    ],
    takeaways: [
      'A navigation is a stack of protocols, and each one solves a single problem: naming (DNS), reliability (TCP), security (TLS) and semantics (HTTP).',
      'Latency is dominated by round trips, not bandwidth. A cold HTTPS navigation costs about four RTTs before the first byte.',
      'Browsers parse URLs by the WHATWG standard; libraries often don\u2019t. Parser differentials are security bugs.',
      'The fragment never leaves the client. The origin is (scheme, host, port).',
      'TCP is a byte stream with no message boundaries, so HTTP must frame its own messages.',
      'TLS 1.3 authenticates the server and negotiates the HTTP version (ALPN) in a single round trip.',
      'High-level clients hide decisions (connection reuse, compression, redirects, decoding) that a browser must make deliberately.',
    ],
    references: [
      { title: 'WHATWG URL Standard', url: 'https://url.spec.whatwg.org/' },
      { title: 'RFC 3986: URI Generic Syntax', url: 'https://www.rfc-editor.org/rfc/rfc3986.html' },
      { title: 'RFC 1034 / 1035: Domain Names', url: 'https://www.rfc-editor.org/rfc/rfc1035.html' },
      { title: 'RFC 9293: Transmission Control Protocol', url: 'https://www.rfc-editor.org/rfc/rfc9293.html' },
      { title: 'RFC 8446: TLS 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446.html' },
      { title: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      { title: 'RFC 9112: HTTP/1.1', url: 'https://www.rfc-editor.org/rfc/rfc9112.html' },
      { title: 'RFC 8305: Happy Eyeballs v2', url: 'https://www.rfc-editor.org/rfc/rfc8305.html' },
      { title: 'RFC 9460: SVCB and HTTPS resource records', url: 'https://www.rfc-editor.org/rfc/rfc9460.html' },
      { title: 'Python docs: urllib.parse', url: 'https://docs.python.org/3/library/urllib.parse.html' },
      { title: 'Python docs: urllib.request', url: 'https://docs.python.org/3/library/urllib.request.html' },
      { title: 'Web Browser Engineering, ch. 1: Downloading Web Pages', url: 'https://browser.engineering/http.html' },
      { title: 'High Performance Browser Networking (Grigorik)', url: 'https://hpbn.co/' },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* Lesson 2                                                           */
  /* ------------------------------------------------------------------ */

  const L2_SRC = 'python/lesson02/http_client.py';
  const HTTP_CLIENT_PY = String.raw`"""Lesson 2: an HTTP/1.1 client on raw sockets. No urllib.request, no http.client.

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
    sys.exit(main())`;

  COURSE.lessons.push({
    id: 'l02',
    number: 2,
    part: 'network',
    status: 'ready',
    title: 'Build an HTTP Client from Scratch',
    summary: 'Delete urllib. Own every byte between your program and the server: sockets, TLS, request serialization, response framing, connection reuse and redirects.',
    minutes: 180,
    objectives: [
      'Open TCP and TLS connections with the socket and ssl modules.',
      'Serialize requests and parse responses exactly as RFC 9112 specifies.',
      'Find body boundaries with Content-Length, chunked encoding and connection close.',
      'Reuse connections and follow redirects safely.',
    ],
    topics: ['TCP sockets', 'HTTP request serialization', 'HTTP response parsing', 'Headers and body boundaries', 'Content-Length', 'Chunked transfer encoding', 'Persistent connections', 'Redirects'],
    build: 'python/lesson02/http_client.py: request(url) over raw sockets, with a buffered reader, chunked decoding, a keep-alive connection pool, stale-connection retry and Fetch-Standard redirects.',
    snippets: {
      http_client: { lang: 'python', file: L2_SRC, code: HTTP_CLIENT_PY },
      open: { lang: 'python', title: 'http_client.py · Connection.open', source: L2_SRC, code: String.raw`    @classmethod
    def open(cls, scheme, host, port, timeout):
        sock = socket.create_connection((host, port), timeout=timeout)
        if scheme == "https":
            context = ssl.create_default_context()  # verifies the chain and the hostname
            context.set_alpn_protocols(["http/1.1"])
            sock = context.wrap_socket(sock, server_hostname=host)  # also sends SNI
        return cls(sock)` },
      reader: { lang: 'python', title: 'http_client.py · the buffered reader', source: L2_SRC, code: String.raw`    def _fill(self):
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
        return b"".join(chunks)` },
      request: { lang: 'python', title: 'http_client.py · writing the request', source: L2_SRC, code: String.raw`def split_url(url):
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
    return ("\r\n".join(lines) + "\r\n\r\n").encode("ascii") + body` },
      fields: { lang: 'python', title: 'http_client.py · status line and fields', source: L2_SRC, code: String.raw`def parse_status_line(line):
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
    return fields` },
      read_body: { lang: 'python', title: 'http_client.py · read_body', source: L2_SRC, code: String.raw`def read_body(conn, method, status, headers):
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

    return "until-close", conn.read_to_eof(), [], 0` },
      read_chunked: { lang: 'python', title: 'http_client.py · read_chunked', source: L2_SRC, code: String.raw`def read_chunked(conn):
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
    return bytes(body), trailers, count` },
      can_reuse: { lang: 'python', title: 'http_client.py · can_reuse', source: L2_SRC, code: String.raw`def connection_tokens(fields):
    return {t.strip().lower() for t in (field_value(fields, "Connection") or "").split(",")}


def can_reuse(response):
    tokens = connection_tokens(response.headers)
    if response.framing == "until-close" or "close" in tokens:
        return False
    if response.header("Transfer-Encoding") and response.header("Content-Length"):
        return False  # conflicting framing: possible smuggling, so never trust this stream again
    if response.version == "HTTP/1.0":
        return "keep-alive" in tokens and not response.header("Transfer-Encoding")
    return True` },
      pool: { lang: 'python', title: 'http_client.py · ConnectionPool', source: L2_SRC, code: String.raw`class ConnectionPool:
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
        self.idle.setdefault(origin, []).append(conn)` },
      retry: { lang: 'python', title: 'http_client.py · Client.exchange, the retry rule', source: L2_SRC, code: String.raw`        try:
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
            raise` },
      redirect_method: { lang: 'python', title: 'http_client.py · redirect_method', source: L2_SRC, code: String.raw`def redirect_method(status, method, body):
    """Fetch Standard, HTTP-redirect fetch: when a redirect turns into a GET."""
    if (status in (301, 302) and method == "POST") or (status == 303 and method not in ("GET", "HEAD")):
        return "GET", b""
    return method, body` },
      redirects: { lang: 'python', title: 'http_client.py · Client.request', source: L2_SRC, code: String.raw`    def request(self, url, method="GET", headers=(), body=b""):
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
            method, url = new_method, next_url` },
    },
    body: [
      { type: 'h2', id: 'backlog', text: 'The backlog from Lesson 1' },
      { type: 'p', html: 'Lesson 1 ended with a list of everything <code>opener.open()</code> did for you. This lesson does all of it by hand, in one file, with nothing but <code>socket</code> and <code>ssl</code>, and then adds two things urllib never did: connection reuse and a safe retry. You keep <code>urllib.parse</code>, because it is a URL parser rather than a client, and Lesson 1 already showed you its quirks.' },
      { type: 'table', caption: 'The Lesson 1 backlog, and where each item lives in http_client.py.',
        head: ['Backlog item', 'Code', 'Section'],
        rows: [
          ['Resolve the host, choose an address', '<code>socket.create_connection</code>', 'Sockets and TLS'],
          ['Open TCP, wrap with TLS, verify, send SNI', '<code>Connection.open</code>', 'Sockets and TLS'],
          ['Serialize the request with CRLF line endings', '<code>serialize_request</code>', 'Writing the request'],
          ['Read lines from a stream with no message boundaries', '<code>Connection.read_line</code>', 'Reading a byte stream'],
          ['Parse the status line and header fields', '<code>parse_status_line</code>, <code>read_fields</code>', 'The status line and fields'],
          ['Choose a framing strategy', '<code>read_body</code>, <code>read_chunked</code>', 'Where does the body end?'],
          ['Resolve relative Location, decide the method', '<code>Client.request</code>, <code>redirect_method</code>', 'Redirects'],
          ['Decode the body with its charset', '<code>charset_of</code>, <code>preview</code>', 'Putting it together'],
          ['<em>New:</em> reuse connections, retry stale ones', '<code>ConnectionPool</code>, <code>Client.exchange</code>', 'Persistent connections'],
        ] },

      { type: 'h2', id: 'sockets', text: 'Sockets and TLS' },
      { type: 'p', html: 'Everything starts with two standard-library calls. <code>socket.create_connection</code> resolves the name with <code>getaddrinfo</code> and tries each address in turn until one connects. Then, for https, an <code>SSLContext</code> wraps the socket and runs the TLS handshake from Lesson 1.' },
      { type: 'code', snippet: 'open' },
      { type: 'list', items: [
        '<code>create_connection</code> tries addresses <em>one after another</em>. That isn\u2019t Happy Eyeballs: with a broken IPv6 route it waits out the full timeout before trying IPv4. A stretch challenge fixes that.',
        'The <code>timeout</code> sticks to the socket. It applies to the connect and to every later <code>sendall</code> and <code>recv</code> separately, which is why <code>/drip</code> defeated urllib\u2019s timeout in Lesson 1.',
        '<code>ssl.create_default_context()</code> loads the default CA certificates (the system store on Windows; on macOS and Linux, the CA file of the OpenSSL that Python was built against), requires a valid chain, checks the hostname and refuses anything older than TLS 1.2.',
        '<code>server_hostname</code> does two jobs: it goes into the SNI extension so the server can pick the right certificate, and it is the name that certificate is checked against.',
        '<code>set_alpn_protocols(["http/1.1"])</code> tells the server which protocol we speak. Offer <code>h2</code> and example.com will pick it, and you\u2019d better be ready for binary frames (Lesson 3).',
        'After <code>wrap_socket</code>, the TLS socket has the same <code>sendall</code> and <code>recv</code> methods as the plain one, so nothing below this function knows or cares whether the connection is encrypted.',
      ] },
      { type: 'callout', tone: 'warn', title: 'Never turn verification off',
        html: '<p>Search results are full of <code>ssl._create_unverified_context()</code> and <code>CERT_NONE</code>. They make the error go away by making the connection unauthenticated: anyone on the network path can then impersonate the server. A verification failure is telling you something true. Fix the trust store instead (a python.org install on macOS needs its <code>Install Certificates.command</code> run once), or pass the right CA bundle with <code>cafile=</code>.</p>' },

      { type: 'h2', id: 'request', text: 'Writing the request' },
      { type: 'p', html: 'A request head is ASCII text: a request line, then field lines, then an empty line, each ending in CRLF. Step through the bytes:' },
      { type: 'diagram', id: 'request-bytes' },
      { type: 'code', snippet: 'request' },
      { type: 'list', items: [
        'The <strong>request target</strong> is the path plus the query, never the fragment. <code>quote()</code> percent-encodes what a browser\u2019s URL parser would have (spaces, non-ASCII) and leaves existing <code>%XX</code> escapes alone, because <code>%</code> is in <code>safe</code>.',
        '<strong>Host</strong> is mandatory in HTTP/1.1. It carries the port only when the port isn\u2019t the default, and an IPv6 literal goes back into brackets: <code>[::1]:8080</code>. The hostname is already punycode, which is what DNS, SNI and the Host field all expect.',
        '<strong>Refuse to send malformed fields.</strong> A value containing CR or LF would end the field early and start a new one the caller never wrote: <em>header injection</em>. Try <code>-H $\'X-Evil: a\\r\\nInjected: 1\'</code> and the client answers <code>* error: refusing to send malformed header field \'X-Evil\'</code>. The method has to be a token for the same reason.',
        '<strong>The client owns the framing.</strong> <code>request_headers</code> computes <code>Content-Length</code> from the body (and sends <code>Content-Length: 0</code> for an empty POST, PUT or PATCH) and refuses a caller-supplied <code>Content-Length</code> or <code>Transfer-Encoding</code>. If those could disagree with the actual body, your client would be smuggling requests at the server.',
        '<strong>Accept-Encoding: identity</strong> asks the server not to compress, for now. Decompressing gzip is an exercise.',
      ] },
      { type: 'p', html: 'The test server\u2019s <code>/raw</code> route echoes the request head back exactly as it arrived, with each CRLF made visible. Use it whenever you aren\u2019t sure what your code actually sent:' },
      { type: 'terminal', title: 'With the test server running in another terminal', commands: ['python3 python/lesson02/http_client.py http://localhost:8080/raw'],
        output: '< 200 OK   (http://localhost:8080/raw)\nGET /raw HTTP/1.1\\r\\n\nHost: localhost:8080\\r\\n\nUser-Agent: BrowserCookbook/0.2 (+lesson-02)\\r\\n\nAccept: */*\\r\\n\nAccept-Encoding: identity\\r\\n\n\\r\\n\n\n\n* 147 body bytes in 4 ms, connection #1 (new)' },

      { type: 'h2', id: 'reading', text: 'Reading from a byte stream' },
      { type: 'p', html: 'This is the core problem of the lesson. <code>recv(65536)</code> returns <em>whatever has arrived</em>: the whole response, half a header line, or the end of this response plus the start of the next. It returns <code>b""</code> only when the peer has closed its side. Nothing in TCP marks where a message ends, so the client keeps its own buffer and takes exactly what each step needs from it.' },
      { type: 'code', snippet: 'reader' },
      { type: 'list', items: [
        '<code>read_line</code> splits on LF and drops a CR in front of it. RFC 9112 lets a recipient accept a bare LF in the status line and fields, browsers do, and servers that send one still exist. Chunked framing is stricter, so it calls <code>read_line(strict=True)</code>, which insists on CRLF.',
        '<code>read_exact(n)</code> is how bodies are read: never by line, because body bytes can contain anything, CRLF included.',
        'Leftover bytes stay in the buffer. When one <code>recv</code> delivers the end of one response and the start of the next, the next <code>read_line</code> finds them there. A test in <code>test_http_client.py</code> checks exactly this.',
        'Limits bound memory. <code>MAX_LINE</code> caps one line, <code>MAX_HEAD</code> and <code>MAX_FIELDS</code> cap a whole header section (continuation lines included), and <code>MAX_INTERIM</code> caps the 1xx responses allowed before the real one. Without them, a hostile server could stream an endless header and the client would buffer every byte.',
      ] },
      { type: 'callout', tone: 'deep', title: 'Why does recv() return odd sizes?',
        html: '<p>It depends on how the data happened to arrive: TCP segments of about 1.4&nbsp;KB (the path MTU minus headers), TLS records of up to 16&nbsp;KB that have to be decrypted whole, and whatever the kernel had buffered when you asked. Code that assumes "one recv, one message" passes every test on localhost and fails on a slow network. An exercise has you log the sizes and explain them.</p>' },

      { type: 'h2', id: 'fields', text: 'The status line and header fields' },
      { type: 'code', snippet: 'fields' },
      { type: 'table', caption: 'Decisions the parser makes, and why.',
        head: ['Input', 'What http_client.py does', 'Why'],
        rows: [
          ['<code>HTTP/1.0 200 OK</code>', 'Accepts it; reuses the connection only with <code>Connection: keep-alive</code>', 'HTTP/1.0 connections close by default.'],
          ['<code>HTTP/1.1 200</code> (no reason)', 'Accepts it; the reason is <code>""</code>', 'The reason phrase is optional, and clients should ignore it anyway.'],
          ['<code>Vary: A</code> then <code>vary: B</code>', 'Keeps both, in order; <code>header("Vary")</code> returns <code>A, B</code>', 'Names are case-insensitive, and a repeated field means the same as one comma-joined field.'],
          ['Two <code>Set-Cookie</code> fields', 'Keeps both as separate entries', 'The exception to the joining rule: <code>Set-Cookie</code> isn\u2019t list syntax, and its <code>Expires</code> date contains a comma. Lesson 21 needs the list.'],
          ['A line starting with a space', 'Appends it to the previous value (obs-fold)', 'An obsolete way to wrap long values. RFC 9112 tells user agents to replace the fold with a space.'],
          ['<code>Bad Name: x</code>, or no colon', 'Raises <code>ProtocolError</code>', 'A field name is a token. Leniency here is where request smuggling starts.'],
          ['A CR or NUL inside a value', 'Raises <code>ProtocolError</code>', 'RFC 9110 §5.5: reject the message or replace them with spaces. Rejecting is simpler.'],
          ['Bytes 0x80 and above', 'Decodes them as Latin-1', 'Field values are octets. Latin-1 maps every byte to one character and back again, losing nothing.'],
        ] },

      { type: 'h2', id: 'framing', text: 'Where does the body end?' },
      { type: 'p', html: 'urllib made this decision silently, and every HTTP implementation has to get it exactly right. RFC 9112 §6.3 lists the rules in priority order, and <code>read_body</code> applies them in that order:' },
      { type: 'diagram', id: 'body-length' },
      { type: 'code', snippet: 'read_body' },
      { type: 'callout', tone: 'warn', title: 'Framing disagreements are security bugs',
        html: '<p>When a proxy and a server disagree about where a message ends, an attacker can hide a second request inside the body of the first: <em>request smuggling</em>. The classic version sends both <code>Content-Length</code> and <code>Transfer-Encoding: chunked</code>, hoping each side honours a different one. That is why <code>read_body</code> validates <code>Content-Length</code> strictly (Python\u2019s <code>int()</code> happily accepts <code>"+5"</code>, <code>"5_0"</code> and <code>"٥"</code>, an Arabic-Indic five), and why <code>can_reuse</code> won\u2019t trust a connection again after a message that carried both.</p>' },
      { type: 'terminal', title: 'Three framings and one pool (trimmed)', commands: ['python3 python/lesson02/http_client.py -v http://localhost:8080/trailers http://localhost:8080/close http://localhost:8080/get --body 0'],
        output: '* opened connection #1 to localhost:8080\n...\n* body: chunked, 3 chunks, 60 bytes, trailers: Content-Digest; 2 ms; connection #1 kept for reuse\n< 200 OK   (http://localhost:8080/trailers)\n...\n* reusing connection #1 to localhost:8080\n...\n* body: read until close, 76 bytes; 0 ms; connection #1 closed\n< 200 OK   (http://localhost:8080/close)\n...\n* opened connection #2 to localhost:8080\n...\n* body: Content-Length, 247 bytes; 1 ms; connection #2 kept for reuse\n< 200 OK   (http://localhost:8080/get)' },

      { type: 'h2', id: 'chunked', text: 'Chunked transfer coding' },
      { type: 'p', html: 'A server that streams a response doesn\u2019t know its length up front, so it sends the body as a series of chunks, each prefixed with its size in hex, and ends with a zero-size chunk. Here are the raw bytes from <code>/trailers</code>, with <code>curl --raw</code> leaving the framing in place and <code>cat -v</code> showing each CR as <code>^M</code>:' },
      { type: 'terminal', commands: ['curl -s --raw http://localhost:8080/trailers | cat -v'],
        output: '18^M\nThe digest of this body\n^M\ne^M\nis only known\n^M\n16^M\nafter the last chunk.\n^M\n0^M\nContent-Digest: sha-256=:bUuoPX4bVqoPqhCFkQbZXI5MmrzRR3bbOI32LoSJl+4=:^M\n^M' },
      { type: 'diagram', id: 'chunked-body' },
      { type: 'code', snippet: 'read_chunked' },
      { type: 'list', items: [
        'Chunk extensions (<code>;name=value</code> after the size) are legal and almost never used. Split them off and ignore them.',
        'Validate the size as hex digits yourself. <code>int("0x1a", 16)</code>, <code>int("+1a", 16)</code> and <code>int("1_a", 16)</code> all succeed in Python, and a parser that accepts what its neighbour rejects is a smuggling primitive. For the same reason, whitespace is allowed only before a <code>;</code>, and chunk lines must end in CRLF, not a bare LF.',
        'The trailer section has the same syntax as the header section, so <code>read_fields</code> reads it. The test server\u2019s <code>Content-Digest</code> trailer is a SHA-256 of the body, which it could only compute after sending the last chunk.',
        'Chunked framing exists only in HTTP/1.1. HTTP/2 and HTTP/3 frame everything themselves, and a <code>Transfer-Encoding</code> field is an error there.',
      ] },

      { type: 'h2', id: 'keepalive', text: 'Persistent connections' },
      { type: 'p', html: 'An HTTP/1.1 connection stays open after a response unless either side says <code>Connection: close</code> or the body was close-delimited. A pool keeps idle connections keyed by origin, so the next request to the same <code>(scheme, host, port)</code> skips DNS, TCP and TLS entirely.' },
      { type: 'diagram', id: 'keep-alive' },
      { type: 'code', snippet: 'can_reuse' },
      { type: 'code', snippet: 'pool' },
      { type: 'terminal', title: 'Three requests, one connection (trimmed)', commands: ['python3 python/lesson02/http_client.py -v https://httpbin.org/get https://httpbin.org/headers https://httpbin.org/ip --body 0'],
        output: '* opened connection #1 to httpbin.org:443\n...\n* body: Content-Length, 270 bytes; 510 ms; connection #1 kept for reuse\n< 200 OK   (https://httpbin.org/get)\n...\n* reusing connection #1 to httpbin.org:443\n...\n* body: Content-Length, 159 bytes; 89 ms; connection #1 kept for reuse\n< 200 OK   (https://httpbin.org/headers)\n...\n* reusing connection #1 to httpbin.org:443\n...\n* body: Content-Length, 45 bytes; 94 ms; connection #1 kept for reuse\n< 200 OK   (https://httpbin.org/ip)' },
      { type: 'p', html: 'The first request paid for DNS, TCP and TLS: 510&nbsp;ms. The next two took about 90&nbsp;ms each, one round trip plus server time. That ratio is the whole case for connection reuse.' },
      { type: 'p', html: '<code>exchange</code> adds two rules of its own before returning a connection to the pool. If bytes are left in the buffer after a response (a broken server sent a body with a HEAD response, say), the client no longer knows where the next message starts, so the connection is retired. And if the caller sent <code>Connection: close</code>, it is closed as promised.' },
      { type: 'h3', text: 'Stale connections' },
      { type: 'p', html: 'A pooled connection can die while it sits idle, because servers close idle connections after a few seconds or minutes. The client only finds out on its next send. The request bytes go into the kernel\u2019s buffer, so <code>sendall</code> usually succeeds, and then <code>recv</code> returns <code>b""</code> before a single byte of response. If the request is idempotent and nothing came back, it is safe to retry once on a fresh connection. A POST may already have been processed, so it is not.' },
      { type: 'code', snippet: 'retry' },
      { type: 'p', html: 'To watch it happen, run a second test server whose idle connections die after 2 seconds, in its own terminal:' },
      { type: 'terminal', title: 'Terminal 2: a server with a short idle timeout', commands: ['python3 python/tools/testserver.py --port 8090 --idle-timeout 2'] },
      { type: 'terminal', title: 'Terminal 1: two requests, 3 seconds apart', commands: [
        'python3 python/lesson02/http_client.py -v --pause 3 http://localhost:8090/get http://localhost:8090/get --body 0',
      ], output: '* opened connection #1 to localhost:8090\n...\n* body: Content-Length, 247 bytes; 2 ms; connection #1 kept for reuse\n...\n* reusing connection #1 to localhost:8090\n> GET /get HTTP/1.1\n...\n* connection #1 was closed by the server while idle; retrying\n* opened connection #2 to localhost:8090\n< HTTP/1.1 200 OK\n...' },
      { type: 'callout', tone: 'deep', title: 'Why browsers open six connections per host',
        html: '<p>HTTP/1.1 carries one request at a time per connection. Pipelining (sending several requests before reading the responses) is in the spec, but browsers gave up on it because too many proxies and servers mishandled it. So browsers open up to six parallel connections per host and queue the rest, and sites used to shard assets across hostnames to get more. HTTP/2 made all of that unnecessary: one connection carries many interleaved streams. Lesson 3 shows how.</p>' },

      { type: 'h2', id: 'redirects', text: 'Redirects' },
      { type: 'code', snippet: 'redirects' },
      { type: 'code', snippet: 'redirect_method' },
      { type: 'table', caption: 'How the method changes on a redirect (Fetch Standard, "HTTP-redirect fetch").',
        head: ['Status', 'Request method', 'Next request', 'Why'],
        rows: [
          ['301, 302', 'POST', 'GET; body and <code>Content-*</code> fields dropped', 'What browsers always did, now standardised.'],
          ['303', 'anything but GET or HEAD', 'GET; body and <code>Content-*</code> fields dropped', '"See other": the result lives somewhere else.'],
          ['307, 308', 'any', 'Same method, same body', 'The modern codes, with no ambiguity.'],
          ['301, 302', 'GET, PUT, DELETE…', 'Unchanged', 'Only POST is rewritten.'],
        ] },
      { type: 'list', items: [
        '<code>urljoin(url, location)</code> resolves relative locations such as httpbin\u2019s <code>/relative-redirect/2</code> against the URL that produced the redirect. Before that, the Location value is re-decoded as UTF-8, because servers send UTF-8 there and the field was decoded as Latin-1. Then <code>split_url</code> does the rest: <code>/café</code> becomes <code>/caf%C3%A9</code> rather than mojibake, and a non-ASCII hostname is IDNA-encoded. Bytes that aren\u2019t valid UTF-8 are percent-encoded as they are.',
        'Two different Location fields are an error, not a choice. Only http and https targets are followed: a redirect to <code>file:///etc/passwd</code> is refused.',
        'On a cross-origin redirect, <code>Authorization</code>, <code>Proxy-Authorization</code>, <code>Cookie</code> and any <code>Host</code> override are dropped, so credentials meant for one site never reach another. The tests check this by redirecting from <code>127.0.0.1</code> to <code>localhost</code>: same server, different origins.',
        'The limit is 20 hops, the Fetch Standard\u2019s number. And because the pool spans hops, same-origin redirects share one connection:',
      ] },
      { type: 'terminal', commands: ['python3 python/lesson02/http_client.py https://httpbin.org/redirect/3 --body 0', 'python3 python/lesson01/fetch.py https://httpbin.org/redirect/3 --body 0 | tail -1'],
        output: '* 302 redirect: https://httpbin.org/redirect/3 -> https://httpbin.org/relative-redirect/2\n* 302 redirect: https://httpbin.org/relative-redirect/2 -> https://httpbin.org/relative-redirect/1\n* 302 redirect: https://httpbin.org/relative-redirect/1 -> https://httpbin.org/get\n< 200 OK   (https://httpbin.org/get)\n\n* 270 body bytes in 785 ms, 4 requests, the last on connection #1 (reused)\n\n* 270 body bytes in 1375 ms' },

      { type: 'h2', id: 'implementation', text: 'Putting it together: http_client.py' },
      { type: 'p', html: 'Here is the whole client, organised in the same parts as this lesson. Run from the repo root. <code>test_http_client.py</code> covers each part in four layers: parsing tests feed exact bytes through <code>socket.socketpair()</code>; a scripted raw-socket server replays exact, sometimes broken, responses across real connections; the rest run against a private copy of the test server; and a TLS test makes a throwaway self-signed certificate with <code>openssl</code> to prove that an untrusted server is rejected.' },
      { type: 'code', snippet: 'http_client' },
      { type: 'terminal', commands: ['python3 python/lesson02/http_client.py -v https://example.com --body 60'],
        output: '* opened connection #1 to example.com:443\n> GET / HTTP/1.1\n> Host: example.com\n> User-Agent: BrowserCookbook/0.2 (+lesson-02)\n> Accept: */*\n> Accept-Encoding: identity\n>\n< HTTP/1.1 200 OK\n< Date: Sun, 15 Nov 2026 16:28:21 GMT\n< Content-Type: text/html; charset=utf-8\n< Transfer-Encoding: chunked\n< Connection: keep-alive\n< Server: cloudflare\n...\n< alt-svc: h3=":443"; ma=86400\n<\n* body: chunked, 1 chunk, 577 bytes; 237 ms; connection #1 kept for reuse\n< 200 OK   (https://example.com)\n<!doctype html><html lang=en><head><meta charset=utf-8><link\n... (517 more bytes)\n\n* 577 body bytes in 239 ms, connection #1 (new)' },
      { type: 'terminal', commands: ['python3 -m unittest discover -s python/lesson02 -v'],
        output: 'test_204_and_304_have_no_body (test_http_client.ParsingTests...) ... ok\ntest_bare_lf_line_endings_are_accepted_in_the_head (test_http_client.ParsingTests...) ... ok\n...\ntest_partial_response_is_not_retried (test_http_client.ScriptedServerTests...) ... ok\n...\ntest_stale_pooled_connection_is_retried (test_http_client.ServerTests...) ... ok\n...\ntest_untrusted_certificate_is_rejected (test_http_client.TlsTests...) ... ok\n\n----------------------------------------------------------------------\nRan 43 tests in 2.622s\n\nOK' },

      { type: 'h2', id: 'missing', text: 'What a browser does that you don\u2019t (yet)' },
      { type: 'list', items: [
        'Compression: the <code>gzip</code>, <code>br</code> and <code>zstd</code> content codings. The first is an exercise below.',
        'HTTP/2 and HTTP/3, which replace text framing with binary frames and many streams per connection (Lesson 3).',
        'Happy Eyeballs: racing IPv6 against IPv4 instead of trying addresses one by one (a stretch challenge).',
        'A cookie jar and an HTTP cache (Lesson 21).',
        'Per-host connection limits, request priorities, and an overall deadline instead of a per-<code>recv</code> timeout.',
        'HSTS, CORS, mixed-content blocking and the rest of the policy that decides whether a request may be sent at all (Lesson 22).',
        'Streaming: handing body bytes to the HTML parser as they arrive rather than after the last one (Lesson 4).',
      ] },
    ],
    experiments: [
      { id: 'exp-first', title: 'Your first raw-socket request', lang: 'python',
        summary: 'Every byte on the > lines is one your code wrote.',
        commands: ['python3 python/lesson02/http_client.py -v https://example.com --body 60'],
        output: '> GET / HTTP/1.1\n> Host: example.com\n> User-Agent: BrowserCookbook/0.2 (+lesson-02)\n> Accept: */*\n> Accept-Encoding: identity\n>\n< HTTP/1.1 200 OK\n< Transfer-Encoding: chunked\n< Connection: keep-alive\n...\n* body: chunked, 1 chunk, 577 bytes; 237 ms; connection #1 kept for reuse',
        observe: ['The <code>&gt;</code> lines are now the real request, not a reconstruction. Compare them with Lesson 1\u2019s <code>--wire</code> output.', 'You didn\u2019t send <code>Connection: close</code>, so example.com answered <code>Connection: keep-alive</code>.', 'One chunk of 577 bytes: on the wire its size line was <code>241</code>, hex for 577.'] },
      { id: 'exp-reuse', title: 'One handshake, three requests', lang: 'python',
        summary: 'Three URLs on one origin share a single TCP and TLS connection.',
        commands: ['python3 python/lesson02/http_client.py -v https://httpbin.org/get https://httpbin.org/headers https://httpbin.org/ip --body 0'],
        output: '* opened connection #1 to httpbin.org:443\n* body: Content-Length, 270 bytes; 510 ms; connection #1 kept for reuse\n* reusing connection #1 to httpbin.org:443\n* body: Content-Length, 159 bytes; 89 ms; connection #1 kept for reuse\n* reusing connection #1 to httpbin.org:443\n* body: Content-Length, 45 bytes; 94 ms; connection #1 kept for reuse',
        observe: ['Subtract a reused request\u2019s time from the first one: the difference is roughly what DNS, TCP and TLS cost.', 'Make the second URL <code>https://example.com/</code>. The pool opens connection #2, because that is a different origin.', 'Run the three URLs through <code>fetch.py</code> one at a time and add up the times.'] },
      { id: 'exp-framing', title: 'Every framing the test server can produce', lang: 'python',
        summary: 'Chunked with trailers, close-delimited, Content-Length, a 103 interim response and HEAD, all against localhost.',
        commands: [
          'python3 python/lesson02/http_client.py -v http://localhost:8080/trailers http://localhost:8080/close http://localhost:8080/get --body 0',
          'python3 python/lesson02/http_client.py -v http://localhost:8080/early-hints --body 0',
          'python3 python/lesson02/http_client.py -v -X HEAD http://localhost:8080/get --body 0',
        ],
        output: '* body: chunked, 3 chunks, 60 bytes, trailers: Content-Digest; 2 ms; connection #1 kept for reuse\n* body: read until close, 76 bytes; 0 ms; connection #1 closed\n* opened connection #2 to localhost:8080\n...\n< HTTP/1.1 103 Early Hints\n< Link: </style.css>; rel=preload; as=style\n<\n< HTTP/1.1 200 OK\n...\n< Content-Length: 248\n<\n* body: none; 3 ms; connection #1 kept for reuse',
        observe: ['<code>/close</code> cost the connection, so <code>/get</code> had to open #2.', 'The 103 response is printed and then skipped: interim responses come before the real answer, and a browser can start preloading <code>style.css</code> while the server is still thinking.', 'The HEAD response says <code>Content-Length: 248</code> but has no body. Delete the <code>method == "HEAD"</code> test in <code>read_body</code> and run it again: the client waits for 248 bytes that never come, until its 10-second timeout fires or the server gives up on the idle connection (15 seconds by default).'] },
      { id: 'exp-redirect-methods', title: 'Redirects and methods', lang: 'python',
        summary: 'POST into a 303 and into a 307, then compare with urllib.',
        commands: [
          'python3 python/lesson02/http_client.py -X POST -d hello "http://localhost:8080/redirect-to?url=/anything&status_code=303" --body 400',
          'python3 python/lesson02/http_client.py -X POST -d hello "http://localhost:8080/redirect-to?url=/anything&status_code=307" --body 400',
          'python3 python/lesson01/fetch.py --method POST "http://localhost:8080/redirect-to?url=/anything&status_code=307" --body 0',
        ],
        output: '* 303 redirect: http://localhost:8080/redirect-to?url=/anything&status_code=303 -> http://localhost:8080/anything\n< 200 OK   (http://localhost:8080/anything)\n{\n  "method": "GET",\n  ...\n  "data": ""\n}\n\n* 252 body bytes in 4 ms, 2 requests, the last on connection #1 (reused)\n\n* 307 redirect: http://localhost:8080/redirect-to?url=/anything&status_code=307 -> http://localhost:8080/anything\n< 200 OK   (http://localhost:8080/anything)\n{\n  "method": "POST",\n  ...\n  "data": "hello"\n}\n\n* 285 body bytes in 4 ms, 2 requests, the last on connection #1 (reused)\n\n* urllib would not follow the redirect below, so that 3xx response is the result\n< 307 Temporary Redirect   (http://localhost:8080/redirect-to?url=/anything&status_code=307)',
        observe: ['303 turned the POST into a GET and dropped the body; 307 kept both.', 'urllib refuses to follow a 307 for a POST at all. Your client follows it the way a browser does.', 'Both redirects reused connection #1: the summary line says so.'] },
      { id: 'exp-stale', title: 'Kill an idle connection', lang: 'python',
        summary: 'Let the server time out a pooled connection, then watch the client notice and retry.',
        commands: [
          'python3 python/tools/testserver.py --port 8090 --idle-timeout 2',
          'python3 python/lesson02/http_client.py -v --pause 3 http://localhost:8090/get http://localhost:8090/get --body 0',
        ],
        output: '* reusing connection #1 to localhost:8090\n> GET /get HTTP/1.1\n...\n* connection #1 was closed by the server while idle; retrying\n* opened connection #2 to localhost:8090\n< HTTP/1.1 200 OK',
        observe: ['The first command is a second server; run it in its own terminal and leave your usual one on port 8080 alone.', 'Change both URLs to <code>/anything</code> and add <code>-X POST</code>. The first POST succeeds; for the second, the client refuses to retry and reports the error instead. Why is that the right call?', 'Try <code>--pause 1</code>: the connection is still alive, and there is no retry.'] },
      { id: 'exp-raw-chunks', title: 'Read chunked framing with your own eyes', lang: 'shell',
        summary: 'curl --raw and nc show the framing your client strips off.',
        commands: [
          'curl -s --raw "http://localhost:8080/chunked?chunks=3" | cat -v',
          "(printf 'GET / HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n'; sleep 2) | nc example.com 80 | awk '/^\\r$/ {getline; print; exit}' | cat -v",
        ],
        output: 'd^M\nchunk 1 of 3\n^M\nd^M\nchunk 2 of 3\n^M\nd^M\nchunk 3 of 3\n^M\n0^M\n^M\n\n241^M',
        observe: ['<code>d</code> is 13: "chunk 1 of 3" plus its newline.', 'The <code>awk</code> skips to the empty line that ends example.com\u2019s headers and prints the line after it: the first chunk size, <code>241</code> (577 bytes).', 'Every size line and every chunk ends in <code>^M</code> (CR) plus a newline (LF).'] },
    ],
    exercises: [
      { id: 'ex-chunked', title: 'Decode chunks by hand', html: 'Fetch <code>/chunked?chunks=5</code> and <code>/trailers</code> from the test server with <code>curl -s --raw ... | cat -v</code> or <code>nc</code>. Decode both by hand, including the trailer section, and check your byte counts against the client\u2019s.' },
      { id: 'ex-pool', title: 'Prove reuse', html: 'Fetch three paths from httpbin.org over one connection and show that only one TCP handshake happened: with timings, or with <code>sudo tcpdump -nn -i any \'tcp port 443 and host httpbin.org\'</code>, counting <code>[S]</code> packets. Then fetch the same paths with <code>fetch.py</code> and count again.' },
      { id: 'ex-gzip', title: 'Content-Encoding: gzip', html: 'Send <code>-H \'Accept-Encoding: gzip\'</code> and decode the body with <code>gzip.decompress</code> when the response carries <code>Content-Encoding: gzip</code>. Try example.com (gzip, chunked), then <code>https://httpbin.org/gzip</code> or the test server\u2019s <code>/gzip</code>, which send a <code>Content-Length</code>. Explain the difference between <code>Content-Encoding</code> (a property of the content, end to end) and <code>Transfer-Encoding</code> (how this one hop is framed), and which bytes <code>Content-Length</code> counts.' },
      { id: 'ex-hostile', title: 'Hostile servers', html: 'The client already rejects oversized heads, bad chunk sizes and short bodies (read the limit tests). Here are three attacks it doesn\u2019t defend against yet: a close-delimited body that never ends (or a <code>Content-Length</code> of 10&nbsp;GB), a server that sends one header byte every 9 seconds (each <code>recv</code> succeeds, so the 10-second timeout never fires), and <code>Content-Length</code> or <code>Transfer-Encoding</code> smuggled into the trailer section. Write a failing test for each with the scripted server, decide what the client should do (a body-size cap? an overall deadline, as in the next exercise? ignoring framing fields in trailers?), then make it pass.' },
      { id: 'ex-recv', title: 'Watch recv() at work', html: 'Log <code>len(data)</code> in <code>Connection._fill</code>. Fetch <code>http://localhost:8080/bytes/1000000</code>, then a large page over HTTPS. Explain the sizes you see in terms of TCP segments, TLS records and timing.' },
      { id: 'ex-deadline', title: 'A real deadline', html: 'Add a <code>--deadline</code> option: a time budget for the whole request, redirects included, enforced by shrinking the socket timeout before each <code>recv</code>. Prove it works with <code>"http://localhost:8080/drip?duration=5&amp;numbytes=5"</code> and a 2-second deadline, which urllib could not do in Lesson 1.' },
    ],
    stretch: [
      { id: 'st-happy-eyeballs', title: 'Happy Eyeballs', html: 'Replace <code>socket.create_connection</code> with RFC 8305: resolve both address families, try IPv6 first, start IPv4 250&nbsp;ms later if IPv6 hasn\u2019t connected, keep the winner and close the loser. Use non-blocking sockets and the <code>selectors</code> module. Simulate a broken IPv6 route by putting <code>2001:db8::1</code> (a documentation address that is never routed) first in the list. On a machine with no IPv6 at all that attempt fails instantly instead of hanging, so add an artificial delay to exercise the race.' },
      { id: 'st-pipelining', title: 'Pipelining', html: 'Send three requests on one connection before reading any response, then read the three responses in order. Measure the gain against httpbin.org, then find out why every major browser turned pipelining off.' },
      { id: 'st-rust', title: 'Rust track: framing in Rust', html: 'Port <code>Connection</code>, <code>read_fields</code> and <code>read_body</code> to Rust using <code>std::net::TcpStream</code> and a <code>Vec&lt;u8&gt;</code> buffer, with no crates and no TLS. Point it at the test server and make it handle the same framing cases as the Python tests.' },
    ],
    takeaways: [
      'TCP delivers a byte stream and recv() returns arbitrary slices of it. A buffered reader that takes exactly what each step needs is the foundation of every protocol parser.',
      'A response body ends by one of four rules, applied in order: no body, Transfer-Encoding, Content-Length, connection close.',
      'Be liberal where it is harmless (a bare LF in the head, obs-fold, a missing reason phrase) and strict where framing is at stake (hex digits and CRLF in chunk lines, Content-Length digits, TE together with CL).',
      'Connection reuse is the biggest single win in HTTP/1.1: it takes DNS, TCP and TLS out of every request after the first.',
      'Retrying is only safe for idempotent requests that received nothing.',
      'Redirects change the method and drop credentials by precise rules, and the Fetch Standard is where those rules live.',
    ],
    references: [
      { title: 'RFC 9112: HTTP/1.1 (§6 message body, §7 transfer codings, §9 connections)', url: 'https://www.rfc-editor.org/rfc/rfc9112.html' },
      { title: 'RFC 9110: HTTP Semantics (§9.2.2 idempotent methods, §15.4 redirection)', url: 'https://www.rfc-editor.org/rfc/rfc9110.html' },
      { title: 'Fetch Standard: HTTP-redirect fetch', url: 'https://fetch.spec.whatwg.org/#http-redirect-fetch' },
      { title: 'RFC 8297: 103 Early Hints', url: 'https://www.rfc-editor.org/rfc/rfc8297.html' },
      { title: 'RFC 9530: Digest Fields', url: 'https://www.rfc-editor.org/rfc/rfc9530.html' },
      { title: 'PortSwigger Web Security Academy: HTTP request smuggling', url: 'https://portswigger.net/web-security/request-smuggling' },
      { title: 'Python docs: socket', url: 'https://docs.python.org/3/library/socket.html' },
      { title: 'Python docs: ssl', url: 'https://docs.python.org/3/library/ssl.html' },
      { title: 'Web Browser Engineering, ch. 1: Downloading Web Pages', url: 'https://browser.engineering/http.html' },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* Lessons 3–30: outlines. Promote one to "ready" by adding body,      */
  /* experiments and snippets in the same shape as Lessons 1 and 2.      */
  /* ------------------------------------------------------------------ */

  function outline(number, part, title, fields) {
    COURSE.lessons.push(Object.assign({
      id: 'l' + String(number).padStart(2, '0'),
      number: number,
      part: part,
      title: title,
      status: 'outline',
    }, fields));
  }

  outline(3, 'network', 'Networking Deeper', {
    summary: 'Write a DNS resolver, speak the first frames of HTTP/2, and see why HTTP/3 moved to QUIC.',
    minutes: 240,
    objectives: [
      'Encode and decode DNS messages and follow referrals from the root.',
      'Decode HTTPS (SVCB) records and explain how they let a browser skip Alt-Svc.',
      'Negotiate h2 with ALPN, then decode HTTP/2 frames and an HPACK-encoded header block.',
      'Explain how QUIC removes TCP head-of-line blocking and handshake latency.',
    ],
    topics: ['DNS message format', 'Iterative resolution and referrals', 'QNAME minimisation', 'HTTPS (SVCB) records', 'Connection racing with HTTPS records', 'HTTP/2 framing and streams', 'HPACK', 'HTTP/3 and QUIC', 'Connection coalescing'],
    build: 'Start with cp -R python/lesson02 python/lesson03, so http_client.py carries forward from here. Then add dns.py, an iterative resolver over UDP that starts at a root server, and h2_probe.py, which negotiates h2 with ALPN, sends the connection preface and decodes the frames the server sends back.',
    body: [{ type: 'diagram', id: 'dns-resolution' }],
    exercises: [
      { id: 'ex-dns-wire', title: 'DNS on the wire', html: 'Build an A query by hand with <code>struct.pack</code>, send it to 1.1.1.1 and parse the answer section, including name compression pointers.' },
      { id: 'ex-https-rr', title: 'Decode an HTTPS record', html: 'Lesson 1\u2019s <code>dig +short example.com TYPE65</code> printed raw hex. Decode it by hand using RFC 9460 \u00a72.2: priority, target name, then each SvcParam key, length and value. You should recover <code>alpn="h3,h2"</code> and both address hints.' },
      { id: 'ex-h2-preface', title: 'Hello, HTTP/2', html: 'Connect to example.com with ALPN <code>["h2"]</code>, send the 24-byte connection preface and an empty SETTINGS frame, and decode the 9-byte headers of the frames that come back. What settings does the server announce?' },
      { id: 'ex-hpack', title: 'Read an HPACK block', html: 'Send a GET on stream 1 (HPACK-encode it with literal fields, no Huffman), then decode the HEADERS block that comes back: indexed fields from the static table first, then literals, then Huffman-coded strings.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: DNS in Rust', html: 'Build and parse DNS messages in Rust over <code>std::net::UdpSocket</code>, with no crates. Compare the code that handles name compression with your Python version.' },
    ],
    references: [
      { title: 'RFC 1035: Domain Names — Implementation', url: 'https://www.rfc-editor.org/rfc/rfc1035.html' },
      { title: 'RFC 9156: DNS Query Name Minimisation', url: 'https://www.rfc-editor.org/rfc/rfc9156.html' },
      { title: 'RFC 9460: SVCB and HTTPS resource records', url: 'https://www.rfc-editor.org/rfc/rfc9460.html' },
      { title: 'RFC 9113: HTTP/2', url: 'https://www.rfc-editor.org/rfc/rfc9113.html' },
      { title: 'RFC 7541: HPACK', url: 'https://www.rfc-editor.org/rfc/rfc7541.html' },
      { title: 'RFC 9000: QUIC', url: 'https://www.rfc-editor.org/rfc/rfc9000.html' },
      { title: 'RFC 9114: HTTP/3', url: 'https://www.rfc-editor.org/rfc/rfc9114.html' },
      { title: 'RFC 8305: Happy Eyeballs v2', url: 'https://www.rfc-editor.org/rfc/rfc8305.html' },
    ],
  });

  outline(4, 'documents', 'HTML Tokenization and Parsing', {
    summary: 'The HTML parser is a state machine with error recovery built into the specification. Implement a real subset of it.',
    minutes: 360,
    objectives: [
      'Implement the core tokenizer states, including character references.',
      'Implement tree construction with insertion modes and implied tags.',
      'Explain the adoption agency algorithm and foster parenting (implementing them is a stretch).',
      'Explain why scripts block parsing and how the preload scanner helps.',
    ],
    topics: ['Encoding sniffing', 'Tokenizer state machine', 'Tree construction and insertion modes', 'Error recovery', 'Script blocking and speculative parsing'],
    build: 'python/lesson04/html_parser.py: a tokenizer and tree builder that passes a chosen subset of html5lib-tests.',
    body: [{ type: 'diagram', id: 'html-parsing' }],
    exercises: [
      { id: 'ex-misnest', title: 'Mis-nested tags', html: 'Predict the DOM for <code>&lt;b&gt;1&lt;p&gt;2&lt;/b&gt;3&lt;/p&gt;</code>, check it in a browser, then make your parser agree.' },
      { id: 'ex-html5lib', title: 'A conformance number', html: 'Write a runner for <code>tree-construction/tests1.dat</code> from html5lib-tests: parse each <code>#data</code> section and compare your tree with <code>#document</code>. Report a pass rate, and keep the runner: Lesson 27 builds on it.' },
      { id: 'ex-stream', title: 'Feed it in pieces', html: 'Feed your tokenizer the test server\u2019s <code>/html</code> page one byte at a time, then in random-sized pieces, and assert that the tokens are identical every time. Real parsers receive HTML in network-sized chunks.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: tokenizer', html: 'Port the tokenizer to Rust with an <code>enum State</code> and a <code>match</code> per state. Run both tokenizers over the same inputs and diff their token streams.' },
    ],
    references: [
      { title: 'HTML Standard §13.2: Parsing HTML documents', url: 'https://html.spec.whatwg.org/multipage/parsing.html' },
      { title: 'html5lib-tests', url: 'https://github.com/html5lib/html5lib-tests' },
      { title: 'Web Browser Engineering, ch. 4: Constructing an HTML Tree', url: 'https://browser.engineering/html.html' },
    ],
  });

  outline(5, 'documents', 'DOM Construction and Mutation', {
    summary: 'The DOM is a tree with strict invariants and precisely specified mutation algorithms. Build one that enforces them.',
    minutes: 150,
    objectives: [
      'Model Node, Element, Text and Document, and their invariants.',
      'Implement insert, remove and replace following the DOM Standard\u2019s pre-insertion validity checks.',
      'Implement a live collection and a static one, and queue mutation records.',
    ],
    topics: ['Node types', 'Tree invariants', 'Mutation algorithms', 'Live and static collections', 'Mutation records (delivered as microtasks in Lesson 15)', 'Serialization'],
    build: 'python/lesson05/dom.py: a DOM with appendChild, insertBefore and removeChild, plus an HTML serializer that round-trips your Lesson 4 parser.',
    body: [{ type: 'diagram', id: 'dom-tree' }],
    exercises: [
      { id: 'ex-hierarchy', title: 'HierarchyRequestError', html: 'Make <code>a.appendChild(a.parentNode)</code> fail exactly the way the DOM Standard says it should.' },
      { id: 'ex-roundtrip', title: 'Round trips', html: 'For 20 documents, check that parse → serialize → parse gives the same tree. Then find an input whose serialization differs from the original text, and explain why that\u2019s allowed.' },
      { id: 'ex-live', title: 'Live versus static', html: 'Implement <code>getElementsByTagName</code> as a live view and <code>querySelectorAll</code> as a static list. Write a loop that removes every <code>p</code> while iterating, and show why it skips elements with the live collection but not the static one.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: a DOM without Rc', html: 'Model the DOM in Rust as a <code>Vec&lt;Node&gt;</code> addressed by <code>NodeId</code> indices, with parent, first-child and next-sibling links. Implement <code>append_child</code> and <code>remove_child</code> with the same validity checks as Python.' },
    ],
    references: [
      { title: 'DOM Standard', url: 'https://dom.spec.whatwg.org/' },
      { title: 'Web Browser Engineering, ch. 4: Constructing an HTML Tree', url: 'https://browser.engineering/html.html' },
    ],
  });

  outline(6, 'documents', 'CSS Parsing and Selectors', {
    summary: 'Tokenize CSS per the Syntax spec, parse rules with forgiving error recovery, and match selectors efficiently.',
    minutes: 180,
    objectives: [
      'Implement the CSS Syntax Level 3 tokenizer and rule parser, including at-rules.',
      'Parse compound and complex selectors, and compute specificity.',
      'Match selectors right to left, and speed up ancestor checks with a bloom filter.',
    ],
    topics: ['CSS tokenization', 'Rules, declarations and error recovery', 'At-rules: @media, @import, @layer', 'CSS nesting', 'Selector grammar', 'Specificity', 'Matching strategies'],
    build: 'python/lesson06/css_parser.py: stylesheet parser and selector matcher operating on your Lesson 5 DOM.',
    exercises: [
      { id: 'ex-specificity', title: 'Specificity edge cases', html: 'Compute specificity for <code>:is(#a, .b) p</code>, <code>:where(#a) p</code> and <code>:not(.x, #y)</code>, then verify your implementation.' },
      { id: 'ex-recovery', title: 'Error recovery', html: 'Feed your parser a stylesheet with an unclosed block, a declaration missing its colon, and an unknown at-rule. Check that it drops exactly what the CSS Syntax spec says to drop, and compare with what a browser keeps in <code>document.styleSheets</code>.' },
      { id: 'ex-bloom', title: 'A bloom filter for ancestors', html: 'Time matching 1,000 descendant selectors against a 10,000-element document. Then keep a bloom filter of the tags, ids and classes of the current element\u2019s ancestors, use it to reject most selectors early, and measure again.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: CSS tokenizer', html: 'Port the CSS tokenizer to Rust. Tokenize a large minified stylesheet from a real site with both versions and compare their output and speed.' },
    ],
    references: [
      { title: 'CSS Syntax Module Level 3', url: 'https://www.w3.org/TR/css-syntax-3/' },
      { title: 'Selectors Level 4', url: 'https://www.w3.org/TR/selectors-4/' },
      { title: 'CSS Nesting Module', url: 'https://www.w3.org/TR/css-nesting-1/' },
      { title: 'Web Browser Engineering, ch. 6: Applying Author Styles', url: 'https://browser.engineering/styles.html' },
    ],
  });

  outline(7, 'documents', 'Cascade, Inheritance and Computed Styles', {
    summary: 'Collect a page\u2019s stylesheets and resolve every property on every element: cascade, inheritance and the value-processing stages.',
    minutes: 210,
    objectives: [
      'Collect stylesheets from <style>, <link rel=stylesheet> (fetched with your http_client.py) and style attributes, honouring media queries.',
      'Implement the cascade sort: origin and importance, context, the style attribute, layers, specificity, order.',
      'Distinguish specified, computed, used and actual values, including var() substitution.',
      'Implement inheritance and the CSS-wide keywords.',
    ],
    topics: ['Collecting stylesheets: <style>, <link>, style=""', 'Media queries against the viewport', 'Origins and importance', 'Cascade layers', 'Inheritance', 'initial / inherit / unset / revert', 'Custom properties and var()', 'Computed vs used values', 'Style sharing'],
    build: 'python/lesson07/style.py: attaches a computed style map to every DOM node, including a user-agent stylesheet.',
    body: [{ type: 'diagram', id: 'css-cascade' }],
    exercises: [
      { id: 'ex-em', title: 'em resolution', html: 'Make nested <code>font-size: 1.5em</code> compound correctly, and make <code>line-height: 1.5</code> (unitless) inherit as a number, not a length.' },
      { id: 'ex-ua-sheet', title: 'A user-agent stylesheet', html: 'Write the stylesheet your browser applies before any author CSS: <code>display: none</code> for <code>head</code>, <code>script</code> and <code>style</code>, block display and margins for paragraphs and headings. Compare it with the HTML Standard\u2019s Rendering section.' },
      { id: 'ex-layers', title: 'Layers versus specificity', html: 'Write three <code>@layer</code> blocks and one unlayered rule that set the same property on the same element, with and without <code>!important</code>. Predict the winner each time, check in Chrome, then make your cascade agree.' },
      { id: 'ex-style-dump', title: 'Dump the styled tree', html: 'Print the styled tree as JSON lines (node, depth, the computed values layout needs). Tests can compare it, and the Rust track\u2019s layout reads it in Lesson 8.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: the cascade sort', html: 'Implement the cascade sort in Rust by implementing <code>Ord</code> on a key of (origin and importance, context, style attribute, layer, specificity, order of appearance). Check it against the Python version on the same rules.' },
    ],
    references: [
      { title: 'CSS Cascading and Inheritance Level 5', url: 'https://www.w3.org/TR/css-cascade-5/' },
      { title: 'CSS Values and Units Level 4', url: 'https://www.w3.org/TR/css-values-4/' },
      { title: 'CSS Custom Properties Level 1', url: 'https://www.w3.org/TR/css-variables-1/' },
      { title: 'Media Queries Level 5', url: 'https://www.w3.org/TR/mediaqueries-5/' },
    ],
  });

  outline(8, 'pixels', 'Box Model and Layout', {
    summary: 'Generate a layout tree from the styled DOM, compute geometry for block and positioned boxes, and draw it: the first time your browser shows a page.',
    minutes: 210,
    objectives: [
      'Build a layout tree and explain why it differs from the DOM.',
      'Resolve widths, margins and containing blocks for block-level boxes.',
      'Implement margin collapsing for the common cases.',
      'Place relatively and absolutely positioned boxes against their containing blocks.',
    ],
    topics: ['Box generation and display', 'Containing blocks', 'Width and height resolution', 'Margin collapsing', 'Positioned layout: relative, absolute, fixed', 'Drawing rectangles with Tkinter'],
    build: 'python/lesson08/browser.py URL: fetch with http_client.py, parse, style, lay out and draw into a Tkinter window, with block and positioned layout in layout.py, and a --dump mode that prints the layout tree as text (box type, x, y, width, height) instead of drawing it. Every later lesson extends this pipeline, and Lessons 10 and 28 compare dumps.',
    body: [{ type: 'diagram', id: 'rendering-pipeline' }],
    exercises: [
      { id: 'ex-collapse', title: 'Margin collapsing', html: 'Write five test documents covering parent/first-child collapsing, empty blocks and the cases where collapsing is prevented.' },
      { id: 'ex-dump', title: 'Golden layout tests', html: 'Use <code>--dump</code> to write golden-file tests: one checked-in text dump per test document, compared exactly, with numbers rounded so they are stable. They run without a window, so they work in a Codespace too.' },
      { id: 'ex-abspos', title: 'Absolute positioning', html: 'Lay out an absolutely positioned box against its nearest positioned ancestor (not its parent), with <code>top</code>, <code>left</code> and <code>width: auto</code>, and match Chrome\u2019s <code>getBoundingClientRect()</code>.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: block layout', html: 'Port block layout to Rust. Have it read the styled tree that Lesson 7\u2019s <code>ex-style-dump</code> writes and print the same layout dump as Python. Diffing the two dumps is your first parity test.' },
    ],
    references: [
      { title: 'CSS 2.2 §9: Visual formatting model', url: 'https://www.w3.org/TR/CSS22/visuren.html' },
      { title: 'CSS 2.2 §10: Visual formatting model details', url: 'https://www.w3.org/TR/CSS22/visudet.html' },
      { title: 'CSS 2.2 §8.3.1: Collapsing margins', url: 'https://www.w3.org/TR/CSS22/box.html#collapsing-margins' },
      { title: 'CSS Positioned Layout Level 3', url: 'https://www.w3.org/TR/css-position-3/' },
      { title: 'Web Browser Engineering, ch. 2: Drawing to the Screen', url: 'https://browser.engineering/graphics.html' },
      { title: 'Web Browser Engineering, ch. 5: Laying Out Pages', url: 'https://browser.engineering/layout.html' },
    ],
  });

  outline(9, 'pixels', 'Block and Inline Formatting', {
    summary: 'Line boxes, text measurement, line breaking and baseline alignment: the hard part of layout.',
    minutes: 240,
    objectives: [
      'Implement inline layout with line boxes and word wrapping (breaking at spaces is enough to start).',
      'Use font metrics (ascent, descent, line gap) for vertical alignment.',
      'Lay out images as inline replaced elements with an intrinsic size.',
      'Explain block formatting contexts and floats (implementing floats is a stretch).',
    ],
    topics: ['Block and inline formatting contexts', 'Line boxes', 'Font metrics and baselines', 'Line breaking (UAX #14)', 'Fonts and font fallback', 'Inline replaced elements: <img> intrinsic size and aspect ratio', 'Bidirectional text (UAX #9), overview', 'Text shaping overview', 'Floats'],
    build: 'python/lesson09/inline.py: inline layout with wrapping, images and mixed font sizes on a shared baseline.',
    exercises: [
      { id: 'ex-baseline', title: 'Mixed sizes', html: 'Render <code>small &lt;big&gt;BIG&lt;/big&gt; small</code> and make the baselines line up exactly.' },
      { id: 'ex-wrap', title: 'Wrap like a browser', html: 'Wrap a paragraph using <code>tkinter.font.Font.measure</code> at three widths, then load the same text and font in a browser at the same widths. Where do the line breaks differ, and why?' },
    ],
    stretch: [
      { id: 'st-floats', title: 'Floats', html: 'Implement left and right floats, with line boxes that shorten to flow around them, and <code>clear</code>.' },
      { id: 'st-rust', title: 'Rust track: line breaking', html: 'Implement greedy line breaking in Rust over a list of measured words, and feed it the widths your Python version measured so both break lines identically.' },
    ],
    references: [
      { title: 'CSS 2.2 §9.4: Normal flow', url: 'https://www.w3.org/TR/CSS22/visuren.html#normal-flow' },
      { title: 'CSS Text Module Level 3', url: 'https://www.w3.org/TR/css-text-3/' },
      { title: 'UAX #14: Line Breaking', url: 'https://www.unicode.org/reports/tr14/' },
      { title: 'UAX #9: Bidirectional Algorithm', url: 'https://www.unicode.org/reports/tr9/' },
      { title: 'Web Browser Engineering, ch. 3: Formatting Text', url: 'https://browser.engineering/text.html' },
    ],
  });

  outline(10, 'pixels', 'Flexbox and Grid', {
    summary: 'Implement the flex layout algorithm and understand grid track sizing and intrinsic sizes.',
    minutes: 300,
    objectives: [
      'Implement single-line flex layout: basis, grow, shrink, alignment.',
      'Compute min-content and max-content intrinsic sizes.',
      'Work through the grid track sizing algorithm by hand for one grid.',
    ],
    topics: ['Flex layout algorithm', 'Resolving flexible lengths', 'Intrinsic sizing', 'Grid track sizing', 'Tables (overview)'],
    build: 'python/lesson10/flex.py: single-line flex layout, tested against geometry dumped from Chrome with getBoundingClientRect() in your Lesson 8 dump format.',
    exercises: [
      { id: 'ex-shrink', title: 'Weighted shrink', html: 'Explain, and then implement, why <code>flex-shrink</code> is weighted by flex basis but <code>flex-grow</code> is not.' },
      { id: 'ex-intrinsic', title: 'Intrinsic sizes', html: 'Compute the min-content and max-content widths of a paragraph and of a flex row, and check them against Chrome with <code>width: min-content</code> and <code>width: max-content</code>.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: flex', html: 'Port single-line flex layout to Rust and run it on the same test cases as Python, comparing the text dumps.' },
    ],
    references: [
      { title: 'CSS Flexbox Level 1 §9: Flex layout algorithm', url: 'https://www.w3.org/TR/css-flexbox-1/#layout-algorithm' },
      { title: 'CSS Grid Level 2 §12: Track sizing', url: 'https://www.w3.org/TR/css-grid-2/#algo-track-sizing' },
    ],
  });

  outline(11, 'pixels', 'Painting and Rasterization', {
    summary: 'Turn a layout tree into a display list in correct stacking order, then turn draw commands into pixels yourself.',
    minutes: 240,
    objectives: [
      'Produce a display list in CSS painting order, with clipping for overflow.',
      'Explain stacking contexts.',
      'Rasterize rectangles, anti-aliased edges and text (a bitmap font is enough) into a pixel buffer.',
    ],
    topics: ['Display lists', 'Painting order and stacking contexts', 'Clipping and overflow', 'Scanline rasterization', 'Anti-aliasing', 'Text rasterization', 'Image decoding', 'Skia'],
    build: 'python/lesson11/raster.py: renders your display list to a PPM image with a hand-written rasterizer.',
    body: [{ type: 'diagram', id: 'rendering-pipeline' }],
    exercises: [
      { id: 'ex-zindex', title: 'z-index puzzle', html: 'Build a document where a <code>z-index: 9999</code> element renders under a <code>z-index: 1</code> element, and explain it in terms of stacking contexts.' },
      { id: 'ex-png', title: 'Decode a PNG', html: 'Decode a small 8-bit RGB PNG with only <code>zlib</code> and <code>struct</code>: parse the chunks, inflate <code>IDAT</code>, undo the five scanline filters, then blit the pixels into your raster buffer. Browsers decode images off the main thread for good reason: time yours.' },
    ],
    stretch: [
      { id: 'st-canvas', title: 'A canvas element', html: 'Give <code>&lt;canvas&gt;</code> a tiny 2D context (<code>fillRect</code>, <code>strokeRect</code>, <code>fillText</code>) that draws into your own rasterizer.' },
      { id: 'st-rust', title: 'Rust track: rasterizer', html: 'Build the display list in Rust from your layout dump, then rasterize it to the same PPM as Python. Diff the images byte for byte, then compare how long each takes on a 1920×1080 frame.' },
    ],
    references: [
      { title: 'CSS 2.2 Appendix E: Stacking contexts', url: 'https://www.w3.org/TR/CSS22/zindex.html' },
      { title: 'CSS Overflow Level 3', url: 'https://www.w3.org/TR/css-overflow-3/' },
      { title: 'PNG Specification (Third Edition)', url: 'https://www.w3.org/TR/png-3/' },
      { title: 'Skia documentation', url: 'https://skia.org/docs/' },
      { title: 'Web Browser Engineering, ch. 11: Adding Visual Effects', url: 'https://browser.engineering/visual-effects.html' },
    ],
  });

  outline(12, 'pixels', 'Compositing and GPU Acceleration', {
    summary: 'Split painting into layers and tiles so scrolling and animations bypass layout and paint entirely.',
    minutes: 180,
    objectives: [
      'Explain layers, tiles and the compositor thread.',
      'Scroll and animate opacity and transform without relayout or repaint, and prove it with counters.',
      'Reason about overdraw, layer explosion and GPU memory.',
    ],
    topics: ['Compositing layers', 'Tiling', 'Compositor thread', 'Scrolling and scroll containers', 'Damage tracking', 'GPU texture upload'],
    build: 'python/lesson12/compositor.py: show each layer as a Tk PhotoImage (Tk reads PPM directly) and scroll or animate by moving canvas items. Counters prove that composite-only frames do no layout or paint, and you report frame times.',
    exercises: [
      { id: 'ex-layers', title: 'Layer inspection', html: 'Use the DevTools Layers panel to find three reasons an element was promoted to its own layer.' },
      { id: 'ex-scroll', title: 'Scroll without repainting', html: 'Make scrolling move an already-rasterized layer instead of repainting, and add a counter that proves no paint happened during the scroll.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: compositor', html: 'Write the compositing step in Rust: blend a stack of RGBA layers with opacity and offsets into one frame, and measure how many frames per second it sustains.' },
    ],
    references: [
      { title: 'RenderingNG architecture (Chromium)', url: 'https://developer.chrome.com/docs/chromium/renderingng-architecture' },
      { title: 'How cc works (Chromium compositor)', url: 'https://chromium.googlesource.com/chromium/src/+/main/docs/how_cc_works.md' },
      { title: 'Web Browser Engineering, ch. 13: Animating and Compositing', url: 'https://browser.engineering/animations.html' },
    ],
  });

  outline(13, 'applications', 'JavaScript Execution Engines', {
    summary: 'From source text to bytecode to optimized machine code. Decide whether to write or embed an engine, build a tiny interpreter, and study how V8 goes fast.',
    minutes: 360,
    objectives: [
      'Decide, with evidence and before you write a parser, whether Part IV runs on your own interpreter or an embedded engine.',
      'Write a lexer, a parser to an AST, and a tree-walking interpreter for a JS subset.',
      'Explain bytecode interpreters and tiered JIT compilation.',
      'Explain hidden classes (shapes) and inline caches.',
    ],
    topics: ['Writing vs embedding an engine', 'Lexing and parsing', 'ASTs', 'Bytecode', 'JIT tiers', 'Hidden classes and inline caches', 'Deoptimization'],
    build: 'python/lesson13/js.py: an interpreter for expressions, variables, functions and objects.',
    exercises: [
      { id: 'ex-embed', title: 'Write or embed? Decide first', html: 'Before you write the parser: your interpreter will never run real sites\u2019 JavaScript. Web Browser Engineering embeds DukPy instead, and small browsers often embed QuickJS. List what Lessons 14–17 need from an engine, decide whether to keep going with your own or embed one, and record the reasoning in your notes. Lessons 14–17 give both paths.' },
      { id: 'ex-megamorphic', title: 'Megamorphic', html: 'Write a micro-benchmark that makes a property access go from monomorphic to megamorphic, and measure the cost in Chrome.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: JS lexer (standalone)', html: 'Port the lexer to Rust, using an <code>enum Token</code> that borrows slices of the source (<code>&amp;str</code> with a lifetime) instead of copying strings. Part VII doesn\u2019t run JavaScript, so this one is purely for the Rust practice.' },
    ],
    references: [
      { title: 'ECMAScript Language Specification', url: 'https://tc39.es/ecma262/' },
      { title: 'Crafting Interpreters', url: 'https://craftinginterpreters.com/' },
      { title: 'Shapes and Inline Caches (Bynens and Meurer)', url: 'https://mathiasbynens.be/notes/shapes-ics' },
      { title: 'V8 blog', url: 'https://v8.dev/blog' },
      { title: 'QuickJS', url: 'https://bellard.org/quickjs/' },
      { title: 'Web Browser Engineering, ch. 9: Running Interactive Scripts', url: 'https://browser.engineering/scripts.html' },
    ],
  });

  outline(14, 'applications', 'Execution Contexts, Stack and Heap', {
    summary: 'Environment records, closures, the call stack and garbage collection.',
    minutes: 180,
    objectives: [
      'Implement lexical environments and closures in your interpreter.',
      'Explain realms and execution contexts as the spec defines them.',
      'Implement mark-and-sweep garbage collection and explain generational GC.',
    ],
    topics: ['Environment records', 'Scope chains and closures', 'Realms', 'Call stack frames', 'Heap allocation', 'Garbage collection'],
    build: 'python/lesson14/js.py: closures and a mark-sweep collector over an explicit heap, with objects addressed by handle, so your collector (not Python\u2019s) decides what lives. If you embedded an engine in Lesson 13, do this in a standalone copy of your interpreter.',
    exercises: [
      { id: 'ex-leak', title: 'Closure leak', html: 'Write a closure that unintentionally retains a large object, then find it with a heap snapshot.' },
      { id: 'ex-roots', title: 'What are the roots?', html: 'Roots include the environment chain, the call stack and pending timers. Write tests showing that an object reachable only through a captured variable survives a collection, and that it is freed once the closure itself is unreachable.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: mark and sweep (standalone)', html: 'Implement a mark-and-sweep collector in Rust over an arena of objects addressed by index, with no <code>unsafe</code>. Then explain why real engines use <code>unsafe</code> anyway.' },
    ],
    references: [
      { title: 'ECMA-262 §9: Executable code and execution contexts', url: 'https://tc39.es/ecma262/#sec-executable-code-and-execution-contexts' },
      { title: 'V8: Trash talk (Orinoco GC)', url: 'https://v8.dev/blog/trash-talk' },
    ],
  });

  outline(15, 'applications', 'Event Loop, Tasks and Microtasks', {
    summary: 'Implement the HTML event loop processing model, a minimal Promise, and rendering opportunities.',
    minutes: 210,
    objectives: [
      'Implement task queues, the microtask checkpoint and timers.',
      'Implement a minimal Promise (resolve, reject, then) whose reactions run as microtasks; Lesson 17 completes it to the spec.',
      'Explain where requestAnimationFrame and rendering fit in.',
      'Predict the output ordering of any mix of promises, timers and rAF.',
    ],
    topics: ['Task sources and queues', 'Microtask checkpoint', 'Promise reactions as microtasks', 'Rendering opportunities', 'Timers and clamping', 'requestAnimationFrame', 'Worker event loops (overview)'],
    build: 'python/lesson15/event_loop.py, wired to your interpreter and renderer. If you embedded an engine, your loop drives its job queue at each microtask checkpoint.',
    body: [{ type: 'diagram', id: 'event-loop' }],
    exercises: [
      { id: 'ex-ordering', title: 'Ordering quiz', html: 'Write ten snippets that mix setTimeout, queueMicrotask, Promise.then and rAF. Predict, then verify, their logs in Chrome and in your engine.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: event loop', html: 'Model task queues and the microtask checkpoint in Rust with <code>VecDeque</code>s, and replay your ten ordering snippets as sequences of queued closures.' },
    ],
    references: [
      { title: 'HTML Standard §8.1.7: Event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops' },
      { title: 'Tasks, microtasks, queues and schedules (Archibald)', url: 'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/' },
      { title: 'Web Browser Engineering, ch. 12: Scheduling Tasks and Threads', url: 'https://browser.engineering/scheduling.html' },
    ],
  });

  outline(16, 'applications', 'DOM APIs and Event Propagation', {
    summary: 'Run the page\u2019s scripts, bind your DOM into your JavaScript engine, and dispatch events with capture, target and bubble phases.',
    minutes: 240,
    objectives: [
      'Run inline and external scripts in document order, pausing the parser, then fire DOMContentLoaded and load.',
      'Expose DOM objects, and layout through getBoundingClientRect(), to JavaScript through wrapper bindings.',
      'Implement event dispatch: path computation, the three phases, stopPropagation.',
      'Hit-test the layout tree to target clicks, and run default actions for links and forms.',
    ],
    topics: ['Script loading: blocking, async and defer', 'Bindings and wrappers', 'Event dispatch algorithm', 'Hit testing', 'Default actions: links and forms', 'Focus', 'Passive listeners', 'Shadow DOM (overview)'],
    build: 'python/lesson16/bindings.py: script execution in document order, document.querySelector, addEventListener, getBoundingClientRect, click dispatch, link navigation and form submission in your browser.',
    exercises: [
      { id: 'ex-path', title: 'Event path', html: 'Implement <code>event.composedPath()</code> for a tree without shadow DOM.' },
      { id: 'ex-form', title: 'Submit a form', html: 'Make a <code>&lt;form method="post"&gt;</code> with two text inputs submit itself: build the <code>application/x-www-form-urlencoded</code> body, send it with your Lesson 2 client to the test server\u2019s <code>/anything</code>, and render the response. Then make <code>preventDefault()</code> in a submit listener stop it.' },
    ],
    stretch: [
      { id: 'st-text-input', title: 'Text input', html: 'Make <code>&lt;input&gt;</code> fields editable: focus on click, a caret, typing and Backspace through keyboard events, and the value submitted with the form.' },
      { id: 'st-console', title: 'A debug console', html: 'Add a REPL to your browser window that evaluates JavaScript in the page and prints results and uncaught errors. You will use it constantly from here on.' },
      { id: 'st-rust', title: 'Rust track: event dispatch', html: 'Implement the capture, target and bubble phases in Rust over your arena DOM, with listeners stored as boxed closures.' },
    ],
    references: [
      { title: 'HTML Standard: The script element', url: 'https://html.spec.whatwg.org/multipage/scripting.html#the-script-element' },
      { title: 'DOM Standard §2: Events', url: 'https://dom.spec.whatwg.org/#events' },
      { title: 'UI Events', url: 'https://www.w3.org/TR/uievents/' },
      { title: 'Web Browser Engineering, ch. 7: Handling Buttons and Links', url: 'https://browser.engineering/chrome.html' },
      { title: 'Web Browser Engineering, ch. 8: Sending Information to Servers', url: 'https://browser.engineering/forms.html' },
    ],
  });

  outline(17, 'applications', 'Fetch, Promises and Asynchronous APIs', {
    summary: 'Complete your Promise to the spec, then build fetch() on the http_client.py carried forward since Lesson 2, with network work on a thread that posts tasks back to your event loop.',
    minutes: 150,
    objectives: [
      'Complete Promise resolution to the spec: thenables, promise jobs, unhandled rejections. (If you embedded an engine, drive its job queue, such as QuickJS\u2019s JS_ExecutePendingJob, from your microtask checkpoint instead.)',
      'Explain the Fetch Standard\u2019s request and response model: mode, credentials, redirect.',
      'Integrate network completion with the event loop.',
    ],
    topics: ['Promise jobs', 'Fetch Standard', 'Networking on a worker thread', 'Streams', 'AbortController'],
    build: 'python/lesson17/fetch_api.py: fetch() in your engine, resolved from network tasks through the microtask queue.',
    exercises: [
      { id: 'ex-thenable', title: 'Thenables', html: 'Make <code>resolve(thenable)</code> take exactly two extra microtask ticks, as the spec requires.' },
      { id: 'ex-abort', title: 'Abort a slow fetch', html: 'Fetch the test server\u2019s <code>/drip?duration=5&amp;numbytes=5</code>, abort it after one second with an <code>AbortController</code>, and make the promise reject with an <code>AbortError</code> while the page stays responsive.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: futures', html: 'Write a minimal single-threaded executor for Rust futures (a task queue and a <code>Waker</code>), then compare its scheduling with promise jobs and the microtask queue.' },
    ],
    references: [
      { title: 'Fetch Standard', url: 'https://fetch.spec.whatwg.org/' },
      { title: 'ECMA-262: Promise objects', url: 'https://tc39.es/ecma262/#sec-promise-objects' },
    ],
  });

  outline(18, 'architecture', 'Browser Processes and Threads', {
    summary: 'Why modern browsers are a dozen processes, and how the work is divided between them.',
    minutes: 180,
    objectives: [
      'Describe the browser, renderer, GPU, network and utility processes.',
      'Describe the threads inside a renderer.',
      'Split your own browser into two processes, and survive the renderer crashing.',
    ],
    topics: ['Process model', 'Renderer threads', 'GPU process', 'Network service', 'Process-per-site', 'Why not pickle: never trust the renderer'],
    build: 'python/lesson18/browser.py becomes the browser process: it spawns renderer_process.py with subprocess.Popen and exchanges JSON lines over stdin and stdout. The browser process owns the window and the network; the renderer parses, styles and lays out, and returns display lists. (Not multiprocessing: its default pickle transport would let a compromised renderer run code in the browser process.)',
    body: [{ type: 'diagram', id: 'multi-process' }],
    exercises: [
      { id: 'ex-taskmgr', title: 'Task manager', html: 'Open five tabs across three sites in Chrome. Map every row of the Chrome task manager to the diagram.' },
      { id: 'ex-crash', title: 'Sad tab', html: 'Kill the renderer in the middle of a page load. The browser process must survive, show an error page, and load the next page in a fresh renderer.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: a child process', html: 'Spawn a Rust renderer process with <code>std::process::Command</code> and exchange line-delimited messages with it over stdin and stdout.' },
    ],
    references: [
      { title: 'Chromium: Multi-process Architecture', url: 'https://www.chromium.org/developers/design-documents/multi-process-architecture/' },
      { title: 'Inside look at modern web browser (part 1)', url: 'https://developer.chrome.com/blog/inside-browser-part1' },
    ],
  });

  outline(19, 'architecture', 'Inter-Process Communication', {
    summary: 'Pipes, sockets, shared memory and typed message interfaces such as Mojo.',
    minutes: 150,
    objectives: [
      'Compare IPC mechanisms by latency, throughput and safety.',
      'Design a typed message schema between untrusted and trusted processes.',
      'Move bitmaps between processes with shared memory.',
    ],
    topics: ['Pipes and sockets', 'Shared memory', 'Serialization', 'Mojo interfaces', 'Sync vs async IPC', 'Validating untrusted messages'],
    build: 'python/lesson19/ipc.py: a typed, validated JSON-lines protocol between your processes. Then move rasterization into the renderer, ship finished frames through shared memory, and measure that against shipping display lists.',
    exercises: [
      { id: 'ex-ipc-bench', title: 'IPC benchmark', html: 'Measure round-trip latency and throughput for a pipe versus shared memory with 4 MB frames.' },
      { id: 'ex-fuzz', title: 'Distrust the renderer', html: 'Send your browser process 1,000 random and truncated messages from the renderer side. It must reject every malformed one without crashing: a compromised renderer will send exactly that.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: typed messages', html: 'Define your IPC messages as a Rust <code>enum</code> with a hand-written length-prefixed binary encoding, and make decoding return a <code>Result</code> that rejects every malformed input.' },
    ],
    references: [
      { title: 'Mojo documentation', url: 'https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md' },
      { title: 'Python docs: multiprocessing.shared_memory', url: 'https://docs.python.org/3/library/multiprocessing.shared_memory.html' },
    ],
  });

  outline(20, 'architecture', 'Browser Tabs and Navigation', {
    summary: 'Session history, the navigation algorithm, iframes, and the browser chrome around the page.',
    minutes: 210,
    objectives: [
      'Implement tabs with an address bar, back and forward.',
      'Explain session history entries and the back/forward cache.',
      'Explain same-document navigations (fragments, pushState).',
      'Render a same-origin iframe as a nested navigable with its own document.',
    ],
    topics: ['Navigables and browsing contexts', 'Session history', 'bfcache', 'pushState', 'Nested navigables: <iframe>', 'Address bar heuristics'],
    build: 'python/lesson20/tabs.py: tabs with an address bar, back and forward, and same-origin iframes, in your browser process.',
    exercises: [
      { id: 'ex-bfcache', title: 'bfcache blockers', html: 'Find three things that make a page ineligible for the back/forward cache, and test them in Chrome DevTools.' },
      { id: 'ex-history', title: 'History edge cases', html: 'Navigate A → B → C, go back twice, then navigate to D: the forward entries must be pruned. Then show that a fragment navigation adds a history entry without a network request.' },
      { id: 'ex-iframe', title: 'An iframe', html: 'Render a same-origin <code>&lt;iframe&gt;</code> with its own DOM, style and layout, painted into the parent\u2019s display list at the right offset and clipped to its box.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: session history', html: 'Model session history in Rust (entries, the current index, back, forward, and pruning on a new navigation) with unit tests for every edge case you can think of.' },
    ],
    references: [
      { title: 'HTML Standard §7.4: Navigation and session history', url: 'https://html.spec.whatwg.org/multipage/browsing-the-web.html' },
      { title: 'HTML Standard: The iframe element', url: 'https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element' },
      { title: 'Web Browser Engineering, ch. 15: Supporting Embedded Content', url: 'https://browser.engineering/embeds.html' },
    ],
  });

  outline(21, 'architecture', 'Cookies, Storage and Caching', {
    summary: 'Cookie jars, sites and SameSite, storage partitioning, quotas and the HTTP cache.',
    minutes: 210,
    objectives: [
      'Define a site with the Public Suffix List, and implement a cookie jar per RFC 6265bis, including SameSite.',
      'Explain storage partitioning and third-party cookie restrictions.',
      'Implement an HTTP cache with freshness and revalidation.',
    ],
    topics: ['Cookies', 'Sites and the Public Suffix List', 'SameSite', 'Partitioning (CHIPS)', 'localStorage and IndexedDB', 'HTTP cache', 'Cache keys', 'Service workers and the Cache API (overview)'],
    build: 'python/lesson21/cookies.py and http_cache.py in your network layer, tested against the test server\u2019s /cookies, /cookies/set, /cache/{seconds} and /etag/{etag} routes.',
    exercises: [
      { id: 'ex-cache', title: 'Revalidation', html: 'Show a 304 revalidation flow using ETag against <code>httpbin.org/etag/{etag}</code>, or the test server\u2019s <code>/etag/{etag}</code>.' },
      { id: 'ex-cookie-split', title: 'Cookies are not comma-joined', html: 'Make your Lesson 2 parser hand the cookie jar every <code>Set-Cookie</code> field separately. Show what goes wrong if you join them with commas the way other repeated fields are joined, using a cookie with an <code>Expires</code> date.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: cookie matching', html: 'Implement RFC 6265bis domain-matching and path-matching in Rust, with test cases taken from the spec.' },
    ],
    references: [
      { title: 'RFC 6265bis: Cookies', url: 'https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/' },
      { title: 'RFC 9111: HTTP Caching', url: 'https://www.rfc-editor.org/rfc/rfc9111.html' },
      { title: 'Storage Standard', url: 'https://storage.spec.whatwg.org/' },
      { title: 'Web Browser Engineering, ch. 10: Keeping Data Private', url: 'https://browser.engineering/security.html' },
    ],
  });

  outline(22, 'architecture', 'Same-Origin Policy, CORS and CSP', {
    summary: 'The web\u2019s security model, from the origin concept to response-header policies.',
    minutes: 180,
    objectives: [
      'Define origins and sites precisely, and enforce the same-origin policy.',
      'Implement the CORS protocol, including preflight and credentials.',
      'Enforce a Content Security Policy script-src.',
      'Upgrade requests with HSTS and block mixed content.',
    ],
    topics: ['Origin and site', 'Same-origin policy', 'CORS protocol', 'CSP', 'HSTS', 'Mixed content', 'Trusted Types'],
    build: 'python/lesson22/security.py: same-origin, CORS and CSP checks in your fetch() and script loading, plus HSTS upgrades in your network layer.',
    exercises: [
      { id: 'ex-preflight', title: 'Preflight triggers', html: 'List every condition that triggers a CORS preflight and write one request for each.' },
      { id: 'ex-two-origins', title: 'Two origins on one laptop', html: 'Run the test server on ports 8080 and 8081. Show your <code>fetch()</code> blocking a cross-origin read without <code>Access-Control-Allow-Origin</code> and allowing it with <code>/response-headers?Access-Control-Allow-Origin=*</code>. Then show <code>script-src \'self\'</code> blocking an inline script.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: origins and sites', html: 'Implement same-origin and same-site checks in Rust. Same-site needs the Public Suffix List: embed a small subset and explain why <code>github.io</code> is on it.' },
    ],
    references: [
      { title: 'Fetch Standard: CORS protocol', url: 'https://fetch.spec.whatwg.org/#http-cors-protocol' },
      { title: 'Content Security Policy (editor\u2019s draft)', url: 'https://w3c.github.io/webappsec-csp/' },
      { title: 'RFC 6797: HTTP Strict Transport Security', url: 'https://www.rfc-editor.org/rfc/rfc6797.html' },
      { title: 'Mixed Content', url: 'https://www.w3.org/TR/mixed-content/' },
      { title: 'HTML Standard: Origin', url: 'https://html.spec.whatwg.org/multipage/browsers.html#origin' },
    ],
  });

  outline(23, 'architecture', 'Sandboxing and Site Isolation', {
    summary: 'OS-level sandboxes, Spectre, and why every site gets its own process.',
    minutes: 180,
    objectives: [
      'Explain OS sandbox primitives on Linux, macOS and Windows.',
      'Explain why Spectre made process-per-site necessary.',
      'Explain COOP, COEP, CORP and cross-origin isolation.',
    ],
    topics: ['seccomp-bpf, Seatbelt, restricted tokens', 'Site isolation', 'Out-of-process iframes', 'Spectre', 'ORB', 'COOP / COEP'],
    build: 'python/lesson23/: renderer_process.py runs with reduced privileges, and the browser process starts one renderer per site.',
    exercises: [
      { id: 'ex-coi', title: 'Cross-origin isolation', html: 'Serve a page with COOP and COEP, then confirm <code>self.crossOriginIsolated</code> and SharedArrayBuffer access.' },
      { id: 'ex-prove-sandbox', title: 'Prove the sandbox', html: 'From inside your renderer, show that opening <code>/etc/passwd</code> and calling <code>socket.create_connection</code> both fail, and that two sites get renderers with different PIDs.' },
      { id: 'ex-oopif', title: 'Out-of-process iframes', html: 'Move a cross-site iframe into its own renderer process, with the parent\u2019s renderer and the browser process stitching the two display lists together.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: a sandboxed renderer', html: 'Sandbox your Rust renderer process: on Linux with a seccomp filter (for example the <code>seccompiler</code> crate), on macOS with <code>sandbox_init</code> or a deny-network <code>sandbox-exec</code> profile. Prove it can no longer open a socket or a file.' },
    ],
    references: [
      { title: 'Chromium: Site Isolation', url: 'https://www.chromium.org/Home/chromium-security/site-isolation/' },
      { title: 'Site Isolation (USENIX Security 2019)', url: 'https://www.usenix.org/conference/usenixsecurity19/presentation/reis' },
    ],
  });

  outline(24, 'engineering', 'Performance and the Critical Rendering Path', {
    summary: 'Measure what users feel, and trace your own browser like Chrome traces itself.',
    minutes: 150,
    objectives: [
      'Explain render-blocking resources and the preload scanner.',
      'Define TTFB, FCP, LCP, INP and CLS precisely.',
      'Emit trace events from your browser and view them in Perfetto.',
    ],
    topics: ['Critical rendering path', 'Render-blocking resources', 'Web fonts and font-display', 'Core Web Vitals', 'Tracing'],
    build: 'python/lesson24/trace.py: trace instrumentation in your browser, exported in Chrome trace-event JSON.',
    body: [{ type: 'diagram', id: 'rendering-pipeline' }],
    exercises: [
      { id: 'ex-trace', title: 'Trace a load', html: 'Record a Chrome performance trace of a real site and annotate each phase of the rendering pipeline.' },
      { id: 'ex-trace-own', title: 'Trace your own browser', html: 'Trace your browser loading the test server\u2019s <code>/html</code> page, open it in Perfetto, and compute its first contentful paint from your own events.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: trace events', html: 'Emit Chrome trace-event JSON from your Rust components and load a combined Python-and-Rust trace in Perfetto.' },
    ],
    references: [
      { title: 'web.dev: Critical rendering path', url: 'https://web.dev/articles/critical-rendering-path' },
      { title: 'Largest Contentful Paint', url: 'https://www.w3.org/TR/largest-contentful-paint/' },
      { title: 'Event Timing (INP)', url: 'https://www.w3.org/TR/event-timing/' },
      { title: 'Layout Instability (CLS)', url: 'https://wicg.github.io/layout-instability/' },
      { title: 'Perfetto documentation', url: 'https://perfetto.dev/docs/' },
    ],
  });

  outline(25, 'engineering', 'Layout Invalidation and Repainting', {
    summary: 'Do the minimum work per frame with dirty bits, invalidation sets and damage rectangles.',
    minutes: 150,
    objectives: [
      'Implement dirty-bit incremental layout.',
      'Explain style invalidation sets and forced synchronous layout.',
      'Track paint damage so only changed regions are re-rasterized.',
    ],
    topics: ['Dirty bits', 'Style invalidation', 'Incremental layout', 'Layout thrashing', 'Paint invalidation'],
    build: 'python/lesson25/: incremental style and layout in your engine, with counters proving work was skipped.',
    exercises: [
      { id: 'ex-thrash', title: 'Layout thrashing', html: 'Write a loop that thrashes layout by alternating style writes with <code>getBoundingClientRect()</code> reads, measure it in your browser and in Chrome, then fix it by batching reads and writes.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: dirty bits', html: 'Add dirty bits to your Rust layout, and counters that prove an unrelated change re-lays out nothing else.' },
    ],
    references: [
      { title: 'Web Browser Engineering, ch. 16: Reusing Previous Computations', url: 'https://browser.engineering/invalidation.html' },
      { title: 'Chromium: CSS style invalidation', url: 'https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/css/style-invalidation.md' },
    ],
  });

  outline(26, 'engineering', 'Accessibility Trees', {
    summary: 'Derive an accessibility tree from the DOM and layout, and expose it to assistive technology.',
    minutes: 150,
    objectives: [
      'Compute roles, names and states, including accessible name computation.',
      'Explain the platform accessibility APIs (AX API, UIA, AT-SPI).',
      'Manage focus and keyboard navigation in your browser.',
    ],
    topics: ['Accessibility tree', 'ARIA', 'HTML-to-role mapping (HTML-AAM)', 'Accessible name computation', 'Platform APIs', 'Focus management'],
    build: 'python/lesson26/a11y.py: an accessibility tree for your engine, read aloud with the macOS say command (espeak on Linux).',
    exercises: [
      { id: 'ex-accname', title: 'Accessible names', html: 'Implement the accessible name computation for buttons and links, including aria-labelledby.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: roles and names', html: 'Compute roles and accessible names over your Rust arena DOM and match the Python tree. Exposing it to the OS with AccessKit needs a window, so that waits for Lesson 29.' },
    ],
    references: [
      { title: 'WAI-ARIA 1.2', url: 'https://www.w3.org/TR/wai-aria-1.2/' },
      { title: 'HTML Accessibility API Mappings (HTML-AAM)', url: 'https://www.w3.org/TR/html-aam-1.0/' },
      { title: 'Accessible Name and Description Computation', url: 'https://www.w3.org/TR/accname-1.2/' },
      { title: 'Web Browser Engineering, ch. 14: Making Content Accessible', url: 'https://browser.engineering/accessibility.html' },
    ],
  });

  outline(27, 'engineering', 'Web Platform Tests', {
    summary: 'How browsers measure conformance, and how to run WPT against your own engine.',
    minutes: 150,
    objectives: [
      'Navigate the WPT repository and its test types.',
      'Write testharness.js tests and reftests.',
      'Run a WPT subset against your browser via screenshot comparison.',
    ],
    topics: ['testharness.js', 'Reftests', 'wpt run', 'wpt.fyi'],
    build: 'python/tools/reftest.py (shared tooling, outside your browser): a WPT reftest runner that renders test and reference with your browser and reports a pass rate.',
    exercises: [
      { id: 'ex-wpt', title: 'Read a failure', html: 'Find a WPT test that fails in one major engine on wpt.fyi and explain the cause.' },
      { id: 'ex-run-wpt', title: 'Your pass rate', html: 'Run the <code>css/CSS2/normal-flow</code> reftests against your browser, report the pass rate, and fix the cheapest three failures.' },
      { id: 'ex-parser-rate', title: 'Parser conformance too', html: 'Fold the html5lib runner from Lesson 4 into the same report, so parser and layout conformance sit side by side and you can see both move.' },
    ],
    stretch: [
      { id: 'st-rust', title: 'Rust track: same tests, both engines', html: 'Point your reftest runner at your Rust-track pipeline too (the Lesson 8 layout and Lesson 11 rasterizer stretches), and track both pass rates side by side from now on.' },
    ],
    references: [
      { title: 'web-platform-tests documentation', url: 'https://web-platform-tests.org/' },
      { title: 'wpt.fyi', url: 'https://wpt.fyi/' },
    ],
  });

  outline(28, 'rust', 'Assemble the Engine in Rust', {
    summary: 'Gather your Rust-track pieces into one crate and port whatever is missing, kept honest by parity tests against the Python prototype. A multi-session capstone: about 10 hours if you did the Rust track; if you skipped it, do the Lesson 4, 5 and 8 Rust stretches first and budget about 25.',
    minutes: 600,
    objectives: [
      'Model DOM trees in Rust: arenas and indices versus Rc<RefCell<>>.',
      'Reach a minimum engine: tokenizer, in-body tree construction, CSS parser, cascade without layers, block and inline layout. Flex is a stretch.',
      'Profile and compare the Python and Rust implementations.',
    ],
    topics: ['Ownership and tree structures', 'Arenas', 'Crate and module layout', 'Parity testing', 'Profiling Rust'],
    build: 'rust/engine: a crate whose layout text dumps match the Python engine\u2019s on a shared test corpus.',
    exercises: [
      { id: 'ex-arena', title: 'Arena DOM', html: 'Implement a DOM with an arena and NodeId indices, and compare its ergonomics and performance with <code>Rc&lt;RefCell&lt;Node&gt;&gt;</code>.' },
      { id: 'ex-parity', title: 'A parity harness', html: 'Write one script that runs both engines over every document in your test corpus and reports each one whose layout dump differs, with a diff. Make it part of your routine before every commit.' },
      { id: 'ex-checkpoints', title: 'Three checkpoints', html: 'Make progress visible in three stages: identical token streams, then identical styled trees, then identical layout dumps across the whole corpus. Don\u2019t start a stage until the previous one passes.' },
    ],
    references: [
      { title: 'The Rust Programming Language', url: 'https://doc.rust-lang.org/book/' },
      { title: 'html5ever', url: 'https://github.com/servo/html5ever' },
      { title: 'Taffy (flexbox and grid layout in Rust)', url: 'https://github.com/DioxusLabs/taffy' },
      { title: 'Blitz (a Rust HTML/CSS renderer)', url: 'https://github.com/DioxusLabs/blitz' },
      { title: 'Servo', url: 'https://servo.org/' },
    ],
  });

  outline(29, 'rust', 'Build the Full Desktop Browser', {
    summary: 'Windowing, rendering, text, input and a multi-process shell around your Rust engine: a desktop browser for the static web. A multi-session capstone.',
    minutes: 1200,
    objectives: [
      'Create a native window and draw into it, on the CPU first (softbuffer and tiny-skia), then optionally on the GPU (wgpu).',
      'Render text with real font shaping.',
      'Assemble the tabs, navigation and process model from Part V, and expose the accessibility tree with AccessKit.',
    ],
    topics: ['Windowing (winit)', 'CPU rendering (softbuffer, tiny-skia)', 'GPU rendering (wgpu)', 'Text (shaping and rasterization)', 'TLS (rustls)', 'Input', 'Browser chrome', 'Accessibility (AccessKit)'],
    build: 'A desktop browser that renders a fixed corpus of static pages (no JavaScript) at parity with the Python engine, fetching them over TLS with rustls.',
    exercises: [
      { id: 'ex-daily', title: 'Daily driver (static web)', html: 'Browse your corpus plus three real static sites. List everything that breaks, ranked by how often you hit it, and fix the top three.' },
    ],
    stretch: [
      { id: 'st-js', title: 'JavaScript in Rust', html: 'Embed Boa or rquickjs and port your Part IV bindings and event loop, so that pages with scripts (one day, this course app itself) can run.' },
    ],
    references: [
      { title: 'winit', url: 'https://github.com/rust-windowing/winit' },
      { title: 'softbuffer', url: 'https://github.com/rust-windowing/softbuffer' },
      { title: 'tiny-skia', url: 'https://github.com/linebender/tiny-skia' },
      { title: 'wgpu', url: 'https://wgpu.rs/' },
      { title: 'Parley (text layout)', url: 'https://github.com/linebender/parley' },
      { title: 'rustls', url: 'https://github.com/rustls/rustls' },
      { title: 'AccessKit', url: 'https://github.com/AccessKit/accesskit' },
      { title: 'Boa (JavaScript in Rust)', url: 'https://boajs.dev/' },
      { title: 'Ladybird', url: 'https://ladybird.org/' },
    ],
  });

  outline(30, 'rust', 'Benchmark Against Chromium', {
    summary: 'Benchmark rigorously, compare against a production engine phase by phase, and decide what to optimize next.',
    minutes: 240,
    objectives: [
      'Design benchmarks with sound statistics and controlled noise.',
      'Design workloads both engines can run (parse, style, layout and paint of your corpus) and compare per-phase traces with Chromium on the same documents.',
      'Write an engineering report on where your browser loses, and why.',
    ],
    topics: ['Benchmark methodology', 'Per-phase workloads', 'Statistical rigor', 'Trace comparison', 'Speedometer, MotionMark, JetStream (for context)'],
    build: 'A benchmark harness and report comparing your engine with Chromium.',
    exercises: [
      { id: 'ex-report', title: 'The report', html: 'Write a two-page performance report with at least three traced comparisons.' },
    ],
    references: [
      { title: 'BrowserBench', url: 'https://browserbench.org/' },
      { title: 'Crossbench (Chromium)', url: 'https://chromium.googlesource.com/crossbench/' },
    ],
  });

  window.COURSE = COURSE;
})();
