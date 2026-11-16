#!/usr/bin/env node
/*
 * Validates docs/lessons.js against the content model in README.md. No dependencies.
 *
 *   node scripts/check_course.js           report problems; exits 1 if there are errors
 *   node scripts/check_course.js --write   also copy changed python/ and rust/ files into their snippets
 *
 * Snippets that differ from the file on disk are warnings, not errors: once you start
 * the exercises, your copy of the code is supposed to diverge from the lesson's.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const LESSONS_FILE = path.join(ROOT, 'docs', 'lessons.js');
const WRITE = process.argv.includes('--write');

const KEY = /^[\w-]+(?:\/[\w-]+)*$/; // must match isKey() in docs/app.js, along with the length limit
const KEY_MAX = 200;
const isKey = function (key) { return key.length <= KEY_MAX && KEY.test(key); };
const BLOCK_TYPES = new Set(['h2', 'h3', 'p', 'list', 'callout', 'definitions', 'table', 'code', 'terminal', 'diagram', 'html']);
const RESERVED_SECTIONS = new Set(['objectives', 'plan', 'experiments', 'exercises', 'stretch', 'takeaways', 'references', 'notes', 'complete']);
const LANGS = new Set(['python', 'rust', 'shell', 'bash', 'sh', 'http', 'json', 'text']);
const CALLOUT_TONES = new Set(['note', 'warn', 'deep']);
const INLINE_TAGS = ['a', 'b', 'code', 'em', 'kbd', 'p', 'strong', 'sub', 'sup'];

const errors = [];
const warnings = [];
const error = function (where, msg) { errors.push(where + ': ' + msg); };
const warn = function (where, msg) { warnings.push(where + ': ' + msg); };

function loadCourse(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: LESSONS_FILE });
  return sandbox.window.COURSE;
}

function checkHtml(where, html) {
  if (typeof html !== 'string') { error(where, 'expected an HTML string'); return; }
  INLINE_TAGS.forEach(function (tag) {
    const open = (html.match(new RegExp('<' + tag + '(?:\\s[^>]*)?>', 'g')) || []).length;
    const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (open !== close) error(where, '<' + tag + '> opened ' + open + ' times but closed ' + close + ' times');
  });
  (html.match(/<code>[\s\S]*?<\/code>/g) || []).forEach(function (span) {
    if (/<[a-zA-Z/]/.test(span.slice(6, -7))) error(where, 'raw tag inside ' + span + ': escape < as &lt;');
  });
  (html.match(/<a\s[^>]*>/g) || []).forEach(function (a) {
    if (/target="_blank"/.test(a) && !/rel="noopener/.test(a)) warn(where, 'external link without rel="noopener"');
  });
}

function unique(where, items, label) {
  const seen = new Set();
  items.forEach(function (id) {
    if (seen.has(id)) error(where, 'duplicate ' + label + ' "' + id + '"');
    seen.add(id);
  });
}

function checkRepoPaths(where, text) {
  (text.match(/\b(?:python|rust)\/[\w./-]+\.(?:py|toml|rs)\b/g) || []).forEach(function (p) {
    if (!fs.existsSync(path.join(ROOT, p))) error(where, 'command refers to missing file ' + p);
  });
}

function checkDiagram(id, d) {
  const where = 'diagram ' + id;
  if (!d.title) error(where, 'missing title');
  switch (d.type) {
    case 'sequence': {
      // Same geometry as renderSequence() in docs/diagrams.js: a 360-unit viewBox, 10px mono labels.
      const n = d.actors.length;
      const pad = n <= 2 ? 70 : n === 3 ? 50 : 32;
      const gap = n > 1 ? (360 - 2 * pad) / (n - 1) : 0;
      const x = function (i) { return n === 1 ? 180 : pad + i * gap; };
      d.actors.forEach(function (a) { if (a.length * 10.5 * 0.56 > Math.min(84, gap - 4)) warn(where, 'actor "' + a + '" is wider than its box'); });
      d.steps.forEach(function (s, i) {
        const at = where + ' step ' + (i + 1);
        if (!s.label) error(at, 'missing label');
        if (s.note !== undefined) {
          if (!(s.note >= 0 && s.note < n)) error(at, 'note actor out of range');
        } else {
          if (!(s.from >= 0 && s.from < n && s.to >= 0 && s.to < n)) error(at, 'from/to out of range');
          if (s.from === s.to) error(at, 'arrow from an actor to itself');
          const mid = (x(s.from) + x(s.to)) / 2;
          const half = (s.label || '').length * 10 * 0.6 / 2;
          if (mid - half < 0 || mid + half > 360) warn(at, 'label "' + s.label + '" runs outside the diagram');
        }
        if (!s.detail) warn(at, 'no detail caption');
      });
      break;
    }
    case 'pipeline':
      d.stages.forEach(function (s, i) { if (!s.label) error(where + ' stage ' + (i + 1), 'missing label'); });
      break;
    case 'url':
      if (!d.parts.some(function (p) { return p.label; })) error(where, 'no labelled parts');
      break;
    case 'tree': {
      let prev = -1;
      d.nodes.forEach(function (n, i) {
        if (n.depth > prev + 1) error(where + ' node ' + (i + 1), 'depth jumps from ' + prev + ' to ' + n.depth);
        prev = n.depth;
      });
      break;
    }
    case 'boxes':
      d.groups.forEach(function (g) { if (!g.items || !g.items.length) error(where, 'group "' + g.label + '" has no items'); });
      break;
    default:
      error(where, 'unknown type "' + d.type + '"');
  }
}

function checkBlock(lesson, block, i, usedDiagrams, h2s) {
  const where = lesson.id + ' body[' + i + '] (' + block.type + ')';
  if (!BLOCK_TYPES.has(block.type)) { error(where, 'unknown block type'); return; }
  switch (block.type) {
    case 'h2':
      if (!block.id || !KEY.test(block.id)) error(where, 'h2 needs an id made of letters, digits, _ or -');
      if (RESERVED_SECTIONS.has(block.id)) error(where, 'h2 id "' + block.id + '" collides with a built-in section');
      h2s.push(block.id);
      break;
    case 'p': case 'html': checkHtml(where, block.html); break;
    case 'list': block.items.forEach(function (item, j) { checkHtml(where + ' item ' + j, item); }); break;
    case 'callout':
      if (!CALLOUT_TONES.has(block.tone || 'note')) error(where, 'unknown tone "' + block.tone + '"');
      checkHtml(where, block.html);
      if (!/^\s*<p>/.test(block.html)) warn(where, 'callout html should be wrapped in <p>');
      break;
    case 'definitions': block.items.forEach(function (pair) { checkHtml(where + ' ' + pair[0], pair[1]); }); break;
    case 'table':
      block.rows.forEach(function (row, j) {
        if (block.head && row.length !== block.head.length) error(where, 'row ' + j + ' has ' + row.length + ' cells, head has ' + block.head.length);
        row.forEach(function (cell) { checkHtml(where + ' row ' + j, cell); });
      });
      break;
    case 'code':
      if (block.snippet && !(lesson.snippets || {})[block.snippet]) error(where, 'unknown snippet "' + block.snippet + '"');
      if (!block.snippet && !block.code) error(where, 'needs snippet or code');
      break;
    case 'terminal':
      if (!block.commands || !block.commands.length) error(where, 'no commands');
      (block.commands || []).forEach(function (c) { checkRepoPaths(where, c); });
      break;
    case 'diagram':
      usedDiagrams.add(block.id);
      break;
    default:
      break;
  }
}

function checkCourse(COURSE) {
  const lessons = COURSE.lessons.slice().sort(function (a, b) { return a.number - b.number; });
  const lessonIds = new Set(lessons.map(function (l) { return l.id; }));
  const partIds = new Set(COURSE.parts.map(function (p) { return p.id; }));
  const usedDiagrams = new Set();

  unique('parts', COURSE.parts.map(function (p) { return p.id; }), 'part id');
  COURSE.parts.forEach(function (p) {
    ['numeral', 'title', 'summary'].forEach(function (k) { if (!p[k]) error('part ' + p.id, 'missing ' + k); });
    if (!lessons.some(function (l) { return l.part === p.id; })) warn('part ' + p.id, 'has no lessons');
  });

  unique('lessons', lessons.map(function (l) { return l.id; }), 'lesson id');
  lessons.forEach(function (lesson, i) {
    const where = lesson.id || ('lesson #' + i);
    if (lesson.number !== i + 1) error(where, 'lesson numbers must run 1..N without gaps (found ' + lesson.number + ')');
    if (lesson.id !== 'l' + String(lesson.number).padStart(2, '0')) warn(where, 'id does not follow the lNN convention');
    if (!partIds.has(lesson.part)) error(where, 'unknown part "' + lesson.part + '"');
    if (['ready', 'outline'].indexOf(lesson.status) === -1) error(where, 'status must be "ready" or "outline"');
    ['title', 'summary'].forEach(function (k) { if (!lesson[k]) error(where, 'missing ' + k); });
    if (!(lesson.minutes > 0)) error(where, 'minutes must be a positive number');
    (lesson.prerequisites || []).forEach(function (id) {
      if (!lessonIds.has(id)) error(where, 'unknown prerequisite "' + id + '"');
      else if (lessons.find(function (l) { return l.id === id; }).number >= lesson.number) error(where, 'prerequisite ' + id + ' is not an earlier lesson');
    });
    if (!(lesson.objectives || []).length) warn(where, 'no objectives');
    if (lesson.status === 'outline' && !(lesson.topics || []).length) warn(where, 'outline has no topics');

    const snippets = lesson.snippets || {};
    Object.keys(snippets).forEach(function (id) {
      const s = snippets[id];
      if (!LANGS.has(s.lang)) error(where + ' snippet ' + id, 'unknown lang "' + s.lang + '"');
      if (typeof s.code !== 'string' || !s.code.trim()) error(where + ' snippet ' + id, 'empty code');
    });

    const h2s = [];
    (lesson.body || []).forEach(function (b, j) {
      try {
        checkBlock(lesson, b, j, usedDiagrams, h2s);
      } catch (e) {
        error(where + ' body[' + j + ']', 'malformed ' + (b && b.type) + ' block (' + e.message + ')');
      }
    });
    unique(where, h2s, 'section id');
    if (lesson.status === 'ready' && !h2s.length) warn(where, 'ready lesson has no h2 sections');

    const experiments = lesson.experiments || [];
    unique(where, experiments.map(function (e) { return e.id; }), 'experiment id');
    experiments.forEach(function (e) {
      const at = where + ' experiment ' + e.id;
      if (!isKey(lesson.id + '/experiment/' + e.id)) error(at, 'id makes an invalid progress key');
      if (!e.title || !e.summary) error(at, 'needs title and summary');
      if (!LANGS.has(e.lang || 'shell')) error(at, 'unknown lang "' + e.lang + '"');
      if (e.snippet && !snippets[e.snippet]) error(at, 'unknown snippet "' + e.snippet + '"');
      if (!(e.commands || []).length) error(at, 'no commands');
      (e.commands || []).forEach(function (c) { checkRepoPaths(at, c); });
      (e.observe || []).forEach(function (o, j) { checkHtml(at + ' observe ' + j, o); });
    });

    [['exercise', lesson.exercises || []], ['stretch', lesson.stretch || []]].forEach(function (pair) {
      unique(where, pair[1].map(function (t) { return t.id; }), pair[0] + ' id');
      pair[1].forEach(function (t) {
        const at = where + ' ' + pair[0] + ' ' + t.id;
        if (!isKey(lesson.id + '/' + pair[0] + '/' + t.id)) error(at, 'id makes an invalid progress key');
        if (!t.title) error(at, 'missing title');
        if (pair[0] === 'stretch' && /^Rust track/.test(t.title || '') !== /^st-rust/.test(t.id)) {
          warn(at, 'Rust-track stretch challenges have ids starting "st-rust" and titles starting "Rust track"');
        }
        checkHtml(at, t.html);
      });
    });

    (lesson.references || []).forEach(function (r) {
      try {
        const u = new URL(r.url);
        if (u.protocol !== 'https:') warn(where, 'reference is not https: ' + r.url);
      } catch (e) { error(where, 'invalid reference URL ' + r.url); }
      if (!r.title) error(where, 'reference without a title: ' + r.url);
    });
  });

  unique('milestones', COURSE.milestones.map(function (m) { return m.id; }), 'milestone id');
  const inMilestone = new Map();
  COURSE.milestones.forEach(function (m) {
    m.lessons.forEach(function (id) {
      if (!lessonIds.has(id)) error('milestone ' + m.id, 'unknown lesson "' + id + '"');
      if (inMilestone.has(id)) error('milestone ' + m.id, id + ' is already in ' + inMilestone.get(id));
      inMilestone.set(id, m.id);
    });
  });
  lessons.forEach(function (l) { if (!inMilestone.has(l.id)) warn(l.id, 'not in any milestone'); });

  (COURSE.environments || []).forEach(function (env) {
    checkHtml('environment ' + env.id, env.html);
    (env.commands || []).forEach(function (c) { checkRepoPaths('environment ' + env.id, c); });
  });

  Object.keys(COURSE.diagrams).forEach(function (id) {
    checkDiagram(id, COURSE.diagrams[id]);
    if (!usedDiagrams.has(id)) warn('diagram ' + id, 'defined but never used');
  });
  usedDiagrams.forEach(function (id) { if (!COURSE.diagrams[id]) error('diagrams', 'lesson uses missing diagram "' + id + '"'); });

  return lessons;
}

function readRepoFile(where, rel) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { error(where, 'file ' + rel + ' does not exist'); return null; }
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '');
}

/*
 * A snippet with `file` is a complete copy of that file; --write can sync it.
 * A snippet with `source` is an excerpt, which must appear verbatim somewhere in that file.
 */
