/*
 * The Browser Cookbook — application logic.
 *
 * Renders COURSE (lessons.js) into a hash-routed single-page app and keeps
 * progress in localStorage. Contains no lesson content.
 *
 * Routes:
 *   #/                         dashboard
 *   #/lesson/<id>[/<section>]  lesson reader, optionally scrolled to a section
 *   #/playground               experiments across all lessons
 *   #/notes                    all notes
 *   #/progress                 progress, export / import, reset
 */
(function () {
  'use strict';

  const COURSE = window.COURSE;
  const highlight = window.Highlight.highlight;
  const esc = window.Highlight.escapeHtml;
  const Diagrams = window.Diagrams;

  const STORAGE_KEY = 'browser-cookbook:v1';
  const SCHEMA_VERSION = 1;
  const LIMITS = { noteChars: 50000, keys: 5000, keyLength: 200, importBytes: 5 * 1024 * 1024 };
  const COLLAPSE_LINES = 45;
  const LANG_LABELS = { python: 'Python', rust: 'Rust', shell: 'Shell', http: 'HTTP', json: 'JSON', text: 'Text' };

  /* ------------------------------------------------------------------ */
  /* Content index                                                      */
  /* ------------------------------------------------------------------ */

  const lessons = COURSE.lessons.slice().sort(function (a, b) { return a.number - b.number; });
  const lessonById = new Map();
  lessons.forEach(function (lesson, i) {
    if (!lesson.prerequisites) lesson.prerequisites = i > 0 ? [lessons[i - 1].id] : [];
    ['objectives', 'topics', 'body', 'experiments', 'exercises', 'stretch', 'takeaways', 'references'].forEach(function (key) {
      if (!Array.isArray(lesson[key])) lesson[key] = [];
    });
    lesson.snippets = lesson.snippets || {};
    lessonById.set(lesson.id, lesson);
  });

  const parts = COURSE.parts.map(function (part) {
    return Object.assign({}, part, { lessons: lessons.filter(function (l) { return l.part === part.id; }) });
  });
  const partById = new Map(parts.map(function (p) { return [p.id, p]; }));

  function taskKey(lesson, kind, task) {
    return lesson.id + '/' + kind + '/' + task.id;
  }

  function tasksFor(lesson) {
    const out = [];
    [['experiment', lesson.experiments], ['exercise', lesson.exercises], ['stretch', lesson.stretch]].forEach(function (pair) {
      pair[1].forEach(function (task) { out.push({ kind: pair[0], key: taskKey(lesson, pair[0], task), task: task, lesson: lesson }); });
    });
    return out;
  }

  const allTasks = lessons.reduce(function (acc, l) { return acc.concat(tasksFor(l)); }, []);

  /* ------------------------------------------------------------------ */
  /* State and persistence                                              */
  /* ------------------------------------------------------------------ */

  function emptyState() {
    return {
      version: SCHEMA_VERSION,
      currentLesson: lessons[0].id,
      completedLessons: Object.create(null),
      completedExercises: Object.create(null),
      notes: Object.create(null),
      theme: 'auto',
      updatedAt: null,
    };
  }

  function isKey(key) {
    return typeof key === 'string' && key.length <= LIMITS.keyLength && /^[\w-]+(?:\/[\w-]+)*$/.test(key);
  }

  function isStamp(value) {
    return typeof value === 'string' && value.length <= 40;
  }

  function copyMap(source, accept) {
    const out = Object.create(null);
    if (!source || typeof source !== 'object' || Array.isArray(source)) return out;
    Object.keys(source).slice(0, LIMITS.keys).forEach(function (key) {
      if (isKey(key) && accept(source[key])) out[key] = source[key];
    });
    return out;
  }

  /* Accepts untrusted input (localStorage or an imported file) and returns a valid state. */
  function sanitizeState(input) {
    const clean = emptyState();
    if (!input || typeof input !== 'object') return clean;

    clean.completedLessons = copyMap(input.completedLessons, isStamp);
    clean.completedExercises = copyMap(input.completedExercises, isStamp);
    const notes = copyMap(input.notes, function (n) { return n && typeof n === 'object' && typeof n.text === 'string'; });
    Object.keys(notes).forEach(function (key) {
      clean.notes[key] = {
        text: notes[key].text.slice(0, LIMITS.noteChars),
        updatedAt: isStamp(notes[key].updatedAt) ? notes[key].updatedAt : null,
      };
    });
    if (lessonById.has(input.currentLesson)) clean.currentLesson = input.currentLesson;
    if (['auto', 'light', 'dark'].indexOf(input.theme) !== -1) clean.theme = input.theme;
    if (isStamp(input.updatedAt)) clean.updatedAt = input.updatedAt;
    return clean;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? sanitizeState(JSON.parse(raw)) : emptyState();
    } catch (err) {
      return emptyState();
    }
  }

  let state = loadState();

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      toast('Could not save: browser storage is full or disabled.');
      return false;
    }
  }

  /* ------------------------------------------------------------------ */
  /* Derived progress                                                   */
  /* ------------------------------------------------------------------ */

  function isLessonDone(id) { return Boolean(state.completedLessons[id]); }
  function isTaskDone(key) { return Boolean(state.completedExercises[key]); }

  function lessonProgress() {
    const done = lessons.filter(function (l) { return isLessonDone(l.id); }).length;
    return { done: done, total: lessons.length, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
  }

  function taskProgress(tasks) {
    const done = tasks.filter(function (t) { return isTaskDone(t.key); }).length;
    return { done: done, total: tasks.length };
  }

  function experimentProgress() {
    return taskProgress(allTasks.filter(function (t) { return t.kind === 'experiment'; }));
  }

  /* Ticking a box updates counts in place, so expanded code and stepped diagrams stay as they are. */
  function updateTaskCounts() {
    document.querySelectorAll('[data-task-count]').forEach(function (el) {
      const lesson = lessonById.get(el.dataset.taskCount);
      if (!lesson) return;
      const tp = taskProgress(tasksFor(lesson));
      el.textContent = el.hasAttribute('data-long') ? tp.done + ' of ' + plural(tp.total, 'task') + ' done.' : tp.done + '/' + tp.total + ' tasks';
    });
    const exp = document.querySelector('[data-experiment-count]');
    if (exp) {
      const ep = experimentProgress();
      exp.textContent = ep.done + ' of ' + plural(ep.total, 'experiment') + ' complete';
    }
  }

  function partProgress(part) {
    const done = part.lessons.filter(function (l) { return isLessonDone(l.id); }).length;
    return { done: done, total: part.lessons.length, pct: part.lessons.length ? Math.round((done / part.lessons.length) * 100) : 0 };
  }

  function currentLesson() {
    return lessonById.get(state.currentLesson) || lessons[0];
  }

  function firstIncompleteAfter(lesson) {
    const start = lessons.indexOf(lesson);
    for (let i = 1; i <= lessons.length; i++) {
      const candidate = lessons[(start + i) % lessons.length];
      if (!isLessonDone(candidate.id)) return candidate;
    }
    return null;
  }

  function currentMilestone() {
    const ms = COURSE.milestones;
    return ms.find(function (m) { return m.lessons.some(function (id) { return !isLessonDone(id); }); }) || ms[ms.length - 1];
  }

  function milestoneStatus(m) {
    const done = m.lessons.filter(isLessonDone).length;
    if (done === m.lessons.length) return 'done';
    return m === currentMilestone() ? 'current' : 'upcoming';
  }

  /* ------------------------------------------------------------------ */
  /* Formatting helpers                                                 */
  /* ------------------------------------------------------------------ */

  function fmtMinutes(min) {
    if (!min) return '';
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (!h) return m + ' min';
    return h + ' h' + (m ? ' ' + m + ' min' : '');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fmtDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function lessonLabel(lesson) { return 'Lesson ' + lesson.number; }
  function lessonHref(lesson, section) { return '#/lesson/' + lesson.id + (section ? '/' + section : ''); }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  function bar(pct, extra, label) {
    return '<span class="bar' + (extra ? ' ' + extra : '') + '" role="progressbar" aria-label="' + esc(label || 'Progress') + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
      '<span class="bar-fill" style="width:' + pct + '%"></span></span>';
  }

  const ICONS = {
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    arrowL: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrowR: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  function statusIcon(lesson) {
    if (isLessonDone(lesson.id)) return '<span class="status-dot is-done" aria-label="Completed">' + ICONS.check + '</span>';
    if (lesson.id === currentLesson().id) return '<span class="status-dot is-current" aria-label="Current lesson"></span>';
    return '<span class="status-dot" aria-hidden="true"></span>';
  }

  /* ------------------------------------------------------------------ */
  /* Copy registry: copy buttons reference text by index                 */
  /* ------------------------------------------------------------------ */

  let copyRegistry = [];

  function registerCopy(text) {
    copyRegistry.push(text);
    return copyRegistry.length - 1;
  }

  function copyButton(text, label) {
    return '<button type="button" class="copy-btn" data-action="copy" data-copy="' + registerCopy(text) + '" aria-label="' + esc(label || 'Copy to clipboard') + '">Copy</button>';
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) { /* fall through to the legacy path */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }

  /* ------------------------------------------------------------------ */
  /* Content block renderers                                            */
  /* ------------------------------------------------------------------ */

  function renderCode(snippet) {
    if (!snippet) return '';
    const lang = snippet.lang || 'text';
    const code = snippet.code.replace(/\n+$/, '');
    const lines = code.split('\n').length;
    const collapsible = lines > COLLAPSE_LINES;
    return '<figure class="code' + (collapsible ? ' is-collapsible is-collapsed' : '') + '">' +
      '<figcaption class="code-head"><span class="code-lang">' + esc(LANG_LABELS[lang] || lang) + '</span>' +
      '<span class="code-file" title="' + esc(snippet.file || snippet.title || '') + '">' + esc(snippet.file || snippet.title || '') + '</span>' + copyButton(code, 'Copy code') + '</figcaption>' +
      '<pre tabindex="0"><code class="lang-' + esc(lang) + '">' + highlight(code, lang) + '</code></pre>' +
      (collapsible ? '<button type="button" class="code-expand" data-action="expand-code">Show all ' + lines + ' lines</button>' : '') +
      '</figure>';
  }

  function renderTerminal(block) {
    const commands = block.commands || [];
    return '<figure class="terminal">' +
      '<figcaption class="code-head"><span class="code-lang">Terminal</span><span class="code-file" title="' + esc(block.title || '') + '">' + esc(block.title || '') + '</span>' +
      (commands.length ? copyButton(commands.join('\n'), 'Copy commands') : '') + '</figcaption>' +
      (commands.length ? '<pre class="terminal-cmds" tabindex="0"><code>' + commands.map(function (c) {
        return '<span class="cmd">' + highlight(c, 'shell') + '</span>';
      }).join('\n') + '</code></pre>' : '') +
      (block.output ? '<p class="terminal-out-label">Expected output</p><pre class="terminal-out" tabindex="0"><code>' + esc(block.output) + '</code></pre>' : '') +
      '</figure>';
  }

  function renderTable(block) {
    return '<figure class="table-wrap"><div class="table-scroll" tabindex="0"><table>' +
      (block.head ? '<thead><tr>' + block.head.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead>' : '') +
      '<tbody>' + block.rows.map(function (row) {
        return '<tr>' + row.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div>' +
      (block.caption ? '<figcaption>' + esc(block.caption) + '</figcaption>' : '') + '</figure>';
  }

  function renderBlock(block, lesson) {
    switch (block.type) {
      case 'h2': return '<h2 class="section-title" id="sec-' + esc(block.id) + '">' + esc(block.text) + '</h2>';
      case 'h3': return '<h3>' + esc(block.text) + '</h3>';
      case 'p': return '<p>' + block.html + '</p>';
      case 'html': return block.html;
      case 'list': {
        const tag = block.ordered ? 'ol' : 'ul';
        return '<' + tag + ' class="prose-list">' + block.items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</' + tag + '>';
      }
      case 'callout':
        return '<aside class="callout callout-' + esc(block.tone || 'note') + '">' +
          (block.title ? '<p class="callout-title">' + esc(block.title) + '</p>' : '') + block.html + '</aside>';
      case 'definitions':
        return '<dl class="defs">' + block.items.map(function (pair) {
          return '<div class="def"><dt>' + esc(pair[0]) + '</dt><dd>' + pair[1] + '</dd></div>';
        }).join('') + '</dl>';
      case 'code': return renderCode(block.snippet ? lesson.snippets[block.snippet] : block);
      case 'terminal': return renderTerminal(block);
      case 'table': return renderTable(block);
      case 'diagram': return Diagrams.render(block.id, COURSE.diagrams[block.id]);
      default: return '';
    }
  }

  function renderTask(item, extraClass) {
    const done = isTaskDone(item.key);
    return '<li class="task' + (done ? ' is-done' : '') + (extraClass ? ' ' + extraClass : '') + '">' +
      '<label class="task-check"><input type="checkbox" data-action="toggle-task" data-key="' + esc(item.key) + '"' + (done ? ' checked' : '') + '>' +
      '<span class="task-title">' + esc(item.task.title) + '</span></label>' +
      '<div class="task-body">' + item.task.html + '</div></li>';
  }

  function renderExperiment(lesson, exp, options) {
    const key = taskKey(lesson, 'experiment', exp);
    const done = isTaskDone(key);
    const lang = exp.lang || 'shell';
    const snippet = exp.snippet ? lesson.snippets[exp.snippet] : exp.code ? { lang: lang, code: exp.code, file: exp.file } : null;
    return '<article class="experiment' + (done ? ' is-done' : '') + '" id="exp-' + esc(lesson.id + '-' + exp.id) + '">' +
      '<header class="experiment-head">' +
      '<span class="badge badge-' + esc(lang) + '">' + esc(LANG_LABELS[lang] || lang) + '</span>' +
      (options && options.showLesson ? '<a class="badge badge-link" href="' + lessonHref(lesson) + '">' + esc(lessonLabel(lesson)) + '</a>' : '') +
      '<h3>' + esc(exp.title) + '</h3></header>' +
      (exp.summary ? '<p class="experiment-summary">' + esc(exp.summary) + '</p>' : '') +
      (snippet ? renderCode(snippet) : '') +
      renderTerminal({ commands: exp.commands, output: exp.output, title: 'Run from the repo root' }) +
      (exp.observe && exp.observe.length ? '<div class="observe"><p class="observe-title">What to observe</p><ul>' +
        exp.observe.map(function (o) { return '<li>' + o + '</li>'; }).join('') + '</ul></div>' : '') +
      '<label class="task-check experiment-done"><input type="checkbox" data-action="toggle-task" data-key="' + esc(key) + '"' + (done ? ' checked' : '') + '>' +
      '<span class="task-title">Experiment complete</span></label>' +
      '</article>';
  }

  function renderNoteEditor(lesson, options) {
    const note = state.notes[lesson.id];
    return '<div class="note-editor">' +
      (options && options.label ? '<label class="note-label" for="note-' + lesson.id + '">' + options.label + '</label>' : '') +
      '<textarea id="note-' + lesson.id + '" class="note-input" data-note="' + esc(lesson.id) + '" rows="' + ((options && options.rows) || 8) + '" ' +
      'placeholder="Questions, insights, commands that worked, links… Autosaves on this device." spellcheck="true">' +
      esc(note ? note.text : '') + '</textarea>' +
      '<p class="note-status" data-note-status="' + esc(lesson.id) + '">' + noteStatusText(lesson.id) + '</p></div>';
  }

  function noteStatusText(id) {
    const note = state.notes[id];
    return note && note.updatedAt ? 'Saved on this device · ' + esc(fmtDateTime(note.updatedAt)) : 'Notes save automatically on this device.';
  }

  /* ------------------------------------------------------------------ */
  /* Sidebar                                                            */
  /* ------------------------------------------------------------------ */

  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');

  function renderSidebar() {
    const route = parseHash();
    const navLink = function (href, view, label) {
      const active = route.view === view;
      return '<a class="nav-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' + label + '</a>';
    };
    const current = currentLesson();
    sidebar.innerHTML =
      '<div class="nav-inner">' +
      '<nav class="nav-main" aria-label="Main">' +
      navLink('#/', 'home', 'Dashboard') +
      navLink(lessonHref(current), 'lesson-current', 'Continue: ' + esc(lessonLabel(current))) +
      navLink('#/playground', 'playground', 'Playground') +
      navLink('#/notes', 'notes', 'Notes') +
      navLink('#/progress', 'progress', 'Progress &amp; backup') +
      '</nav>' +
      '<nav class="nav-course" aria-label="Lessons">' + parts.map(function (part) {
        const p = partProgress(part);
        return '<div class="nav-part"><p class="nav-part-title"><span class="nav-numeral">' + esc(part.numeral) + '</span>' +
          '<span class="nav-part-name">' + esc(part.title) + '</span><span class="nav-count">' + p.done + '/' + p.total + '</span></p>' +
          '<ol class="nav-lessons">' + part.lessons.map(function (lesson) {
            const active = route.view === 'lesson' && route.id === lesson.id;
            return '<li><a class="nav-lesson' + (isLessonDone(lesson.id) ? ' is-done' : '') + '" href="' + lessonHref(lesson) + '"' +
              (active ? ' aria-current="page"' : '') + '>' + statusIcon(lesson) +
              '<span class="nav-lesson-num">' + lesson.number + '</span><span class="nav-lesson-title">' + esc(lesson.title) + '</span></a></li>';
          }).join('') + '</ol></div>';
      }).join('') + '</nav></div>';
  }

  /* ------------------------------------------------------------------ */
  /* Views                                                              */
  /* ------------------------------------------------------------------ */

  function viewHome() {
    const lp = lessonProgress();
    const tp = taskProgress(allTasks);
    const current = currentLesson();
    const currentPart = partById.get(current.part);
    const milestone = currentMilestone();
    const msDone = milestone.lessons.filter(isLessonDone).length;
    const msRows = Math.ceil(COURSE.milestones.length / 2); // two columns on wide screens, filled column-first
    const upcoming = [];
    let cursor = current;
    while (upcoming.length < 3) {
      cursor = firstIncompleteAfter(cursor);
      if (!cursor || cursor === current || upcoming.indexOf(cursor) !== -1) break;
      upcoming.push(cursor);
    }
    const completed = lessons.filter(function (l) { return isLessonDone(l.id); })
      .sort(function (a, b) { return String(state.completedLessons[b.id]).localeCompare(String(state.completedLessons[a.id])); });

    const lessonRow = function (lesson, meta) {
      return '<li><a class="lesson-row" href="' + lessonHref(lesson) + '">' + statusIcon(lesson) +
        '<span class="lesson-row-text"><span class="lesson-row-kicker">' + esc(lessonLabel(lesson)) + (meta ? ' · ' + esc(meta) : '') + '</span>' +
        '<span class="lesson-row-title">' + esc(lesson.title) + '</span></span>' +
        (lesson.status === 'outline' ? '<span class="badge badge-muted">Outline</span>' : '') + '</a></li>';
    };

    return '<div class="page page-home">' +
      '<section class="hero">' +
      '<p class="eyebrow">Course workspace</p>' +
      '<h1 class="hero-title">' + esc(COURSE.title) + '</h1>' +
      '<p class="hero-sub">' + esc(COURSE.subtitle) + '</p>' +
      '<ol class="hero-path">' + COURSE.path.map(function (step) { return '<li>' + esc(step) + '</li>'; }).join('') + '</ol>' +
      '<div class="hero-progress"><div class="hero-progress-top"><span class="hero-pct">' + lp.pct + '%</span>' +
      '<span class="hero-progress-label">' + lp.done + ' of ' + lp.total + ' lessons · ' + tp.done + ' of ' + tp.total + ' exercises &amp; experiments</span></div>' +
      bar(lp.pct, 'bar-hero', 'Course progress') + '</div>' +
      '</section>' +

      '<div class="card-grid">' +
      '<section class="card card-current"><p class="card-kicker">Current lesson</p>' +
      '<h2 class="card-title"><a href="' + lessonHref(current) + '">' + esc(lessonLabel(current)) + ': ' + esc(current.title) + '</a></h2>' +
      '<p class="card-meta">Part ' + esc(currentPart.numeral) + ' · ' + esc(currentPart.title) + ' · ' + ICONS.clock + ' ' + esc(fmtMinutes(current.minutes)) + '</p>' +
      '<p class="card-text">' + esc(current.summary) + '</p>' +
      '<a class="btn btn-primary" href="' + lessonHref(current) + '">' + (isLessonDone(current.id) ? 'Review lesson' : 'Continue reading') + '</a></section>' +

      '<section class="card"><p class="card-kicker">Current milestone</p>' +
      '<h2 class="card-title">' + esc(milestone.title) + '</h2>' +
      '<p class="card-text">' + esc(milestone.summary) + '</p>' +
      bar(Math.round((msDone / milestone.lessons.length) * 100), '', 'Milestone progress') +
      '<p class="card-meta">' + msDone + ' of ' + plural(milestone.lessons.length, 'lesson') + ' complete</p></section>' +

      '<section class="card"><p class="card-kicker">Weekly commitment</p>' +
      '<h2 class="card-title">' + esc(COURSE.weeklyCommitment) + '</h2>' +
      '<p class="card-text">Estimates cover reading, the experiments and the build target; exercises are extra. Most lessons fit one or two sittings, and the Part VII capstones span several. Total: ' +
      esc(fmtMinutes(lessons.reduce(function (s, l) { return s + (l.minutes || 0); }, 0))) + '.</p></section>' +
      '</div>' +

      '<div class="two-col">' +
      '<section class="panel"><h2 class="panel-title">Up next</h2>' +
      (upcoming.length ? '<ul class="lesson-rows">' + upcoming.map(function (l) { return lessonRow(l, fmtMinutes(l.minutes)); }).join('') + '</ul>' :
        '<p class="empty">Nothing left. You built a browser.</p>') + '</section>' +
      '<section class="panel"><h2 class="panel-title">Completed <span class="panel-count">' + completed.length + '</span></h2>' +
      (completed.length ? '<ul class="lesson-rows">' + completed.slice(0, 5).map(function (l) { return lessonRow(l, fmtDate(state.completedLessons[l.id])); }).join('') + '</ul>' +
        (completed.length > 5 ? '<p class="panel-more"><a href="#/progress">See all ' + completed.length + '</a></p>' : '') :
        '<p class="empty">No lessons completed yet. Lesson 1 takes about ' + esc(fmtMinutes(lessons[0].minutes)) + '.</p>') + '</section>' +
      '</div>' +

      '<section class="milestones"><h2 class="section-heading">Milestones</h2><ol class="milestone-track" style="--rows:' + msRows + '">' +
      COURSE.milestones.map(function (m, i) {
        const status = milestoneStatus(m);
        return '<li class="milestone is-' + status + (i === msRows - 1 ? ' is-col-end' : '') + '"><span class="milestone-dot">' + (status === 'done' ? ICONS.check : '') + '</span>' +
          '<span class="milestone-text"><span class="milestone-title">' + esc(m.title) + '</span>' +
          '<span class="milestone-sub">' + esc(m.summary) + '</span></span></li>';
      }).join('') + '</ol></section>' +

      '<section class="course-map"><h2 class="section-heading">Course map</h2>' +
      parts.map(function (part) {
        const p = partProgress(part);
        const open = part.id === current.part;
        return '<details class="part"' + (open ? ' open' : '') + '><summary class="part-summary">' +
          '<span class="part-numeral">' + esc(part.numeral) + '</span>' +
          '<span class="part-head"><span class="part-title">' + esc(part.title) + '</span>' +
          '<span class="part-tagline">' + esc(part.summary) + '</span>' +
          '<span class="part-progress">' + bar(p.pct, 'bar-thin', 'Part ' + part.numeral + ' progress') + '<span class="part-count">' + p.done + '/' + p.total + '</span></span></span>' +
          '</summary><ul class="lesson-rows">' + part.lessons.map(function (l) { return lessonRow(l, fmtMinutes(l.minutes)); }).join('') + '</ul></details>';
      }).join('') + '</section>' +
      '</div>';
  }

  function lessonToc(lesson) {
    const items = [['objectives', 'Learning objectives']];
    if (lesson.status === 'outline') items.push(['plan', 'Lesson plan']);
    lesson.body.forEach(function (b) { if (b.type === 'h2') items.push([b.id, b.text]); });
    if (lesson.experiments.length) items.push(['experiments', 'Experiments']);
    if (lesson.exercises.length) items.push(['exercises', 'Exercises']);
    if (lesson.stretch.length) items.push(['stretch', 'Stretch challenges']);
    if (lesson.takeaways.length) items.push(['takeaways', 'Key takeaways']);
    if (lesson.references.length) items.push(['references', 'References']);
    items.push(['notes', 'Your notes']);
    items.push(['complete', 'Finish lesson']);
    return items;
  }

  function viewLesson(lesson) {
    const idx = lessons.indexOf(lesson);
    const prev = lessons[idx - 1];
    const next = lessons[idx + 1];
    const part = partById.get(lesson.part);
    const done = isLessonDone(lesson.id);
    const tasks = tasksFor(lesson);
    const tp = taskProgress(tasks);
    const toc = lessonToc(lesson);
    const section = function (id, title, content) {
      return '<section class="lesson-section"><h2 class="section-title" id="sec-' + id + '">' + esc(title) + '</h2>' + content + '</section>';
    };
    const kindTasks = function (kind) { return tasks.filter(function (t) { return t.kind === kind; }); };

    const prereqs = lesson.prerequisites.map(function (id) { return lessonById.get(id); }).filter(Boolean);
    const unmet = prereqs.filter(function (p) { return !isLessonDone(p.id); });

    let html = '<div class="lesson-bar"><div class="lesson-bar-inner">' +
      (prev ? '<a class="icon-btn" href="' + lessonHref(prev) + '" aria-label="Previous lesson">' + ICONS.arrowL + '</a>' : '<span class="icon-btn is-disabled" aria-hidden="true">' + ICONS.arrowL + '</span>') +
      '<details class="toc"><summary><span class="toc-kicker">' + esc(lessonLabel(lesson)) + '</span><span class="toc-title">' + esc(lesson.title) + '</span></summary>' +
      '<nav class="toc-menu" aria-label="Lesson contents"><ol>' + toc.map(function (t) {
        return '<li><a href="' + lessonHref(lesson, t[0]) + '" data-toc="' + esc(t[0]) + '">' + esc(t[1]) + '</a></li>';
      }).join('') + '</ol></nav></details>' +
      (next ? '<a class="icon-btn" href="' + lessonHref(next) + '" aria-label="Next lesson">' + ICONS.arrowR + '</a>' : '<span class="icon-btn is-disabled" aria-hidden="true">' + ICONS.arrowR + '</span>') +
      '</div><div class="reading-progress"><span class="reading-fill" id="reading-fill"></span></div></div>';

    html += '<article class="lesson reading" data-lesson="' + esc(lesson.id) + '">' +
      '<header class="lesson-header">' +
      '<p class="eyebrow">Part ' + esc(part.numeral) + ' · ' + esc(part.title) + ' · ' + esc(lessonLabel(lesson)) + '</p>' +
      '<h1 class="lesson-title">' + esc(lesson.title) + '</h1>' +
      '<p class="lede">' + esc(lesson.summary) + '</p>' +
      '<ul class="meta">' +
      '<li>' + ICONS.clock + ' ' + esc(fmtMinutes(lesson.minutes)) + '</li>' +
      '<li>' + (done ? '<span class="badge badge-done">Completed ' + esc(fmtDate(state.completedLessons[lesson.id])) + '</span>' :
        lesson.status === 'outline' ? '<span class="badge badge-muted">Outline</span>' : '<span class="badge badge-ready">Ready</span>') + '</li>' +
      (tp.total ? '<li data-task-count="' + esc(lesson.id) + '">' + tp.done + '/' + tp.total + ' tasks</li>' : '') +
      '</ul>' +
      '<div class="prereqs"><span class="prereqs-label">Prerequisites</span>' +
      (prereqs.length ? prereqs.map(function (p) {
        return '<a class="prereq' + (isLessonDone(p.id) ? ' is-done' : '') + '" href="' + lessonHref(p) + '">' + statusIcon(p) + esc(lessonLabel(p)) + ': ' + esc(p.title) + '</a>';
      }).join('') : '<span class="prereq-none">None. Start here.</span>') + '</div>' +
      (unmet.length ? '<p class="prereq-warning">This lesson builds on ' + unmet.map(function (p) { return esc(lessonLabel(p)); }).join(', ') + '. You can read ahead, but the code assumes it.</p>' : '') +
      '</header>';

    html += section('objectives', 'Learning objectives', '<ul class="objectives">' + lesson.objectives.map(function (o) { return '<li>' + esc(o) + '</li>'; }).join('') + '</ul>' +
      (lesson.build ? '<div class="build-target"><p class="build-label">What you will build</p><p>' + esc(lesson.build) + '</p></div>' : ''));

    if (lesson.status === 'outline') {
      html += section('plan', 'Lesson plan',
        '<aside class="callout callout-note"><p class="callout-title">Outline</p><p>This lesson is planned but not yet written in full. The topics, build target and references below are the syllabus. Use your notes to collect material as you go, and see the README to promote it to a full lesson.</p></aside>' +
        (lesson.topics.length ? '<ul class="topic-list">' + lesson.topics.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : ''));
    }

    html += '<div class="lesson-body">' + lesson.body.map(function (b) { return renderBlock(b, lesson); }).join('') + '</div>';

    if (lesson.experiments.length) {
      html += section('experiments', 'Experiments',
        '<p class="section-intro">Run these in a terminal or Codespace. The browser can\u2019t execute Python or Rust; see the <a href="#/playground">Playground</a> for setup.</p>' +
        lesson.experiments.map(function (e) { return renderExperiment(lesson, e); }).join(''));
    }
    if (lesson.exercises.length) {
      html += section('exercises', 'Exercises', '<ol class="tasks">' + kindTasks('exercise').map(function (t) { return renderTask(t); }).join('') + '</ol>');
    }
    if (lesson.stretch.length) {
      html += section('stretch', 'Stretch challenges', '<ol class="tasks tasks-stretch">' + kindTasks('stretch').map(function (t) { return renderTask(t, 'task-stretch'); }).join('') + '</ol>');
    }
    if (lesson.takeaways.length) {
      html += section('takeaways', 'Key takeaways', '<ul class="takeaways">' + lesson.takeaways.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>');
    }
    if (lesson.references.length) {
      html += section('references', 'References', '<ul class="references">' + lesson.references.map(function (r) {
        let host = '';
        try { host = new URL(r.url).hostname.replace(/^www\./, ''); } catch (err) { host = ''; }
        return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.title) + '</a><span class="ref-host">' + esc(host) + '</span></li>';
      }).join('') + '</ul>');
    }
    html += section('notes', 'Your notes', renderNoteEditor(lesson));
    html += '<section class="complete-card" id="sec-complete">' +
      (done ? '<p class="complete-state">' + ICONS.check + ' Completed on ' + esc(fmtDate(state.completedLessons[lesson.id])) + '</p>' :
        '<p class="complete-state">' + (tp.total ? '<span data-task-count="' + esc(lesson.id) + '" data-long>' + tp.done + ' of ' + plural(tp.total, 'task') + ' done.</span> ' : '') + 'Finished reading and running the code?</p>') +
      '<button type="button" class="btn ' + (done ? 'btn-ghost' : 'btn-primary btn-large') + '" data-action="toggle-lesson" data-id="' + esc(lesson.id) + '">' +
      (done ? 'Mark as not complete' : 'Mark lesson complete') + '</button></section>';

    html += '<nav class="pager" aria-label="Lesson navigation">' +
      (prev ? '<a class="pager-link pager-prev" href="' + lessonHref(prev) + '"><span class="pager-dir">' + ICONS.arrowL + ' Previous</span><span class="pager-title">' + esc(prev.title) + '</span></a>' : '<span></span>') +
      (next ? '<a class="pager-link pager-next" href="' + lessonHref(next) + '"><span class="pager-dir">Next ' + ICONS.arrowR + '</span><span class="pager-title">' + esc(next.title) + '</span></a>' : '<span></span>') +
      '</nav></article>';
    return html;
  }

  const playgroundFilter = { lang: 'all', lesson: 'all' };

  function viewPlayground() {
    const all = [];
    lessons.forEach(function (lesson) { lesson.experiments.forEach(function (exp) { all.push({ lesson: lesson, exp: exp }); }); });
    const langs = ['all'].concat(Array.from(new Set(all.map(function (x) { return x.exp.lang || 'shell'; }))));
    const lessonsWithExps = lessons.filter(function (l) { return l.experiments.length; });
    const shown = all.filter(function (x) {
      return (playgroundFilter.lang === 'all' || (x.exp.lang || 'shell') === playgroundFilter.lang) &&
        (playgroundFilter.lesson === 'all' || x.lesson.id === playgroundFilter.lesson);
    });
    const doneCount = experimentProgress().done;

    return '<div class="page reading">' +
      '<header class="page-header"><p class="eyebrow">Code workspace</p><h1>Playground</h1>' +
      '<p class="lede">Every experiment in the course, in one place. Code runs in your terminal, not in this page: copy a command, run it, compare against the expected output, then tick it off.</p>' +
      '<p class="page-stat" data-experiment-count>' + doneCount + ' of ' + plural(all.length, 'experiment') + ' complete</p></header>' +

      '<section class="lesson-section"><h2 class="section-title">Where to run code</h2><div class="env-list">' +
      COURSE.environments.map(function (env, i) {
        return '<details class="env"' + (i === 0 ? ' open' : '') + '><summary>' + esc(env.title) + '</summary>' + env.html +
          renderTerminal({ commands: env.commands }) + '</details>';
      }).join('') + '</div></section>' +

      '<section class="lesson-section"><h2 class="section-title">Experiments</h2>' +
      '<div class="filters" role="group" aria-label="Filter experiments">' +
      '<div class="segmented" role="radiogroup" aria-label="Language">' + langs.map(function (l) {
        const on = playgroundFilter.lang === l;
        return '<button type="button" role="radio" aria-checked="' + on + '" class="seg' + (on ? ' is-on' : '') + '" data-action="filter-lang" data-lang="' + esc(l) + '">' +
          esc(l === 'all' ? 'All' : (LANG_LABELS[l] || l)) + '</button>';
      }).join('') + '</div>' +
      '<label class="select-wrap"><span class="visually-hidden">Lesson</span><select data-action="filter-lesson">' +
      '<option value="all">All lessons</option>' + lessonsWithExps.map(function (l) {
        return '<option value="' + esc(l.id) + '"' + (playgroundFilter.lesson === l.id ? ' selected' : '') + '>' + esc(lessonLabel(l) + ': ' + l.title) + '</option>';
      }).join('') + '</select></label></div>' +
      (shown.length ? shown.map(function (x) { return renderExperiment(x.lesson, x.exp, { showLesson: true }); }).join('') :
        '<p class="empty">No experiments match this filter yet.</p>') +
      '</section></div>';
  }

  function viewNotes() {
    const withNotes = lessons.filter(function (l) { return state.notes[l.id] && state.notes[l.id].text.trim(); });
    const without = lessons.filter(function (l) { return withNotes.indexOf(l) === -1; });
    return '<div class="page reading">' +
      '<header class="page-header"><p class="eyebrow">Notebook</p><h1>Notes</h1>' +
      '<p class="lede">Notes are attached to lessons, saved as you type, and included in progress exports.</p>' +
      '<p class="page-stat">' + plural(withNotes.length, 'lesson') + ' with notes</p></header>' +
      (withNotes.length ? withNotes.map(function (l) {
        return '<section class="note-card"><h2 class="note-card-title"><a href="' + lessonHref(l, 'notes') + '">' + esc(lessonLabel(l)) + ': ' + esc(l.title) + '</a></h2>' +
          renderNoteEditor(l, { rows: 6 }) + '</section>';
      }).join('') : '<p class="empty">No notes yet. Every lesson has a notes box near the end, or start one here.</p>') +
      '<section class="note-card"><h2 class="note-card-title">Start a note</h2>' +
      '<div class="inline-form"><label class="select-wrap"><span class="visually-hidden">Lesson</span><select id="new-note-lesson">' +
      without.map(function (l) { return '<option value="' + esc(l.id) + '">' + esc(lessonLabel(l) + ': ' + l.title) + '</option>'; }).join('') +
      '</select></label><button type="button" class="btn btn-primary" data-action="open-note">Open</button></div></section>' +
      '</div>';
  }

  function viewProgress() {
    const lp = lessonProgress();
    const counts = { experiment: 0, exercise: 0, stretch: 0 };
    const totals = { experiment: 0, exercise: 0, stretch: 0 };
    allTasks.forEach(function (t) { totals[t.kind]++; if (isTaskDone(t.key)) counts[t.kind]++; });
    const noteCount = Object.keys(state.notes).length;

    return '<div class="page reading">' +
      '<header class="page-header"><p class="eyebrow">Progress</p><h1>Progress &amp; backup</h1>' +
      '<p class="lede">Progress lives in this browser\u2019s localStorage. Export it to back it up or move it to another device.</p></header>' +

      '<section class="lesson-section"><h2 class="section-title">Overview</h2>' +
      '<div class="stat-grid">' +
      '<div class="stat"><span class="stat-num">' + lp.pct + '%</span><span class="stat-label">Course complete</span></div>' +
      '<div class="stat"><span class="stat-num">' + lp.done + '<small>/' + lp.total + '</small></span><span class="stat-label">Lessons</span></div>' +
      '<div class="stat"><span class="stat-num">' + counts.experiment + '<small>/' + totals.experiment + '</small></span><span class="stat-label">Experiments</span></div>' +
      '<div class="stat"><span class="stat-num">' + counts.exercise + '<small>/' + totals.exercise + '</small></span><span class="stat-label">Exercises</span></div>' +
      '<div class="stat"><span class="stat-num">' + counts.stretch + '<small>/' + totals.stretch + '</small></span><span class="stat-label">Stretch</span></div>' +
      '<div class="stat"><span class="stat-num">' + noteCount + '</span><span class="stat-label">Notes</span></div>' +
      '</div>' +
      '<ul class="part-bars">' + parts.map(function (part) {
        const p = partProgress(part);
        return '<li><span class="part-bars-label">' + esc(part.numeral) + ' · ' + esc(part.title) + '</span>' + bar(p.pct, '', 'Part ' + part.numeral + ' progress') + '<span class="part-bars-count">' + p.done + '/' + p.total + '</span></li>';
      }).join('') + '</ul>' +
      '<p class="muted">Last saved: ' + (state.updatedAt ? esc(fmtDateTime(state.updatedAt)) : 'never') + '</p></section>' +

      '<section class="lesson-section"><h2 class="section-title">Export</h2>' +
      '<p>The export contains completed lessons, completed exercises and experiments, your current lesson, your notes and your theme. It is plain JSON.</p>' +
      '<div class="button-row"><button type="button" class="btn btn-primary" data-action="export-download">Download JSON</button>' +
      '<button type="button" class="btn" data-action="export-copy">Copy JSON</button></div>' +
      '<p class="muted">On iPhone, Safari saves the download to Files (or offers the share sheet, depending on the iOS version). "Copy" is handy for pasting into a note on another device.</p></section>' +

      '<section class="lesson-section"><h2 class="section-title">Import</h2>' +
      '<p>Importing <strong>replaces</strong> the progress on this device. You will be asked to confirm.</p>' +
      '<label class="btn file-btn">Choose a JSON file<input type="file" accept="application/json,.json" data-action="import-file" class="visually-hidden"></label>' +
      '<label class="note-label" for="import-text">Or paste exported JSON</label>' +
      '<textarea id="import-text" class="note-input" rows="5" spellcheck="false" placeholder=\'{"app":"browser-cookbook", ...}\'></textarea>' +
      '<div class="button-row"><button type="button" class="btn" data-action="import-text">Import pasted JSON</button></div></section>' +

      '<section class="lesson-section danger-zone"><h2 class="section-title">Reset</h2>' +
      '<p>Clear all progress and notes on this device. Export first if you might want them back.</p>' +
      '<button type="button" class="btn btn-danger" data-action="reset">Reset all progress</button></section>' +
      '</div>';
  }

  function viewNotFound() {
    return '<div class="page reading"><header class="page-header"><h1>Page not found</h1>' +
      '<p class="lede">That lesson or page doesn\u2019t exist.</p><p><a class="btn btn-primary" href="#/">Back to the dashboard</a></p></header></div>';
  }

  /* ------------------------------------------------------------------ */
  /* Router                                                             */
  /* ------------------------------------------------------------------ */

  let rendered = { view: null, id: null };

  function parseHash() {
    let raw = location.hash.replace(/^#\/?/, '');
    try { raw = decodeURIComponent(raw); } catch (err) { /* keep raw */ }
    const segs = raw.split('/').filter(Boolean);
    return { view: segs[0] || 'home', id: segs[1] || null, section: segs[2] || null };
  }

  /* A refresh re-renders without writing state, so two open tabs can't ping-pong storage events. */
  function route(options) {
    const r = parseHash();
    const refreshing = Boolean(options && options.refresh);
    closeNav();

    if (r.view === 'lesson') {
      const lesson = lessonById.get(r.id);
      if (!lesson) return show('notfound', null, viewNotFound(), 'Not found');
      if (rendered.view === 'lesson' && rendered.id === lesson.id) {
        scrollToSection(r.section);
        return;
      }
      copyRegistry = [];
      if (!refreshing && !isLessonDone(lesson.id) && state.currentLesson !== lesson.id) {
        state.currentLesson = lesson.id;
        saveState();
      }
      show('lesson', lesson.id, viewLesson(lesson), lessonLabel(lesson) + ': ' + lesson.title);
      scrollToSection(r.section);
      return;
    }

    copyRegistry = [];
    switch (r.view) {
      case 'home': return show('home', null, viewHome(), null);
      case 'playground': return show('playground', null, viewPlayground(), 'Playground');
      case 'notes': return show('notes', null, viewNotes(), 'Notes');
      case 'progress': return show('progress', null, viewProgress(), 'Progress');
      default: return show('notfound', null, viewNotFound(), 'Not found');
    }
  }

  function show(view, id, html, title) {
    flushNotes();
    rendered = { view: view, id: id };
    main.innerHTML = html;
    main.dataset.view = view;
    document.title = title ? title + ' · ' + COURSE.title : COURSE.title;
    renderSidebar();
    updateChrome();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
    updateReadingProgress();
  }

  /* Re-render the current view in place, keeping scroll position (even when the URL names a section) and focus. */
  function refresh() {
    const y = window.scrollY;
    const focus = focusSelector(document.activeElement);
    rendered = { view: null, id: null };
    route({ refresh: true });
    window.scrollTo(0, y);
    const again = focus && main.querySelector(focus);
    if (again) again.focus({ preventScroll: true });
  }

  function focusSelector(el) {
    if (!el || !el.dataset || !el.dataset.action || !main.contains(el)) return null;
    let selector = '[data-action="' + CSS.escape(el.dataset.action) + '"]';
    ['id', 'key', 'lang'].forEach(function (k) {
      if (el.dataset[k]) selector += '[data-' + k + '="' + CSS.escape(el.dataset[k]) + '"]';
    });
    return selector;
  }

  function scrollToSection(section) {
    if (!section) return;
    const el = document.getElementById('sec-' + section);
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    const toc = main.querySelector('.toc');
    if (toc) toc.open = false;
  }

  /* ------------------------------------------------------------------ */
  /* App chrome: progress bar, theme, navigation drawer                  */
  /* ------------------------------------------------------------------ */

  const root = document.documentElement;
  const menuBtn = document.getElementById('menu-btn');
  const themeBtn = document.getElementById('theme-btn');

  function updateChrome() {
    const lp = lessonProgress();
    document.getElementById('global-progress-fill').style.width = lp.pct + '%';
    const label = document.getElementById('global-progress-label');
    label.textContent = lp.pct + '%';
    label.parentElement.setAttribute('aria-label', 'Course progress: ' + lp.pct + '%, ' + lp.done + ' of ' + lp.total + ' lessons');
  }

  function applyTheme() {
    if (state.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', state.theme);
    themeBtn.textContent = { auto: 'Auto', light: 'Light', dark: 'Dark' }[state.theme];
    themeBtn.setAttribute('aria-label', 'Theme: ' + state.theme + '. Change theme');
  }

  function isDrawer() {
    return window.matchMedia('(max-width: 1023px)').matches;
  }

  function openNav() {
    document.body.classList.add('nav-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close navigation');
    const first = sidebar.querySelector('a');
    if (first) first.focus();
  }

  function closeNav() {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation');
  }

  let readingTicking = false;
  function updateReadingProgress() {
    readingTicking = false;
    const fill = document.getElementById('reading-fill');
    const article = main.querySelector('.lesson');
    if (!fill || !article) return;
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const pct = total > 0 ? Math.min(100, Math.max(0, (-rect.top / total) * 100)) : 100;
    fill.style.width = pct + '%';
  }

  /* ------------------------------------------------------------------ */
  /* Diagrams                                                           */
  /* ------------------------------------------------------------------ */

  function setDiagramStep(fig, step) {
    const def = COURSE.diagrams[fig.dataset.diagram];
    if (!def) return;
    const list = Diagrams.steps(def);
    const total = list.length;
    step = Math.max(-1, Math.min(total - 1, step));
    fig.dataset.step = String(step);
    fig.classList.toggle('is-stepping', step >= 0);

    fig.querySelectorAll('[data-idx]').forEach(function (el) {
      const i = Number(el.dataset.idx);
      el.classList.toggle('is-active', i === step);
      el.classList.toggle('is-past', step >= 0 && i < step);
      el.classList.toggle('is-future', step >= 0 && i > step);
      if (el.matches('button, [role="button"]')) el.setAttribute('aria-pressed', String(i === step));
    });

    fig.querySelector('.diagram-caption-label').textContent = step < 0 ? 'Overview' : 'Step ' + (step + 1) + ' · ' + list[step].label;
    fig.querySelector('.diagram-caption-detail').textContent = step < 0 ? (def.caption || '') : (list[step].detail || '');
    fig.querySelector('.diagram-counter').textContent = step < 0 ? total + ' steps' : (step + 1) + ' / ' + total;
    fig.querySelector('[data-action="diagram-prev"]').disabled = step < 0;
    const nextBtn = fig.querySelector('[data-action="diagram-next"]');
    nextBtn.disabled = step >= total - 1;
    nextBtn.textContent = step < 0 ? 'Step ›' : 'Next ›';
    fig.querySelector('[data-action="diagram-reset"]').hidden = step < 0;
  }

  /* ------------------------------------------------------------------ */
  /* Notes                                                              */
  /* ------------------------------------------------------------------ */

  const noteTimers = new Map();

  function commitNote(id, text) {
    noteTimers.delete(id);
    if (!lessonById.has(id)) return;
    const value = String(text).slice(0, LIMITS.noteChars);
    if (value.trim()) state.notes[id] = { text: value, updatedAt: new Date().toISOString() };
    else delete state.notes[id];
    saveState();
    document.querySelectorAll('[data-note-status="' + id + '"]').forEach(function (el) { el.innerHTML = noteStatusText(id); });
  }

  function onNoteInput(el) {
    const id = el.dataset.note;
    const status = document.querySelector('[data-note-status="' + id + '"]');
    if (status) status.textContent = 'Saving…';
    clearTimeout(noteTimers.get(id));
    noteTimers.set(id, setTimeout(function () { commitNote(id, el.value); }, 400));
  }

  function flushNotes() {
    if (!noteTimers.size) return;
    document.querySelectorAll('textarea[data-note]').forEach(function (el) {
      if (noteTimers.has(el.dataset.note)) {
        clearTimeout(noteTimers.get(el.dataset.note));
        commitNote(el.dataset.note, el.value);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Export / import                                                    */
  /* ------------------------------------------------------------------ */

  function exportPayload() {
    return JSON.stringify({ app: COURSE.id, version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), progress: state }, null, 2);
  }

  function downloadExport() {
    flushNotes();
    const blob = new Blob([exportPayload()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'browser-cookbook-progress-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Progress exported.');
  }

  function importText(text) {
    if (!text || !text.trim()) { toast('Nothing to import.'); return; }
    if (text.length > LIMITS.importBytes) { toast('That file is too large to be a progress export.'); return; }
    let data;
    try { data = JSON.parse(text); } catch (err) { toast('That is not valid JSON.'); return; }
    if (data && data.app && data.app !== COURSE.id) { toast('That export is from a different app.'); return; }
    const source = data && data.progress ? data.progress : data;
    if (!source || typeof source !== 'object' || !('completedLessons' in source || 'notes' in source || 'completedExercises' in source)) {
      toast('No Browser Cookbook progress found in that JSON.');
      return;
    }
    const incoming = sanitizeState(source);
    const summary = Object.keys(incoming.completedLessons).length + ' lessons, ' +
      Object.keys(incoming.completedExercises).length + ' tasks and ' + Object.keys(incoming.notes).length + ' notes';
    if (!window.confirm('Replace the progress on this device with the import (' + summary + ')?')) return;
    state = incoming;
    saveState();
    applyTheme();
    refresh();
    toast('Imported ' + summary + '.');
  }

  /* ------------------------------------------------------------------ */
  /* Toast                                                              */
  /* ------------------------------------------------------------------ */

  let toastTimer = null;
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Event handling (delegated)                                         */
  /* ------------------------------------------------------------------ */

  document.addEventListener('click', function (event) {
    if (event.target.closest('.skip-link')) {
      event.preventDefault(); // "#main" would otherwise be treated as a route
      main.focus();
      return;
    }

    const openToc = main.querySelector('.toc[open]');
    if (openToc && !event.target.closest('.toc')) openToc.open = false;

    const diagramEl = event.target.closest('.diagram [data-idx]');
    if (diagramEl) {
      const fig = diagramEl.closest('.diagram');
      const idx = Number(diagramEl.dataset.idx);
      setDiagramStep(fig, Number(fig.dataset.step) === idx ? -1 : idx);
      return;
    }

    const tocLink = event.target.closest('.toc-menu a');
    if (tocLink) {
      tocLink.closest('.toc').open = false;
      if (tocLink.getAttribute('href') === location.hash) { // no hashchange will fire, so scroll here
        event.preventDefault();
        scrollToSection(tocLink.dataset.toc);
      }
    }

    if (isDrawer() && document.body.classList.contains('nav-open') && event.target.closest('#scrim')) {
      closeNav();
      return;
    }

    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    switch (action) {
      case 'menu':
        if (document.body.classList.contains('nav-open')) closeNav(); else openNav();
        break;
      case 'theme': {
        const order = ['auto', 'light', 'dark'];
        state.theme = order[(order.indexOf(state.theme) + 1) % order.length];
        saveState();
        applyTheme();
        break;
      }
      case 'copy': {
        const text = copyRegistry[Number(actionEl.dataset.copy)];
        if (text === undefined) return;
        copyText(text).then(function (ok) {
          actionEl.textContent = ok ? 'Copied' : 'Failed';
          actionEl.classList.toggle('is-copied', ok);
          setTimeout(function () { actionEl.textContent = 'Copy'; actionEl.classList.remove('is-copied'); }, 1600);
        });
        break;
      }
      case 'expand-code': {
        const fig = actionEl.closest('.code');
        const collapsed = fig.classList.toggle('is-collapsed');
        actionEl.textContent = collapsed ? 'Show all ' + fig.querySelector('code').textContent.split('\n').length + ' lines' : 'Collapse';
        if (collapsed) fig.scrollIntoView({ block: 'nearest' });
        break;
      }
      case 'diagram-prev':
      case 'diagram-next':
      case 'diagram-reset': {
        const fig = actionEl.closest('.diagram');
        const step = Number(fig.dataset.step);
        setDiagramStep(fig, action === 'diagram-reset' ? -1 : step + (action === 'diagram-next' ? 1 : -1));
        break;
      }
      case 'toggle-lesson': {
        const id = actionEl.dataset.id;
        const lesson = lessonById.get(id);
        if (!lesson) return;
        if (isLessonDone(id)) {
          delete state.completedLessons[id];
          state.currentLesson = id;
          toast(lessonLabel(lesson) + ' marked as not complete.');
        } else {
          state.completedLessons[id] = new Date().toISOString();
          const next = firstIncompleteAfter(lesson);
          if (next) state.currentLesson = next.id;
          toast(lessonLabel(lesson) + ' complete.' + (next ? ' Up next: ' + lessonLabel(next) + '.' : ' Course complete!'));
        }
        saveState();
        refresh();
        break;
      }
      case 'filter-lang':
        playgroundFilter.lang = actionEl.dataset.lang;
        refresh();
        break;
      case 'open-note': {
        const select = document.getElementById('new-note-lesson');
        if (select && lessonById.has(select.value)) location.hash = lessonHref(lessonById.get(select.value), 'notes');
        break;
      }
      case 'export-download':
        downloadExport();
        break;
      case 'export-copy':
        flushNotes();
        copyText(exportPayload()).then(function (ok) { toast(ok ? 'Progress JSON copied.' : 'Copy failed. Use Download instead.'); });
        break;
      case 'import-text':
        importText(document.getElementById('import-text').value);
        break;
      case 'reset':
        if (window.confirm('Delete all progress and notes on this device? This cannot be undone.')) {
          const theme = state.theme;
          state = emptyState();
          state.theme = theme;
          saveState();
          refresh();
          toast('Progress reset.');
        }
        break;
      default:
        break;
    }
  });

  document.addEventListener('change', function (event) {
    const el = event.target;
    const action = el.dataset && el.dataset.action;
    if (action === 'toggle-task') {
      const key = el.dataset.key;
      if (!isKey(key)) return;
      if (el.checked) state.completedExercises[key] = new Date().toISOString();
      else delete state.completedExercises[key];
      saveState();
      const container = el.closest('.task, .experiment');
      if (container) container.classList.toggle('is-done', el.checked);
      document.querySelectorAll('input[data-key="' + key + '"]').forEach(function (other) { other.checked = el.checked; });
      updateTaskCounts();
    } else if (action === 'filter-lesson') {
      playgroundFilter.lesson = el.value;
      refresh();
    } else if (action === 'import-file') {
      const file = el.files && el.files[0];
      if (!file) return;
      if (file.size > LIMITS.importBytes) { toast('That file is too large to be a progress export.'); el.value = ''; return; }
      file.text().then(importText).catch(function () { toast('Could not read that file.'); });
      el.value = '';
    }
  });

  document.addEventListener('input', function (event) {
    if (event.target.matches('textarea[data-note]')) onNoteInput(event.target);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('nav-open')) { closeNav(); menuBtn.focus(); }
      const toc = main.querySelector('.toc[open]');
      if (toc) toc.open = false;
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.diagram [data-idx]:not(button)')) {
      event.preventDefault();
      event.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); // SVG elements have no .click()
    }
  });

  window.addEventListener('scroll', function () {
    if (!readingTicking) {
      readingTicking = true;
      window.requestAnimationFrame(updateReadingProgress);
    }
  }, { passive: true });

  window.addEventListener('hashchange', function () { route(); });
  window.addEventListener('pagehide', flushNotes);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flushNotes(); });

  /* Keep multiple open tabs in sync. If the user is working in this page, update it in place
     rather than re-rendering, so their focus, stepped diagrams and expanded code survive. */
  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY) return;
    state = loadState();
    applyTheme();
    const active = document.activeElement;
    if (!active || active === document.body || active === main) {
      refresh();
      return;
    }
    renderSidebar();
    updateChrome();
    document.querySelectorAll('input[data-action="toggle-task"]').forEach(function (el) {
      el.checked = isTaskDone(el.dataset.key);
      const container = el.closest('.task, .experiment');
      if (container) container.classList.toggle('is-done', el.checked);
    });
    updateTaskCounts();
  });

  /* Close the drawer if the viewport grows into desktop layout. */
  window.matchMedia('(max-width: 1023px)').addEventListener('change', function (mq) { if (!mq.matches) closeNav(); });

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */

  menuBtn.dataset.action = 'menu';
  themeBtn.dataset.action = 'theme';
  applyTheme();
  route();
})();
