/*
 * A tiny regex-based syntax highlighter. No dependencies.
 *
 * Each language is an ordered list of [className, RegExp]. Rules are combined
 * into one alternation, so earlier rules win at the same position. Rule
 * patterns must not contain capturing groups: use (?:...) instead.
 */
(function () {
  'use strict';

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  const LANGUAGES = {
    python: [
      ['com', /#[^\n]*/],
      ['str', /(?:\b[rbfuRBFU]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/],
      ['dec', /@[\w.]+/],
      ['kw', /\b(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|match|case)\b/],
      ['bi', /\b(?:print|len|range|str|int|float|bytes|bytearray|dict|list|tuple|set|max|min|isinstance|open|super|self|enumerate|sorted|repr|iter|next|zip|map|filter|ValueError|TypeError|KeyError|OSError|TimeoutError|Exception)\b/],
      ['num', /\b(?:0x[\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?)\b/],
      ['fn', /\b[A-Za-z_]\w*(?=\()/],
    ],
    rust: [
      ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
      ['str', /b?r#*"[\s\S]*?"#*|b?"(?:\\.|[^"\\])*"|b?'(?:\\.|[^'\\])'/],
      ['life', /'[a-z_]\w*/],
      ['kw', /\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while)\b/],
      ['mac', /\b[a-z_]\w*!/],
      ['ty', /\b[A-Z][A-Za-z0-9_]*\b/],
      ['num', /\b\d[\d_]*(?:\.\d+)?(?:[iu](?:8|16|32|64|128|size)|f32|f64)?\b/],
      ['fn', /\b[a-z_]\w*(?=\()/],
    ],
    shell: [
      ['com', /(?:^|[ \t])#[^\n]*/],
      ['str', /"(?:\\.|[^"\\])*"|'[^']*'/],
      ['var', /\$\{?\w+\}?/],
      ['kw', /(?:^|\|\s*|&&\s*|;\s*|\(\s*)(?:sudo|cd|export|echo|python3|python|cargo|git|curl|dig|openssl|nc|printf|tcpdump|sleep|head|tail|grep|awk|sed|cat|brew|node|rustup|pip)\b/],
      ['flag', /(?:^|[ \t])--?[\w-]+/],
    ],
    http: [
      ['kw', /^(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT|TRACE)\b/],
      ['num', /^HTTP\/\d(?:\.\d)?[ \t]+\d{3}/],
      ['attr', /^[A-Za-z][\w-]*(?=:)/],
      ['str', /"(?:\\.|[^"\\])*"/],
    ],
    json: [
      ['attr', /"(?:\\.|[^"\\])*"(?=\s*:)/],
      ['str', /"(?:\\.|[^"\\])*"/],
      ['kw', /\b(?:true|false|null)\b/],
      ['num', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/],
    ],
  };
  LANGUAGES.bash = LANGUAGES.shell;
  LANGUAGES.sh = LANGUAGES.shell;

  const compiled = {};

  function compile(lang) {
    if (compiled[lang]) return compiled[lang];
    const rules = LANGUAGES[lang];
    if (!rules) return null;
    const source = rules.map(function (rule) { return '(' + rule[1].source + ')'; }).join('|');
    compiled[lang] = { regex: new RegExp(source, 'gm'), classes: rules.map(function (rule) { return rule[0]; }) };
    return compiled[lang];
  }

  function highlight(code, lang) {
    const spec = compile(lang);
    if (!spec) return escapeHtml(code);
    const regex = spec.regex;
    regex.lastIndex = 0;
    let out = '';
    let last = 0;
    let match;
    while ((match = regex.exec(code)) !== null) {
      if (match[0] === '') { regex.lastIndex++; continue; }
      let group = 1;
      while (match[group] === undefined) group++;
      out += escapeHtml(code.slice(last, match.index));
      out += '<span class="tok-' + spec.classes[group - 1] + '">' + escapeHtml(match[0]) + '</span>';
      last = match.index + match[0].length;
    }
    return out + escapeHtml(code.slice(last));
  }

  window.Highlight = { highlight: highlight, escapeHtml: escapeHtml, languages: Object.keys(LANGUAGES) };
})();
