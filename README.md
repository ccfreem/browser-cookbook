# The Browser Cookbook

*Build a browser from the wire to the window.*

A personal, long-running engineering course for building a web browser from scratch: first as Python prototypes, then as a Rust engine, then as a full desktop browser. This repo holds both halves:

```
browser-cookbook/
├── docs/                  The course app (static site, served by GitHub Pages)
│   ├── index.html         Shell: app bar, sidebar, main outlet
│   ├── styles.css         All styles, light + dark themes
│   ├── lessons.js         Course content: parts, milestones, diagrams, lessons (data only)
│   ├── diagrams.js        Diagram renderers (sequence, pipeline, url, tree, boxes)
│   ├── highlight.js       Tiny syntax highlighter (python, rust, shell, http, json)
│   ├── app.js             State, routing, views, progress, notes, export/import
│   └── .nojekyll          Tells GitHub Pages to serve files as-is
├── python/                Your Python browser implementation, one folder per lesson
│   ├── lesson01/          url_inspector.py, fetch.py, test_lesson01.py
│   ├── lesson02/          http_client.py, test_http_client.py
│   └── tools/             testserver.py: an offline httpbin with HTTP/1.1 framing cases
├── rust/                  Rust work: previews and Rust-track exercises, then the real engine in Part VII
│   └── lesson01-preview/
└── scripts/
    └── check_course.js    Validates lessons.js and keeps code snippets in sync with python/ and rust/
```

The app is plain HTML, CSS and JavaScript. There are no frameworks, no build step, no backend and no dependencies.

## The course at a glance

Thirty lessons in seven parts. Lessons 1 and 2 are written in full; the rest are outlines (objectives, topics, a build target, exercises and references) that get promoted to full lessons one at a time.

| Part | Lessons | You build |
| --- | --- | --- |
| I. Understanding the network | 1–3 | A URL inspector, a raw-socket HTTP/1.1 client, a DNS resolver |
| II. Understanding documents | 4–7 | An HTML parser, a DOM, a CSS parser and the cascade |
| III. Understanding pixels | 8–12 | `browser.py`: layout, painting, a rasterizer and a compositor, in a Tkinter window |
| IV. Understanding applications | 13–17 | A JavaScript interpreter (or an embedded engine), the event loop, scripts, DOM events and fetch() |
| V. Understanding browser architecture | 18–23 | Processes, IPC, tabs and iframes, cookies and caching, the security model |
| VI. Performance, accessibility and compatibility | 24–27 | Tracing, incremental layout, an accessibility tree, WPT |
| VII. Shipping it in Rust | 28–30 | The engine in Rust, a desktop browser for the static web, a benchmark report |

Rust runs alongside Python the whole way as an optional **Rust track**: most lessons end with a stretch challenge that ports that lesson's core piece to Rust. Lesson 28 then assembles those pieces. If you skipped the track, Lesson 28 starts with the Lesson 4, 5 and 8 Rust stretches and takes about 25 hours instead of 10. Part VII renders the static web; running JavaScript in the Rust browser is a stretch challenge in Lesson 29.

Each lesson's `minutes` covers reading, the experiments and the build target. Exercises and stretch challenges are extra, often as much again.

## Requirements