function checkSnippetFiles(lessons, source) {
  let changed = 0;
  lessons.forEach(function (lesson) {
    Object.keys(lesson.snippets || {}).forEach(function (id) {
      const s = lesson.snippets[id];
      const where = lesson.id + ' snippet ' + id;
      if (s.source) {
        const text = readRepoFile(where, s.source);
        if (text !== null && text.indexOf(s.code.replace(/\s+$/, '')) === -1) {
          warn(where, 'excerpt no longer appears verbatim in ' + s.source);
        }
      }
      if (!s.file) return;
      const onDisk = readRepoFile(where, s.file);
      if (onDisk === null) return;
      const inLesson = s.code.replace(/\s+$/, '');
      if (onDisk === inLesson) return;
      if (!WRITE) { warn(where, s.file + ' differs from the copy in lessons.js (run with --write to sync)'); return; }
      if (onDisk.indexOf('`') !== -1 || onDisk.indexOf('${') !== -1 || onDisk.endsWith('\\')) {
        error(where, s.file + ' contains a backtick or "${", or ends with a backslash; none of these can live inside String.raw');
        return;
      }
      const at = source.indexOf(inLesson);
      if (at === -1 || source.indexOf(inLesson, at + 1) !== -1) {
        error(where, 'could not find a unique copy of this snippet in lessons.js to replace');
        return;
      }
      source = source.slice(0, at) + onDisk + source.slice(at + inLesson.length);
      changed++;
      console.log('synced ' + s.file + ' -> ' + where);
    });
  });
  return { source: source, changed: changed };
}

const original = fs.readFileSync(LESSONS_FILE, 'utf8');
let course;
try {
  course = loadCourse(original);
} catch (e) {
  console.log('error    docs/lessons.js does not run: ' + e.message);
  process.exit(1);
}
const lessons = checkCourse(course);
const sync = checkSnippetFiles(lessons, original);
if (WRITE && sync.changed) {
  try {
    loadCourse(sync.source);
    fs.writeFileSync(LESSONS_FILE, sync.source);
  } catch (e) {
    error('--write', 'syncing would break lessons.js (' + e.message + '), so nothing was written. Is a placeholder a String.raw template with unique text?');
  }
}

warnings.forEach(function (w) { console.log('warning  ' + w); });
errors.forEach(function (e) { console.log('error    ' + e); });
const total = lessons.length;
const ready = lessons.filter(function (l) { return l.status === 'ready'; }).length;
console.log('\n' + total + ' lessons (' + ready + ' ready), ' + Object.keys(loadCourse(fs.readFileSync(LESSONS_FILE, 'utf8')).diagrams).length +
  ' diagrams: ' + errors.length + ' errors, ' + warnings.length + ' warnings');
process.exit(errors.length ? 1 : 0);
