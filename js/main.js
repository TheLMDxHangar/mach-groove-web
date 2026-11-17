/* ==========================================================================
   Mach Groove — mission-log typewriter for the hero terminal.
   Lines mirror the real strings in the app's SequenceManager.
   ========================================================================== */
(function () {
  'use strict';

  // ---------- Nav: hamburger ----------
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menu.classList.toggle('is-open', !open);
    });
    // Close after choosing an in-page link.
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && menu.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        menu.classList.remove('is-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle.click();
    });
  }

  // ---------- Nav: active-section highlight ----------
  var sectionLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[data-section]'));
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    sectionLinks.forEach(function (a) { byId[a.getAttribute('data-section')] = a; });
    var visible = {};
    // B-0061 (Dom): the last section (Socials) sits at the bottom of the page
    // and can never scroll up into the middle band the observer watches, so
    // its link never lit — at the very bottom, the last linked section wins.
    var lastId = sectionLinks[sectionLinks.length - 1].getAttribute('data-section');
    function atBottom() {
      return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    }
    function paint() {
      var best = null, bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; best = id; }
      });
      if (atBottom()) { best = lastId; }
      sectionLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('data-section') === best);
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      paint();
    }, { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
    window.addEventListener('scroll', paint, { passive: true });
  }

  // ---------- Launch alerts form ----------
  // IV-0024: posts to mach-groove-api's POST /launch-alerts (the form's
  // `action`), which saves one Firestore document per email. The honeypot
  // goes along too, so the server drops bots even if this script is skipped.
  var form = document.getElementById('launch-alerts');
  if (form) {
    var status = form.querySelector('.alerts__status');
    // IV-0085: the form answers like the mission log. Each answer is a
    // groove line — tone colors the prompt (ok green, warn yellow, err red,
    // info gray), the command is bold, the words quieter, --flags never
    // break. Lines TYPE in (20ms a character, as in the app) and stack:
    // "groove transmitting" stays on screen and the result types in under
    // it, so a visitor sees both (Dom: "let the user actually experience it").
    var motionOK = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var TYPE_MS = 20, HOLD_MS = 900;   // HOLD_MS: least time "transmitting" shows
    var run = 0;                       // a new submit cancels an old line mid-type
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var clear = function () { run++; status.textContent = ''; status.className = 'alerts__status mono'; };
    var say = function (tone, cmd, words) {
      var mine = run;
      var row = document.createElement('div');
      row.className = 'alerts__line is-' + tone;
      var prompt = document.createElement('span');
      prompt.className = 'alerts__prompt';
      prompt.textContent = '>';
      var line = document.createElement('span');
      row.appendChild(prompt);
      row.appendChild(line);
      status.appendChild(row);
      // [node, text] pairs to type, in order.
      var c = document.createElement('span');
      c.className = 'alerts__cmd';
      line.appendChild(c);
      var parts = [[c, cmd]];
      words.split(' ').forEach(function (w) {
        var n;
        if (w.indexOf('--') === 0) { n = document.createElement('span'); n.className = 'alerts__flag'; }
        else { n = document.createElement('span'); }
        line.appendChild(n);
        parts.push([n, ' ' + w]);
      });
      if (!motionOK) {
        parts.forEach(function (p) { p[0].textContent = p[1]; });
        return Promise.resolve();
      }
      var cursor = document.createElement('span');
      cursor.className = 'alerts__cursor';
      return new Promise(function (done) {
        var pi = 0, ci = 0;
        (function tick() {
          if (mine !== run) return;
          if (pi >= parts.length) { if (cursor.parentNode) cursor.parentNode.removeChild(cursor); done(); return; }
          var node = parts[pi][0], text = Array.from(parts[pi][1]);
          if (cursor.parentNode !== line) line.appendChild(cursor);
          if (ci < text.length) { node.textContent += text[ci++]; setTimeout(tick, TYPE_MS); }
          else { pi++; ci = 0; tick(); }
        })();
      });
    };
    var locked = function () { return say('ok', 'groove locked', 'we’ll ping you at launch --countdown'); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type=email]');
      var android = form.querySelector('input[name=android]');
      var spotify = form.querySelector('input[name=spotify]');
      var honeypot = form.querySelector('input[name=callsign]');
      clear();
      // Bots fill the hidden field; pretend it worked and drop it on the floor.
      if (honeypot && honeypot.value) {
        say('info', 'groove transmitting', 'your sign-up… --steady').then(function () { return wait(HOLD_MS); }).then(locked);
        return;
      }
      if (!email.value || !email.checkValidity()) {
        say('err', 'groove no-signal', 'enter a valid email, pilot');
        email.focus();
        return;
      }
      var action = form.getAttribute('action');
      if (!action) {
        say('err', 'groove no-uplink', 'sign-ups aren’t connected yet · try again soon');
        return;
      }
      var mine = run;
      var shown = say('info', 'groove transmitting', 'your sign-up… --steady').then(function () { return wait(HOLD_MS); });
      var sent = fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          platforms: android && android.checked ? ['ios', 'android'] : ['ios'],
          spotify: !!(spotify && spotify.checked),
          source: 'mach-groove.app',
          callsign: honeypot ? honeypot.value : ''
        })
      }).then(function (r) {
        if (r.status === 429) return 'slow';
        return r.ok ? 'ok' : 'fail';
      }, function () { return 'fail'; });
      // The result waits for the first line to finish and hold, then types under it.
      Promise.all([sent, shown]).then(function (res) {
        if (mine !== run) return;
        if (res[0] === 'ok') { form.reset(); locked(); }
        else if (res[0] === 'slow') say('warn', 'groove hold', 'too many tries · wait a few minutes --cool-your-jets');
        else say('err', 'groove transmission-failed', 'try again --retry');
      });
    });
  }

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- Hero mission log ----------
  var log = document.getElementById('mission-log');
  if (!log) return;

  // IV-0085: the app's mission log as it reads today (SequenceManager,
  // IV-0067): every tag prints as a `groove` command, details end in
  // --flags. YouTube Music → Apple Music, Songs mode. Tags stay in the app's
  // caps here and go through grooveCommand() on screen, like the app. The
  // loop alternates CRUISE (pilot lines) and PILOT (every track gets its
  // scanning + locked lines), like tapping the chip in the app.
  //   div:   a phase divider
  //   phase: prompt (a) · glyph (g) · bold command (k) · quieter detail (s)
  //   track: a tucked-in line — quiet command (k) + bright detail (s)
  //   scan:  the live tally, counting up in place; exception lines type
  //          below it and land above it (in PILOT, every track's scanning
  //          and locked lines land above it too), like the app
  // `beam` / `p` drive the rocket (see setBeam).
  // IV-0085: Dom's Grown Folks Gravity (R&B love songs + one gospel), in
  // his play order. NEAR / MISS pick the scan's near match and the miss the
  // pilot resolves during the hold (1-based track numbers).
  var PLAYLIST = 'Grown Folks Gravity';
  var TRACKS = ['With Each Beat of My Heart', 'You Put a Move on My Heart',
                'If Only for One Night', 'Jesus Is a Love Song', 'Butterflies',
                'You Don\u2019t Know My Name', 'Come Over', 'You Give Good Love',
                'Twenty Foreplay', 'Mystery'];
  var NEAR = 6, NEAR_AS = ' (Radio Edit)';
  var MISS = 4, MISS_PICK = ' (Live)';
  var N = TRACKS.length;
  var SCRIPT = [
    { kind: 'div',   s: 'HANDSHAKE' },
    { kind: 'phase', a: 'info', g: 'uplink',   k: 'UPLINK',           s: 'YouTube Music → Apple Music',                                   pause: 500, beam: 'scanning', p: 0.02 },
    { kind: 'phase', a: 'info', g: 'cargo',    k: 'CARGO',            s: N + ' tracks · from ' + PLAYLIST + ' → to ' + PLAYLIST + ' --fresh --smooth', pause: 600, p: 0.05 },
    { kind: 'div',   s: 'SCAN' },
    { kind: 'phase', a: 'info', g: 'songs',    k: 'SONGS MODE',       s: 'same songs → Apple Music --exact --smooth',                     pause: 500, p: 0.07 },
    { kind: 'scan',  p0: 0.08, p1: 0.78, step: 1100, read: 900,
      notes: {} },
    { kind: 'phase', a: 'warn', g: 'scan',     k: 'SCAN COMPLETE',    s: (N - 1) + ' matched · 1 missed --locked-in',                       pause: 500, p: 0.82 },
    { kind: 'div',   s: 'HOLD' },
    { kind: 'phase', a: 'warn', g: 'hold',     k: 'AWAITING PILOT',   s: '1 song needs your call · cargo holding --hold-your-horses',        pause: 1200, p: 0.86 },
    { kind: 'track', a: 'ok',   k: 'PILOT RESOLVED',                  s: TRACKS[MISS - 1] + ' → ' + TRACKS[MISS - 1] + MISS_PICK + ' --your-pick',  pause: 600, p: 0.9 },
    { kind: 'track', a: 'info', k: 'RESOLVED',                        s: '--back-on-course',                                                   pause: 400 },
    { kind: 'div',   s: 'DELIVERY' },
    { kind: 'phase', a: 'info', g: 'deliver',  k: 'DELIVERING',       s: N + ' tracks → Apple Music --cool-your-jets',                      pause: 700, beam: 'delivering', p: 0.96 },
    { kind: 'phase', a: 'ok',   g: 'verified', k: 'VERIFIED',         s: N + '/' + N + ' in playlist --wheels-down',                            pause: 400, beam: 'verified', p: 1.0 },
    { kind: 'phase', a: 'ok',   g: 'complete', k: 'MISSION COMPLETE', s: PLAYLIST + ' landed --smooth-flight',                                  pause: 3200, p: 1.0 }
  ];

  var scanLine = SCRIPT.filter(function (l) { return l.kind === 'scan'; })[0];
  scanLine.notes[NEAR] = { a: 'warn', k: 'NEAR MATCH', s: TRACKS[NEAR - 1] + ' \u2192 ' + TRACKS[NEAR - 1] + NEAR_AS + ' --close-enough', near: true };
  scanLine.notes[MISS] = { a: 'err',  k: 'NO SIGNAL',  s: TRACKS[MISS - 1] + ' --not-found', miss: true };

  // GrooveCommand.display: "NEAR MATCH" → "groove near-match",
  // "SCANNING 3/7" → "groove scanning 3/7" (words up to the first one
  // with a digit are the command, hyphen-joined, lowercase).
  function grooveCommand(tag) {
    var words = tag.split(' ').filter(Boolean), verb = [];
    while (verb.length < words.length && !/\d/.test(words[verb.length])) verb.push(words[verb.length]);
    return ['groove', verb.join('-').toLowerCase()].concat(words.slice(verb.length))
      .filter(Boolean).join(' ');
  }
  // GrooveCommand.unbreakFlags: a flag's hyphens go non-breaking (U+2011)
  // so a flag wraps whole.
  function unbreakFlags(text) {
    return text.split(' ').map(function (w) {
      return w.indexOf('--') === 0 ? w.replace(/-/g, '‑') : w;
    }).join(' ');
  }

  var view = 'cruise';   // flips each loop
  var chip = document.getElementById('log-chip');
  var chipLabel = document.getElementById('log-chip-label');
  function setView(v) {
    view = v;
    if (chipLabel) chipLabel.textContent = v === 'pilot' ? 'PILOT' : 'CRUISE';
    if (chip) chip.classList.toggle('is-pilot', v === 'pilot');
  }

  // IV-0048: like the app, the beam is driven by the sequence. `p` is the
  // progress the rocket's nose rides (it docks at 100%; IV-0051: no park on
  // the pilot-hold lines — Dom wants one smooth flight); `beam` sets the
  // ear-cup light (.beam[data-state]).
  var beam = document.getElementById('beam');
  function setBeam(line) {
    if (!beam) return;
    if (line.beam) beam.setAttribute('data-state', line.beam);
    if (line.p != null) beam.style.setProperty('--beam-progress', line.p);
  }

  // SequenceManager: 20ms a character, a whole line capped at 1.2s.
  var CHAR_MS = 20, LINE_MAX_MS = 1200;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // IV-0051: the equalizer exhaust (Dom's pick "G"). Each frame the thin fill
  // runs to the rocket's tail and EQ bars bounce right behind it, fading out
  // TAIL px back and shading green to blue along the track. The bars rest
  // while the rocket is parked (pilot hold) or docked, like its own exhaust.
  var track = beam && beam.querySelector('.beam__track');
  var rocket = beam && beam.querySelector('.beam__rocket');
  var fill = beam && beam.querySelector('.beam__fill');
  var eq = beam && beam.querySelector('.beam__eq');
  if (track && rocket && fill && eq) {
    var GAP = 6, TAIL = 110, bars = [];
    var buildBars = function () {
      eq.innerHTML = ''; bars = [];
      var n = Math.ceil(track.clientWidth / GAP) + 1;
      for (var i = 0; i < n; i++) {
        var b = document.createElement('i');
        b.style.left = (i * GAP) + 'px';
        eq.appendChild(b); bars.push(b);
      }
    };
    var tint = function (f) {   // --mach-green → --mach-blue
      return 'rgb(' + Math.round(100 * f) + ',' + Math.round(255 - 45 * f) + ',' + Math.round(120 + 135 * f) + ')';
    };
    buildBars();
    window.addEventListener('resize', buildBars);
    var frame = function (t) {
      // The rocket is an <svg> (no offsetLeft), so measure it against the track.
      var w = track.clientWidth;
      var tailEnd = rocket.getBoundingClientRect().left - track.getBoundingClientRect().left + 6;
      var state = beam.getAttribute('data-state');
      var resting = reduced || state === 'holding' || state === 'verified';
      fill.style.width = Math.max(0, tailEnd) + 'px';
      for (var i = 0; i < bars.length; i++) {
        var bx = i * GAP, back = tailEnd - bx, s = bars[i].style;
        if (resting || bx > tailEnd || back > TAIL) { s.height = '0px'; continue; }
        var a = 1 - back / TAIL;
        // Dom: ~13% shorter than the mock-up, so the burst doesn't crowd the rocket.
        var h = (4 + Math.abs(Math.sin(t / 180 + i * 0.9) * Math.sin(t / 430 + i * 0.37)) * 20 * (0.4 + 0.6 * a)) * 0.87;
        s.height = h.toFixed(1) + 'px';
        s.opacity = a.toFixed(2);
        s.background = tint(Math.min(bx / w, 1));
      }
      if (!reduced) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function glyph(name) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'log-row__glyph' + (name === 'deliver' ? ' log-row__glyph--wide' : ''));
    var use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#lg-' + name);
    svg.appendChild(use);
    return svg;
  }
  // Builds a line; returns the spans the typewriter fills, in order.
  function build(line) {
    if (line.kind === 'div') {
      var d = el('div', 'log-div', line.s);
      log.appendChild(d);
      return { row: d, parts: [] };
    }
    var row = el('div', 'log-row' + (line.kind === 'phase' ? '' : ' log-row--track'));
    row.appendChild(el('span', 'log-row__arrow log-row__arrow--' + line.a, '>'));
    if (line.kind === 'phase') row.appendChild(glyph(line.g));
    var text = el('span', 'log-row__text');
    var k = el('span', line.kind === 'phase' ? 'log-row__k' : 'log-row__d');
    var rest = el('span', line.kind === 'phase' ? 'log-row__d' : 'log-row__name');
    text.appendChild(k); text.appendChild(rest);
    row.appendChild(text);
    log.appendChild(row);
    var detail = line.s ? ' ' + unbreakFlags(line.s) : '';
    return { row: row, parts: [[k, line.k ? grooveCommand(line.k) : ''], [rest, detail]] };
  }
  // ScanTally: "groove scanning 3/7" bold, the counts quieter, lowercase.
  function tallyText(n, locked, near, miss) {
    var parts = ['\u00b7 ' + locked + ' locked'];
    if (near) parts.push(near + ' near');
    if (miss) parts.push(miss + ' miss');
    return [grooveCommand('SCANNING ' + n + '/' + N), ' ' + parts.join(' \u00b7 ')];
  }

  // Old rows scroll off the top whole: drop any row the box has cut into.
  function trim() {
    var top = log.getBoundingClientRect().top + 11;   // inside the 12px padding
    while (log.children.length > 1 && log.firstChild.getBoundingClientRect().top < top) {
      log.removeChild(log.firstChild);
    }
  }

  // Reduced motion: dump the whole log, no typing, no loop.
  if (reduced) {
    setBeam({ beam: 'verified', p: 1 });
    SCRIPT.forEach(function (line) {
      if (line.kind === 'scan') {
        Object.keys(line.notes).forEach(function (n) {
          var b = build({ kind: 'track', a: line.notes[n].a, k: line.notes[n].k, s: line.notes[n].s });
          b.parts.forEach(function (pt) { pt[0].textContent = pt[1]; });
        });
        return;
      }
      build(line).parts.forEach(function (pt) { pt[0].textContent = pt[1]; });
    });
    return;
  }

  var cursor = el('span', 'cursor');

  // Types each [span, text] pair in turn, then calls done.
  function typeParts(parts, done) {
    var pi = 0, chars = [], ci = 0;
    var total = parts.reduce(function (n, pt) { return n + Array.from(pt[1]).length; }, 0);
    var ms = Math.min(CHAR_MS, LINE_MAX_MS / Math.max(total, 1));
    function next() {
      if (pi >= parts.length) { if (cursor.parentNode) cursor.parentNode.removeChild(cursor); done(); return; }
      chars = Array.from(parts[pi][1]); ci = 0;
      parts[pi][0].appendChild(cursor);
      tick();
    }
    function tick() {
      var span = parts[pi][0];
      if (ci < chars.length) {
        span.insertBefore(document.createTextNode(chars[ci]), cursor);
        ci++;
        trim();   // a line that wraps as it types pushes the top row off
        setTimeout(tick, ms);
      } else { pi++; next(); }
    }
    next();
    // The block stays on the line until it lands, then leaves (as in the app).
  }

  // The live tally: one row, rewritten in place each step. Track lines
  // type below it and land above it. IV-0085 (Dom): paced so a reader can
  // take in every song — CRUISE counts one track every `step` ms; PILOT
  // types each track's scanning + locked lines (the app lands those
  // silently; on the site they type so they don't pop in from nowhere)
  // and holds `read` ms on each. Removed when the scan ends, as in the app.
  function runScan(line, done) {
    var tally = build({ kind: 'phase', a: 'ok', g: 'scan', k: '', s: '' });
    var locked = 0, near = 0, miss = 0, n = 0;
    function typeAbove(l, then) {
      var b = build({ kind: 'track', a: l.a, k: l.k, s: l.s });
      trim();
      typeParts(b.parts, function () {
        log.insertBefore(b.row, tally.row);
        trim();
        then();
      });
    }
    function paintTally() {
      var t = tallyText(n, locked, near, miss);
      tally.parts[0][0].textContent = t[0];
      tally.parts[1][0].textContent = t[1];
    }
    function next() {
      if (n < N) setTimeout(step, view === 'pilot' ? line.read : line.step);
      else setTimeout(function () { log.removeChild(tally.row); done(); }, 900);
    }
    function verdict() {
      var note = line.notes[n];
      if (note) {
        if (note.near) near++; else if (note.miss) miss++;
        paintTally();
        typeAbove(note, function () { setTimeout(next, view === 'pilot' ? 0 : line.read); });
        return;
      }
      locked++;
      paintTally();
      if (view === 'pilot') typeAbove({ a: 'ok', k: 'LOCKED', s: TRACKS[n - 1] + ' --dialed-in' }, next);
      else next();
    }
    function step() {
      n++;
      paintTally();
      setBeam({ p: line.p0 + (line.p1 - line.p0) * n / N });
      trim();
      if (view === 'pilot') typeAbove({ a: 'info', k: 'SCANNING ' + n + '/' + N, s: TRACKS[n - 1] + ' --tuning-in' }, verdict);
      else verdict();
    }
    step();
  }

  function typeLine(index) {
    if (index >= SCRIPT.length) {
      // loop
      setTimeout(function () {
        log.innerHTML = '';
        setView(view === 'cruise' ? 'pilot' : 'cruise');
        // Back to the pad without flying backwards across the beam.
        if (beam) beam.classList.add('beam--reset');
        setBeam({ beam: 'scanning', p: 0 });
        setTimeout(function () {
          if (beam) beam.classList.remove('beam--reset');
          typeLine(0);
        }, 50);
      }, 800);
      return;
    }

    var line = SCRIPT[index];
    if (line.kind === 'scan') { runScan(line, function () { typeLine(index + 1); }); return; }
    setBeam(line);
    var built = build(line);
    trim();
    if (line.kind === 'div') { setTimeout(function () { typeLine(index + 1); }, 150); return; }
    typeParts(built.parts, function () {
      setTimeout(function () { typeLine(index + 1); }, line.pause);
    });
  }

  typeLine(0);
})();
