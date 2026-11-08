/* MindCursor auth — multi-step flow.
 * Talks to the Flask REST API via MindCursorAPI (api.js).
 * All user accounts are stored in the SQLite database on the server.
 */

'use strict';

/* ---------- modal helpers ---------- */
function modalEl() { return document.getElementById('auth-modal'); }
function showModal(text) {
  document.getElementById('auth-modal-text').textContent = text;
  modalEl().hidden = false;
}
function setModalText(text) {
  document.getElementById('auth-modal-text').textContent = text;
}
function showModalSuccess(title) {
  document.getElementById('auth-modal-body').innerHTML =
    '<div class="auth-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
    '<p class="auth-modal-ok">' + title + '</p>';
  fireConfetti();
}

/* ---------- confetti ---------- */
function fireConfetti() {
  var c = document.getElementById('confetti');
  if (!c) return;
  c.hidden = false;
  var ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  var colors = ['#0038ff', '#ff77cd', '#ff5f04', '#F0C96A', '#1c7a3d', '#7d97ff'];
  var parts = [];
  for (var i = 0; i < 150; i++) {
    parts.push({
      x: c.width / 2 + (Math.random() - .5) * 140,
      y: c.height * 0.42,
      vx: (Math.random() - .5) * 11, vy: Math.random() * -9 - 3,
      s: Math.random() * 7 + 4, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3,
      color: colors[i % colors.length], life: 1
    });
  }
  var frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy += .28; p.vx *= .99; p.r += p.vr; p.life -= .008;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.max(p.life, 0); ctx.fillStyle = p.color;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62); ctx.restore();
    });
    if (++frames < 230) requestAnimationFrame(tick); else c.hidden = true;
  })();
}

/* ---------- step engine ---------- */
function stepError(step, msg) {
  var el = step.querySelector('.auth-error');
  if (el) el.textContent = msg || '';
}
function markBad(input, bad) {
  if (input) input.classList.toggle('is-bad', !!bad);
}
function goStep(flow, n) {
  flow.querySelectorAll('.auth-step').forEach(function (s) {
    s.classList.toggle('is-active', s.getAttribute('data-step') === String(n));
  });
  var active = flow.querySelector('.auth-step.is-active input:not([readonly])');
  if (active) setTimeout(function () { active.focus({ preventScroll: true }); }, 60);
}

function initFlow(flow, handlers) {
  var n = 1;
  flow.addEventListener('click', function (e) {
    if (e.target.closest('[data-go]')) { handlers.go(n); return; }
    if (e.target.closest('[data-back]')) {
      if (n > 1) { n--; stepError(flow.querySelector('.auth-step.is-active'), ''); goStep(flow, n); }
    }
  });
  flow.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var step = e.target.closest('.auth-step');
      var go = step && step.querySelector('[data-go]');
      if (go) { e.preventDefault(); handlers.go(n); }
    }
  });
  flow._setStep = function (m) { n = m; goStep(flow, n); };
  flow._getStep = function () { return n; };
  return flow;
}

document.addEventListener('DOMContentLoaded', function () {
  var API = window.MindCursorAPI;

  var close = document.getElementById('auth-modal-close');
  if (close) close.addEventListener('click', function () { modalEl().hidden = true; });

  /* ================= SIGNUP ================= */
  var signup = document.getElementById('signup-flow');
  if (signup) {
    var signupData = {};
    var flow = initFlow(signup, {
      go: function (n) {
        var step = signup.querySelector('.auth-step[data-step="' + n + '"]');
        stepError(step, '');
        var q = function (sel) { return step.querySelector(sel); };

        if (n === 1) {
          var em = q('[name=email]').value.trim().toLowerCase();
          markBad(q('[name=email]'), false);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
            markBad(q('[name=email]'), true);
            return stepError(step, 'That email address doesn\u2019t look right.');
          }
          signupData.email = em;
          signup.querySelectorAll('.js-echo-email').forEach(function (i) { i.value = em; });
          flow._setStep(2);

        } else if (n === 2) {
          var nm = q('[name=name]').value.trim();
          markBad(q('[name=name]'), false);
          if (nm.length < 2) { markBad(q('[name=name]'), true); return stepError(step, 'Please enter your name.'); }
          signupData.name = nm;
          flow._setStep(3);

        } else if (n === 3) {
          var p1 = q('[name=password]').value;
          markBad(q('[name=password]'), false);
          if (p1.length < 6) { markBad(q('[name=password]'), true); return stepError(step, 'Password needs at least 6 characters.'); }
          signupData.pw = p1;
          flow._setStep(4);

        } else if (n === 4) {
          var p2 = q('[name=confirm]').value;
          markBad(q('[name=confirm]'), false);
          if (p2 !== signupData.pw) {
            markBad(q('[name=confirm]'), true);
            return stepError(step, 'Passwords don\u2019t match.');
          }

          /* Call API */
          var btn = step.querySelector('[data-go]');
          if (btn) btn.disabled = true;
          showModal('Creating your account\u2026');

          API.signup(signupData.name, signupData.email, signupData.pw)
            .then(function (data) {
              API.setToken(data.token);
              setModalText('Onboarding you\u2026');
              setTimeout(function () {
                showModalSuccess('Welcome Aboard!');
                setTimeout(function () { location.href = 'index.html'; }, 1500);
              }, 900);
            })
            .catch(function (err) {
              modalEl().hidden = true;
              if (btn) btn.disabled = false;
              flow._setStep(1);
              var s1 = signup.querySelector('.auth-step[data-step="1"]');
              stepError(s1, err || 'Something went wrong. Please try again.');
            });
        }
      }
    });
  }

  /* ================= SIGNIN ================= */
  var signin = document.getElementById('signin-flow');
  if (signin) {
    var signinData = {};
    var sflow = initFlow(signin, {
      go: function (n) {
        var step = signin.querySelector('.auth-step[data-step="' + n + '"]');
        stepError(step, '');
        var q = function (sel) { return step.querySelector(sel); };

        if (n === 1) {
          var em = q('[name=email]').value.trim().toLowerCase();
          markBad(q('[name=email]'), false);
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
            markBad(q('[name=email]'), true);
            return stepError(step, 'Enter the email you signed up with.');
          }
          signinData.email = em;
          signin.querySelectorAll('.js-echo-email').forEach(function (i) { i.value = em; });
          sflow._setStep(2);

        } else if (n === 2) {
          var pw = q('[name=password]').value;
          markBad(q('[name=password]'), false);
          if (!pw) { markBad(q('[name=password]'), true); return stepError(step, 'Please enter your password.'); }

          var btn = step.querySelector('[data-go]');
          if (btn) btn.disabled = true;
          showModal('Signing you in\u2026');

          API.signin(signinData.email, pw)
            .then(function (data) {
              API.setToken(data.token);
              setTimeout(function () { location.href = 'index.html'; }, 900);
            })
            .catch(function (err) {
              modalEl().hidden = true;
              if (btn) btn.disabled = false;
              markBad(q('[name=password]'), true);
              stepError(step, err || 'Email or password doesn\u2019t match. Try again.');
            });
        }
      }
    });
  }
});
