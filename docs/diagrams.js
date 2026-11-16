/*
 * Diagram renderers. Each diagram definition lives in lessons.js under
 * COURSE.diagrams and has a `type`. Renderers return an HTML string whose
 * steppable elements carry data-idx="n". app.js drives the stepping.
 *
 * Types:
 *   sequence  { actors: [..], steps: [{ from, to, label, detail, dashed } | { note, label, detail }] }
 *   pipeline  { stages: [{ label, sub, detail }] }
 *   url       { parts: [{ text, label?, detail? }] }          (parts without label are separators)
 *   tree      { nodes: [{ depth, label, kind, detail }] }
 *   boxes     { groups: [{ label, sub, items: [{ label, detail }] }] }
 */
(function () {
  'use strict';

  const esc = window.Highlight.escapeHtml;

  /* Types whose later steps are hidden while stepping (a story unfolding). */
  const REVEAL_TYPES = { sequence: true, tree: true };

  function steps(def) {
    switch (def.type) {
      case 'sequence':
        return def.steps.map(function (s) { return { label: s.label, detail: s.detail }; });
      case 'pipeline':
        return def.stages.map(function (s) { return { label: s.label, detail: s.detail || s.sub }; });
      case 'url':
        return def.parts.filter(function (p) { return p.label; })
          .map(function (p) { return { label: p.label + ': ' + p.text, detail: p.detail }; });
      case 'tree':
        return def.nodes.map(function (n) { return { label: n.label, detail: n.detail }; });
      case 'boxes': {
        const out = [];
        def.groups.forEach(function (g) {
          g.items.forEach(function (item) { out.push({ label: g.label + ' › ' + item.label, detail: item.detail }); });
        });
        return out;
      }
      default:
        return [];
    }
  }

  function textWidth(text, size) {
    return text.length * size * 0.56;
  }

  function renderSequence(def) {
    const W = 360;
    const n = def.actors.length;
    const pad = n <= 2 ? 70 : n === 3 ? 50 : 32;
    const gap = n > 1 ? (W - 2 * pad) / (n - 1) : 0;
    const xs = def.actors.map(function (_, i) { return n === 1 ? W / 2 : pad + i * gap; });
    const boxW = Math.min(84, n > 1 ? gap - 4 : 84);
    const top = 34;
    const row = 40;
    const H = top + def.steps.length * row + 16;

    let svg = '<svg class="seq" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="' + esc(def.title) + '">';

    xs.forEach(function (x) {
      svg += '<line class="seq-life" x1="' + x + '" y1="' + (top - 4) + '" x2="' + x + '" y2="' + (H - 6) + '"/>';
    });
    def.actors.forEach(function (name, i) {
      svg += '<g class="seq-actor"><rect x="' + (xs[i] - boxW / 2) + '" y="4" width="' + boxW + '" height="24" rx="5"/>' +
        '<text x="' + xs[i] + '" y="20">' + esc(name) + '</text></g>';
    });

    def.steps.forEach(function (step, i) {
      const y = top + 26 + i * row;
      let g = '<g class="seq-step" data-idx="' + i + '" tabindex="0" role="button" aria-label="Step ' + (i + 1) + ': ' + esc(step.label) + '">';
      g += '<rect class="seq-hit" x="0" y="' + (y - 24) + '" width="' + W + '" height="' + row + '"/>';
      if (step.note !== undefined) {
        const w = Math.min(W - 8, textWidth(step.label, 10.5) + 18);
        const x = Math.max(4, Math.min(W - 4 - w, xs[step.note] - w / 2));
        g += '<rect class="seq-note" x="' + x + '" y="' + (y - 16) + '" width="' + w + '" height="22" rx="4"/>';
        g += '<text class="seq-note-text" x="' + (x + w / 2) + '" y="' + (y - 1) + '">' + esc(step.label) + '</text>';
      } else {
        const x1 = xs[step.from];
        const x2 = xs[step.to];
        const dir = x2 > x1 ? 1 : -1;
        const sx = x1 + dir * 3;
        const ex = x2 - dir * 3;
        g += '<line class="seq-line' + (step.dashed ? ' is-dashed' : '') + '" x1="' + sx + '" y1="' + y + '" x2="' + ex + '" y2="' + y + '"/>';
        g += '<polygon class="seq-head" points="' + ex + ',' + y + ' ' + (ex - dir * 8) + ',' + (y - 4) + ' ' + (ex - dir * 8) + ',' + (y + 4) + '"/>';
        g += '<text class="seq-label" x="' + (x1 + x2) / 2 + '" y="' + (y - 6) + '">' + esc(step.label) + '</text>';
      }
      svg += g + '</g>';
    });

    return svg + '</svg>';
  }

  function renderPipeline(def) {
    return '<ol class="pipe">' + def.stages.map(function (s, i) {
      return '<li class="pipe-stage" data-idx="' + i + '" tabindex="0" role="button">' +
        '<span class="pipe-num">' + (i + 1) + '</span>' +
        '<span class="pipe-text"><span class="pipe-label">' + esc(s.label) + '</span>' +
        (s.sub ? '<span class="pipe-sub">' + esc(s.sub) + '</span>' : '') + '</span></li>';
    }).join('') + '</ol>';
  }

  function renderUrl(def) {
    let idx = 0;
    let line = '';
    let legend = '';
    def.parts.forEach(function (p) {
      if (!p.label) {
        line += '<span class="url-sep">' + esc(p.text) + '</span>';
        return;
      }
      const cls = 'url-c' + (idx % 7);
      // The legend chips below are the keyboard controls; the parts are clickable for pointer users.
      line += '<span class="url-part ' + cls + '" data-idx="' + idx + '">' + esc(p.text) + '</span>';
      legend += '<li><button type="button" class="url-chip ' + cls + '" data-idx="' + idx + '">' + esc(p.label) + '</button></li>';
      idx++;
    });
    return '<div class="url-line"><code>' + line + '</code></div><ul class="url-legend">' + legend + '</ul>';
  }

  function renderTree(def) {
    return '<ul class="tree">' + def.nodes.map(function (node, i) {
      return '<li class="tree-node tree-' + esc(node.kind || 'element') + '" style="--depth:' + Number(node.depth || 0) + '" data-idx="' + i + '" tabindex="0" role="button">' +
        '<code>' + esc(node.label) + '</code></li>';
    }).join('') + '</ul>';
  }

  function renderBoxes(def) {
    let idx = 0;
    return '<div class="boxes">' + def.groups.map(function (g) {
      const items = g.items.map(function (item) {
        return '<li class="box-item" data-idx="' + (idx++) + '" tabindex="0" role="button">' + esc(item.label) + '</li>';
      }).join('');
      return '<section class="box-group"><h4>' + esc(g.label) + '</h4>' +
        (g.sub ? '<p>' + esc(g.sub) + '</p>' : '') + '<ul>' + items + '</ul></section>';
    }).join('') + '</div>';
  }

  const RENDERERS = { sequence: renderSequence, pipeline: renderPipeline, url: renderUrl, tree: renderTree, boxes: renderBoxes };

  function render(id, def) {
    if (!def || !RENDERERS[def.type]) {
      return '<div class="callout callout-warn"><p>Missing diagram: ' + esc(String(id)) + '</p></div>';
    }
    const total = steps(def).length;
    return '<figure class="diagram diagram--' + def.type + (REVEAL_TYPES[def.type] ? ' diagram--reveal' : '') +
      '" data-diagram="' + esc(id) + '" data-step="-1">' +
      '<figcaption class="diagram-title">' + esc(def.title) + '</figcaption>' +
      '<div class="diagram-canvas">' + RENDERERS[def.type](def) + '</div>' +
      '<div class="diagram-caption" aria-live="polite"><p class="diagram-caption-label">Overview</p>' +
      '<p class="diagram-caption-detail">' + esc(def.caption || '') + '</p></div>' +
      '<div class="diagram-controls">' +
      '<button type="button" class="btn btn-small" data-action="diagram-prev" aria-label="Previous step" disabled>‹ Prev</button>' +
      '<span class="diagram-counter">' + total + ' steps</span>' +
      '<button type="button" class="btn btn-small btn-primary" data-action="diagram-next" aria-label="Next step">Step ›</button>' +
      '<button type="button" class="btn btn-small btn-ghost" data-action="diagram-reset" hidden>Show all</button>' +
      '</div></figure>';
  }

  window.Diagrams = { render: render, steps: steps };
})();
