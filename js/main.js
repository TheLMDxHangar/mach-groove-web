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
  // GitHub Pages has no backend. Point the form's `action` at a Formspree /
  // Buttondown endpoint to go live; until then it explains itself instead
  // of failing silently.
  var form = document.getElementById('launch-alerts');
  if (form) {
    var status = form.querySelector('.alerts__status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type=email]');
      var android = form.querySelector('input[name=android]');
      var honeypot = form.querySelector('input[name=callsign]');
      status.className = 'alerts__status mono';
      // Bots fill the hidden field; pretend it worked and drop it on the floor.
      if (honeypot && honeypot.value) {
        status.textContent = '🎯 TARGET LOCKED. WE\'LL PING YOU AT LAUNCH.';
        status.classList.add('is-ok');
        return;
      }
      if (!email.value || !email.checkValidity()) {
        status.textContent = 'ENTER A VALID EMAIL, PILOT.';
        status.classList.add('is-err');
        email.focus();
        return;
      }
      var action = form.getAttribute('action');
      if (!action) {
        status.textContent = 'UPLINK NOT CONFIGURED YET — TRY AGAIN SOON.';
        status.classList.add('is-err');
        return;
      }
      status.textContent = 'TRANSMITTING...';
      fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          platforms: android && android.checked ? ['ios', 'android'] : ['ios'],
          source: 'mach-groove.app'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        status.textContent = '🎯 TARGET LOCKED. WE\'LL PING YOU AT LAUNCH.';
        status.classList.add('is-ok');
        form.reset();
      }).catch(function () {
        status.textContent = 'TRANSMISSION FAILED — TRY AGAIN.';
        status.classList.add('is-err');
      });
    });
  }

  // ---------- Footer year ----------
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- Hero mission log ----------
  var log = document.getElementById('mission-log');
  if (!log) return;

  // B-0064: the app's IV-0053 mission log — a real run's wording
  // (SequenceManager), YouTube Music → Apple Music, Songs mode, Dom's
  // New Jack Classics playlist. The loop alternates CRUISE (phase lines +
  // exceptions) and PILOT (every track gets its own line), like tapping
  // the chip in the app.
  //   div:   a phase divider
  //   phase: prompt (a) · glyph (g) · bold keyword (k) · quieter detail (s)
  //   track: a tucked-in per-track line — caps tag (k) + track name (s)
  //   scan:  the live tally, counting up in place; exception lines (and in
  //          PILOT, every lock) print above it, like the app
  //   pilotOnly: shown in the PILOT loop only
  // `beam` / `p` drive the rocket (see setBeam).
  var TRACKS = ['Groove Me', 'Is It Good to You', 'Alright', 'Remember the Time',
                'Don\u2019t Walk Away', 'Ready or Not', 'Roni'];
  var SCRIPT = [
    { kind: 'div',   s: 'HANDSHAKE' },
    { kind: 'phase', a: 'ok',   g: 'uplink',   k: 'UPLINK',           s: 'YouTube Music \u2192 Apple Music',                                  pause: 500, beam: 'scanning', p: 0.02 },
    { kind: 'phase', a: 'ok',   g: 'cargo',    k: 'CARGO',            s: '7 tracks from New Jack Classics \u2192 new playlist New Jack Classics', pause: 600, p: 0.05 },
    { kind: 'div',   s: 'SCAN' },
    { kind: 'phase', a: 'info', g: 'songs',    k: 'SONGS MODE',       s: 'the same songs, matched on Apple Music',                          pause: 500, p: 0.07 },
    { kind: 'scan',  p0: 0.08, p1: 0.78, step: 420,
      notes: { 2: { a: 'warn', k: 'FUZZY MATCH', s: 'Is It Good to You \u2192 Is It Good to You (feat. Tammy Lucas) (88%)', near: true },
               7: { a: 'err',  k: 'NO SIGNAL',  s: 'Roni', miss: true } } },
    { kind: 'phase', a: 'ok',   g: 'scan',     k: 'SCAN COMPLETE',    s: '6 matched. 1 failed',                                            pause: 500, p: 0.82 },
    { kind: 'div',   s: 'HOLD' },
    { kind: 'phase', a: 'warn', g: 'hold',     k: 'AWAITING PILOT',   s: '1 unresolved target \u00b7 payload holding',                        pause: 1200, p: 0.86 },
    { kind: 'track', a: 'ok',   k: 'PILOT RESOLVED',                  s: 'Roni \u2192 Roni (Single Version)',                                pause: 600, p: 0.9 },
    { kind: 'track', a: 'info', k: 'RESOLVED',                        s: 'resuming sequence',                                              pause: 400 },
    { kind: 'div',   s: 'DELIVERY' },
    { kind: 'phase', a: 'info', g: 'deliver',  k: 'DELIVERING',       s: '7 tracks to Apple Music\u2026',                                     pause: 700, beam: 'delivering', p: 0.96 },
    { kind: 'track', a: 'info', k: 'DOCKING',                         s: 'with the Apple Music library\u2026',                               pause: 500, pilotOnly: true },
    { kind: 'phase', a: 'ok',   g: 'verified', k: 'VERIFIED',         s: '7/7 in playlist',                                                pause: 400, beam: 'verified', p: 1.0 },
    { kind: 'phase', a: 'ok',   g: 'complete', k: 'MISSION COMPLETE', s: 'New Jack Classics secured \u00b7 all systems stable',                pause: 3200, p: 1.0 }
  ];

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

  var CHAR_MS     = 18;        // typewriter speed
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
    return { row: row, parts: [[k, line.k], [rest, ' ' + line.s]] };
  }
  function tallyText(n, locked, near, miss) {
    var parts = ['\u00b7 ' + locked + ' locked'];
    if (near) parts.push(near + ' near');
    if (miss) parts.push(miss + ' miss');
    return [['SCANNING ' + n + '/' + TRACKS.length, ' ' + parts.join(' \u00b7 ')]];
  }

  function trim() {
    var MAX_ROWS = 10;   // rows kept before old ones scroll off the top
    while (log.children.length > MAX_ROWS) log.removeChild(log.firstChild);
  }

  // Reduced motion: dump the whole log, no typing, no loop.
  if (reduced) {
    setBeam({ beam: 'verified', p: 1 });
    SCRIPT.forEach(function (line) {
      if (line.pilotOnly) return;
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
    function next() {
      if (pi >= parts.length) { done(); return; }
      chars = Array.from(parts[pi][1]); ci = 0;
      parts[pi][0].appendChild(cursor);
      tick();
    }
    function tick() {
      var span = parts[pi][0];
      if (ci < chars.length) {
        span.insertBefore(document.createTextNode(chars[ci]), cursor);
        ci++;
        setTimeout(tick, CHAR_MS);
      } else { pi++; next(); }
    }
    next();
  }

  // The live tally: one row, rewritten in place each step; exception lines
  // print above it. Removed when the scan ends, as in the app.
  function runScan(line, done) {
    var tally = build({ kind: 'phase', a: 'ok', g: 'scan', k: '', s: '' });
    var locked = 0, near = 0, miss = 0, n = 0;
    function step() {
      n++;
      var note = line.notes[n];
      if (note) {
        if (note.near) near++; else if (note.miss) miss++;
      } else {
        locked++;
        // PILOT shows every lock; CRUISE counts them in the tally only.
        if (view === 'pilot') note = { a: 'ok', k: 'LOCKED', s: TRACKS[n - 1] };
      }
      if (note) {
        var b = build({ kind: 'track', a: note.a, k: note.k, s: note.s });
        log.insertBefore(b.row, tally.row);
        b.parts.forEach(function (pt) { pt[0].textContent = pt[1]; });
      }
      var t = tallyText(n, locked, near, miss)[0];
      tally.parts[0][0].textContent = t[0];
      tally.parts[1][0].textContent = t[1];
      setBeam({ p: line.p0 + (line.p1 - line.p0) * n / TRACKS.length });
      trim();
      var exception = line.notes[n];
      if (n < TRACKS.length) setTimeout(step, exception ? line.step * 2 : line.step);
      else setTimeout(function () { log.removeChild(tally.row); done(); }, 400);
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
    if (line.pilotOnly && view !== 'pilot') { typeLine(index + 1); return; }
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