- **Python 3.11 or newer.** Parts I and II use only the standard library. (3.10 is end-of-life, and urllib only follows 308 redirects from 3.11.)
- **Tkinter, from Lesson 8.** Check with `python3 -m tkinter`. Homebrew's Python ships without it: `brew install python-tk@3.14` (match `python3 --version`). On Debian or Ubuntu, `apt install python3-tk`.
- **OpenSSL 3.5+ for the TLS observations.** On macOS, `/usr/bin/openssl` is LibreSSL, which rejects `-brief` and can't negotiate post-quantum key exchange: `brew install openssl@3` and put it first on your `PATH`.
- **Rust**, for the previews, the Rust track and Part VII: install with [rustup](https://rustup.rs).
- `dig`, `curl`, `nc` and (optionally) `tcpdump` for watching the wire.

A GitHub Codespace covers Parts I and II. It has no display, so Part III's windows need a local machine, or the `desktop-lite` dev container feature.

## Running locally

**Option 1: open the file.** Double-click `docs/index.html`, or run:

```sh
open docs/index.html        # macOS
xdg-open docs/index.html    # Linux
```

Everything works from `file://`: the scripts are classic scripts (not ES modules), so the browser doesn't block them. The one exception is the clipboard API, which some browsers restrict on `file://`; the app falls back to a legacy copy method.

**Option 2: a local static server.** This matches production more closely, and lets you open the course on your phone over the LAN:

```sh
python3 -m http.server 8000 --directory docs
# then visit http://localhost:8000  (or http://<your-laptop-ip>:8000 from your phone)
```

**Running the course code.** The browser never executes Python or Rust. Run everything from the repo root in a terminal or a Codespace:

```sh
python3 python/lesson01/url_inspector.py https://example.com
python3 python/lesson01/fetch.py https://httpbin.org/redirect/3
python3 python/lesson02/http_client.py -v https://example.com
cargo run --manifest-path rust/lesson01-preview/Cargo.toml   # needs rustup
```

**The test server.** httpbin.org is sometimes slow or down, and Lesson 2 needs responses it can't produce. `python/tools/testserver.py` serves the httpbin routes the course uses (`/get`, `/headers`, `/ip`, `/anything`, `/status`, `/redirect`, `/redirect-to`, `/delay`, `/drip`, `/bytes`, `/gzip`, `/etag`, `/cookies`, `/cache`, `/response-headers`), a small `/html` page for the parser lessons, plus framing cases: `/chunked`, `/trailers`, `/close`, `/early-hints` and `/raw`, which echoes back the exact bytes you sent. Its docstring lists every route. It listens on 127.0.0.1 only. Run it in a second terminal and swap `https://httpbin.org` for `http://localhost:8080`:

```sh
python3 python/tools/testserver.py                     # http://localhost:8080
python3 python/lesson01/fetch.py http://localhost:8080/redirect/3
```

**The tests.** Each lesson folder with code has a `test_*.py` file. The tests are offline: they start a private copy of the test server on a free port.

```sh
python3 -m unittest discover -s python/lesson01 -v
python3 -m unittest discover -s python/lesson02 -v
```

## Working through a lesson

1. Read the lesson in the app and step through its diagrams.
2. Run the experiments in a terminal, compare with the expected output, and tick them off.
3. Run the lesson's tests, then do the exercises, adding tests as you go.
4. Put questions, surprises and commands that worked in the lesson's notes.
5. Commit, then **Mark lesson complete**. Tagging the commit (`git tag lesson-02`) makes it easy to diff your progress later.

Expected outputs were captured on a real network in November 2026. Dates, timings, CDN headers and addresses will differ on your machine; the structure shouldn't.

### How code carries forward

Each lesson's code lives in its own folder, and **every folder is a complete, runnable snapshot**. When a lesson builds on earlier code (from Lesson 3 onward, nearly all of them do), start by copying the previous lesson's folder:

```sh
cp -R python/lesson04 python/lesson05
```

Nothing imports across lesson folders, so a later lesson can never break an earlier one, and `diff -ru python/lesson04 python/lesson05` shows exactly what a lesson changed. Lessons 1 and 2 are the exceptions: Lesson 2 deliberately starts over, because its whole point is deleting urllib.

Shared tooling that isn't part of your browser lives in `python/tools/`.

Rust works differently, because Cargo makes sharing code between crates easy: keep the Rust track in one workspace, `rust/track/`, with a crate per subsystem (`dns`, `html`, `dom`, `css`, `layout`, …), and tag commits per lesson as you go. Lesson 28 turns that workspace into `rust/engine`.

## Adding a lesson

All content lives in `docs/lessons.js`. The UI renders whatever is there, so adding Lesson 31 never means touching `app.js`. After any content change, run the checker:

```sh
node scripts/check_course.js            # errors exit 1; warnings don't
node scripts/check_course.js --write    # also copy changed python/ and rust/ files into their snippets
```

It checks the content model (IDs, prerequisites, milestones, diagram and snippet references, table shapes, unbalanced or unescaped HTML), that commands only mention files that exist, and that code shown in a lesson still matches the code on disk.

### 1. Add the lesson object

Append to `COURSE.lessons`. The quickest path is the `outline()` helper:

```js
outline(31, 'engineering', 'Writing a WebAssembly Interpreter', {
  summary: 'Decode the binary format and run a stack machine.',
  minutes: 180,
  objectives: ['Decode Wasm modules', 'Implement the operand stack'],
  topics: ['Binary format', 'Validation', 'Stack machine'],
  build: 'python/lesson31/wasm.py',
  exercises: [{ id: 'ex-decode', title: 'Decode a module', html: 'Decode <code>add.wasm</code> by hand.' }],
  references: [{ title: 'WebAssembly Core Specification', url: 'https://webassembly.github.io/spec/core/' }],
});
```

Lessons are ordered by `number`, which must run 1..N without gaps. Prerequisites default to the previous lesson; to override, set `prerequisites: ['l28', 'l13']`. Add the new id to a milestone in `COURSE.milestones` too, or the checker will warn.

### 2. Promote it to a full lesson

A full lesson (like Lessons 1 and 2) has `status: 'ready'` and these optional fields:

| Field | Shape | Rendered as |
| --- | --- | --- |
| `objectives` | `string[]` | Learning objectives checklist |
| `build` | `string` | "What you will build" box |
| `body` | `Block[]` (see below) | The main text |
| `snippets` | `{ [id]: { lang, file?, source?, title?, code } }` | Code referenced by `body` and `experiments` |
| `experiments` | `{ id, title, lang, summary, snippet? or code?/file?, commands[], output, observe[] }[]` | Experiment cards, also shown in the Playground |
| `exercises` | `{ id, title, html }[]` | Checkable exercises |
| `stretch` | `{ id, title, html }[]` | Checkable stretch challenges (Rust-track ones have ids starting `st-rust` and titles starting "Rust track") |
| `takeaways` | `string[]` | Key takeaways |
| `references` | `{ title, url }[]` | Links to authoritative docs |

**Snippets.** A snippet with `file` is a complete copy of that file, and `--write` keeps it in sync. A snippet with `source` is an excerpt that must appear verbatim in that file; the checker warns when it doesn't. Use excerpts to walk through code piece by piece, then show the whole file once with `file`. The code header shows `file` if there is one, otherwise `title`. A new full-file snippet can start as a placeholder, as long as it is a `String.raw` template containing text that appears nowhere else in `lessons.js`: `--write` replaces it.

**Body blocks:**

```js
{ type: 'h2', id: 'dns', text: 'DNS: names to addresses' }   // appears in the Contents menu
{ type: 'h3', text: 'Part 1' }
{ type: 'p', html: 'Prose with <code>inline code</code>.' }
{ type: 'list', ordered: false, items: ['html', 'html'] }
{ type: 'callout', tone: 'note' | 'warn' | 'deep', title: 'Title', html: '<p>…</p>' }
{ type: 'definitions', items: [['term', 'html description']] }
{ type: 'table', head: ['A', 'B'], rows: [['html', 'html']], caption: 'text' }
{ type: 'code', snippet: 'fetch' }                         // or inline: { type: 'code', lang, file, code }
{ type: 'terminal', title: 'text', commands: ['…'], output: '…' }
{ type: 'diagram', id: 'tcp-handshake' }
{ type: 'html', html: '…' }                                 // escape hatch
```

Section `id`s must not collide with the built-in sections: `objectives`, `plan`, `experiments`, `exercises`, `stretch`, `takeaways`, `references`, `notes` and `complete`.

**Escaping rules.** All of `lessons.js` is trusted author content. Prose fields (`html`, list `items`, table cells, definition descriptions, `observe`) accept inline HTML, so a literal tag inside `<code>` must be written `&lt;b&gt;`. Titles, labels, captions, commands, output and code are always escaped. Write code with `String.raw` so backslashes survive, and keep backticks and `${` out of code samples (spell a backtick as `chr(96)` in Python).

**IDs matter.** Progress is keyed by `lessonId/kind/taskId` (for example `l01/exercise/ex-idna`). Renaming a lesson, exercise or experiment `id` orphans any saved progress for it, so pick IDs once and keep them. Titles, text and the `part` a lesson belongs to can change freely.

### 3. Add a diagram (optional)

Add an entry to `COURSE.diagrams` and reference it from any lesson body. There are five types:

| Type | Data | Good for |
| --- | --- | --- |
| `sequence` | `actors[]`, `steps[]` of `{ from, to, label, detail, dashed }` or `{ note, label, detail }` | Protocol handshakes |
| `pipeline` | `stages[]` of `{ label, sub, detail }` | Processing pipelines, ordered rules |
| `url` | `parts[]` of `{ text, label?, detail? }` | Annotated strings: URLs, request bytes, chunked bodies |
| `tree` | `nodes[]` of `{ depth, label, kind, detail }` in preorder | DOM, layout trees |
| `boxes` | `groups[]` of `{ label, sub, items[] }` | Architecture |

Every diagram needs a `title`; its optional `caption` is shown before you start stepping, and each step then shows its own `detail`. Tree nodes take a `kind` of `doc`, `element`, `text` or `meta`, which sets their colour, and box items are `{ label, detail }`. Sequence diagrams use a 360-unit-wide viewBox, so keep actor names to about 8 characters; the checker warns when an arrow label would run outside the diagram.

### 4. Add milestones or parts

`COURSE.parts` drives the dashboard's part sections (seven today), and `COURSE.milestones` (each a list of lesson IDs) drives milestone tracking. A new part needs an `id`, `numeral`, `title` and `summary` (a `tagline` is optional and not currently displayed); lessons join it through their `part` field. Every lesson should belong to exactly one milestone.

## How progress persistence works

Everything is stored in `localStorage` under one key, `browser-cookbook:v1`, as JSON:

```json
{
  "version": 1,
  "currentLesson": "l02",
  "completedLessons":   { "l01": "2026-11-14T17:02:11.000Z" },
  "completedExercises": { "l01/exercise/ex-idna": "…", "l01/experiment/exp-404": "…" },
  "notes":              { "l01": { "text": "…", "updatedAt": "…" } },
  "theme": "auto",
  "updatedAt": "…"
}
```

- **Current lesson** is the last *incomplete* lesson you opened. Completing a lesson moves it to the next incomplete one, and re-reading a finished lesson doesn't move it.
- **Course completion** is completed lessons divided by total lessons. Exercises and experiments are tracked and shown separately.
- **Notes** autosave 400 ms after you stop typing, and again when the page is hidden or closed.
- Two open tabs stay in sync through the `storage` event.
- Every load and every import is validated: unknown fields are dropped, keys are pattern-checked, and notes are capped at 50,000 characters each.

`localStorage` is per-origin. `file:///…/index.html`, `http://localhost:8000` and your GitHub Pages URL each have **separate** progress. Pick one as your home, and use export/import to move between them. Safari may also evict storage for sites you haven't visited in a long while, which is another reason to export now and then.

## Transferring progress between devices

1. On the source device, open **Progress & backup** (tap the percentage in the top bar).
2. Choose **Download JSON** (on iPhone, Safari saves it to Files or offers the share sheet, depending on the iOS version), or **Copy JSON** and paste it somewhere you can reach from the other device.
3. On the target device, open **Progress & backup** → **Choose a JSON file**, or paste the JSON and tap **Import pasted JSON**.
4. Confirm. The import **replaces** progress on that device; it does not merge.

The export is a small JSON file (`{ "app": "browser-cookbook", "version": 1, "exportedAt": …, "progress": { … } }`), so it's safe to commit to a private repo if you want versioned backups. It contains your notes, so be careful about committing it anywhere public.

## Deploying to GitHub Pages

The app lives in `docs/`, which GitHub Pages can serve directly. No Actions workflow is needed.

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**, **Branch: `main`**, **Folder: `/docs`**, then save.
4. After a minute the course is live at `https://<user>.github.io/<repo>/`.

All asset paths are relative, so a project subpath works without any changes. `docs/.nojekyll` stops Jekyll from processing the folder.

**Other static hosts:**

- **Cloudflare Pages**: no build command; output directory `docs`.
- **Netlify**: no build command; publish directory `docs` (or drag the `docs` folder onto the Netlify dashboard).

**On iPhone**, open the deployed URL in Safari and use **Share → Add to Home Screen** for a full-screen, app-like reading experience. Home-screen apps have their own storage, separate from Safari's, so export and import once if you've already made progress in Safari.

## Design notes

- Mobile first: the reading column is about 42rem, code blocks and wide tables scroll horizontally, figures go full-bleed on phones, primary controls are 40–44px tall (small chips and Copy buttons 32–36px), and form fields use 16px text so iOS doesn't zoom on focus.
- Dark mode follows the system by default; the button in the top bar cycles Auto → Light → Dark.
- The four scripts load in order (`lessons.js`, `highlight.js`, `diagrams.js`, `app.js`), sharing a few `window` globals (`COURSE`, `Highlight`, `Diagrams`) so nothing needs a module loader.
