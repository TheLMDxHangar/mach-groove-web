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

  // type: info | success | warning | pilot | dim
  var SCRIPT = [
    { t: 'dim',     s: '> INITIATING BEAM SEQUENCE',                                       pause: 500, beam: 'scanning', p: 0.02 },
    { t: 'info',    s: 'CARGO: 12 TRACKS DETECTED. CALCULATING BEAM PATH...',              pause: 600, p: 0.05 },
    { t: 'info',    s: 'SCANNING [1/12]: [Crush On You]...',                               pause: 220, p: 0.1 },
    { t: 'success', s: '🎯 TARGET LOCKED: [Crush On You]',                                 pause: 260, p: 0.15 },
    { t: 'info',    s: 'SCANNING [2/12]: [I Will Always Love You]...',                     pause: 220, p: 0.22 },
    { t: 'success', s: '🎯 TARGET LOCKED: [I Will Always Love You]',                       pause: 260, p: 0.28 },
    { t: 'info',    s: 'SCANNING [3/12]: [Love Like This]...',                             pause: 220, p: 0.34 },
    { t: 'success', s: '🎯 TARGET LOCKED: [Love Like This]',                               pause: 260, p: 0.4 },
    { t: 'dim',     s: '  ···  ',                                                          pause: 300, p: 0.6 },
    { t: 'info',    s: 'SCANNING [12/12]: [Lighters Up]...',                               pause: 400, p: 0.78 },
    { t: 'warning', s: '⚠️ NO MATCH: [Lighters Up]',                                       pause: 500, p: 0.82 },
    { t: 'success', s: 'BEAM CALCULATION COMPLETE. 11 MATCHED. 1 FAILED.',                 pause: 500, p: 0.85 },
    { t: 'warning', s: '⏸️ AWAITING PILOT INPUT — 1 UNRESOLVED TARGET. PAYLOAD HOLDING...', pause: 1200, beam: 'holding', p: 0.85 },
    { t: 'pilot',   s: '👩🏾‍🚀 PILOT SELECTED: [Lighters Up (feat. Lil\' Kim)]',           pause: 500, beam: 'scanning', p: 0.85 },
    { t: 'success', s: '🎯 TARGET LOCKED: [Lighters Up]',                                  pause: 400, p: 0.87 },
    { t: 'info',    s: 'INITIATING FINAL PAYLOAD DROP TO APPLE MUSIC...',                  pause: 900, beam: 'delivering', p: 0.9 },
    { t: 'success', s: '📦 DELIVERY VERIFIED: 12/12 IN PLAYLIST.',                         pause: 400, beam: 'verified', p: 1.0 },
    { t: 'success', s: '🚀 ALL SONGS ABOARD: [QUEEN BEE MIX] SECURED.',                    pause: 3200, p: 1.0 }
  ];

  // IV-0048: like the app, the beam is driven by the sequence. `p` is the
  // progress the rocket's nose rides (it parks at 85% on the pilot hold and
  // docks at 100%); `beam` sets the ear-cup light (.beam[data-state]).
  var beam = document.getElementById('beam');
  function setBeam(line) {
    if (!beam) return;
    if (line.beam) beam.setAttribute('data-state', line.beam);
    if (line.p != null) beam.style.setProperty('--beam-progress', line.p);
  }

  var MAX_VISIBLE = 9;         // lines kept on screen before scrolling old ones off
  var CHAR_MS     = 18;        // typewriter speed
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function makeLine(type) {
    var el = document.createElement('span');
    el.className = 'log-line log-line--' + type;
    return el;
  }

  function trim() {
    while (log.querySelectorAll('.log-line').length > MAX_VISIBLE) {
      log.removeChild(log.firstChild);
    }
  }

  // Reduced motion: dump the whole log, no typing, no loop.
  if (reduced) {
    setBeam({ beam: 'verified', p: 1 });
    SCRIPT.forEach(function (line) {
      var el = makeLine(line.t);
      el.textContent = line.s;
      log.appendChild(el);
    });
    return;
  }

  var cursor = document.createElement('span');
  cursor.className = 'cursor';

  function typeLine(index) {
    if (index >= SCRIPT.length) {
      // loop
      setTimeout(function () {
        log.innerHTML = '';
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
    setBeam(line);
    var el = makeLine(line.t);
    log.appendChild(el);
    el.appendChild(cursor);
    trim();

    // Split by code point so emoji don't get half-typed.
    var chars = Array.from(line.s);
    var i = 0;

    function tick() {
      if (i < chars.length) {
        el.insertBefore(document.createTextNode(chars[i]), cursor);
        i++;
        setTimeout(tick, CHAR_MS);
      } else {
        setTimeout(function () { typeLine(index + 1); }, line.pause);
      }
    }
    tick();
  }

  typeLine(0);
})();
