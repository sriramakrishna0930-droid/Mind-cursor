/* Works-wheel engine — vanilla port of the 21st.dev @crafterui works-wheel motion.
   One driven value `turn`: 0 = flat ring, n = vertical drum with item n-1 at front.
   Triggers: wheel over stage (step accumulation), vertical drag, tap a card,
   ArrowUp/Down, index clicks. */
function initWorksWheel(stage) {
  if (!stage || stage.dataset.wwInit) return;
  stage.dataset.wwInit = "1";

  var DATA = [
    { t: "Awareness",     d: "Building knowledge about autism and neurodiversity.",               tag: "Always" },
    { t: "Acceptance",    d: "Recognizing and respecting individual differences.",                tag: "Every day" },
    { t: "Inclusion",     d: "Encouraging a supportive environment where everyone feels valued.", tag: "Today" },
    { t: "Understanding", d: "Seeing the world through every mind's perspective.",                tag: "Every moment" },
    { t: "Support",       d: "Standing beside individuals and families at every step.",           tag: "Side by side" },
    { t: "Community",     d: "Building a world where every mind belongs.",                        tag: "Together" }
  ];
  var COUNT = DATA.length;
  var ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>';

  var wheel = stage.querySelector(".ww-wheel"),
      centerEl = stage.querySelector(".ww-center"),
      titleEl = stage.querySelector(".ww-title"),
      indexEl = stage.querySelector(".ww-index"),
      hintEl = stage.querySelector(".ww-hint");
  if (!wheel) return;

  var cards = [], idxBtns = [];
  DATA.forEach(function (c, i) {
    var el = document.createElement("div");
    el.className = "ww-card";
    el.dataset.i = String(i);
    el.innerHTML = '<div class="ww-face"><div class="ww-top"><span class="ww-ico">' + ICO + '</span>' +
      '<span class="ww-label">' + c.t + "</span></div>" +
      '<p class="ww-desc">' + c.d + '</p><div class="ww-date">' + c.tag + "</div></div>";
    wheel.appendChild(el);
    cards.push(el);
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = c.t;
    b.setAttribute("aria-label", "Show " + c.t);
    b.addEventListener("click", function () { target = i + 1; });
    indexEl.appendChild(b);
    idxBtns.push(b);
  });

  var H, W, ringR, drumR, bow, ringStep = 360 / COUNT, RING_OFF = ringStep / 2, RING_SCALE = 0.45;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function measure() {
    var sw = stage.clientWidth, sh = stage.clientHeight;
    H = sh * 0.38;
    W = H * 1.45;
    var cap = sw * 0.34;
    if (W > cap) { var s = cap / W; W = cap; H = H * s; }
    ringR = 1.14 * H; drumR = 2.22 * H; bow = 1.82 * H;
    stage.style.perspective = (2.7 * H) + "px";
    cards.forEach(function (el) {
      el.style.width = W + "px"; el.style.height = H + "px";
      el.style.marginLeft = (-W / 2) + "px"; el.style.marginTop = (-H / 2) + "px";
    });
  }
  measure();
  window.addEventListener("resize", measure);

  var turn = 0, target = 0;
  var DEG = Math.PI / 180;
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  function frame() {
    turn += (target - turn) * (reduced ? 1 : 0.12);
    if (Math.abs(target - turn) < 0.0005) turn = target;
    var m = clamp01(turn);
    var pos = Math.max(0, turn - 1);
    wheel.style.transform = "translateZ(" + (-m * drumR) + "px)";
    var active = Math.max(0, Math.min(COUNT - 1, Math.round(pos)));
    for (var i = 0; i < COUNT; i++) {
      var d = i - pos;
      var od = Math.abs(d);
      var drumDeg = d * 40 * DEG;
      var tx = m * -bow * (1 - Math.cos(drumDeg));
      var rz = (1 - m) * (d * ringStep + RING_OFF);
      var ty = -(1 - m) * ringR;
      var rx = m * d * 40;
      var tz = m * drumR;
      var el = cards[i];
      el.style.transform = "translateX(" + tx.toFixed(2) + "px) rotateZ(" + rz.toFixed(3) + "deg)" +
        " translateY(" + ty.toFixed(2) + "px) rotateX(" + rx.toFixed(3) + "deg)" +
        " translateZ(" + tz.toFixed(2) + "px)";
      // visibility: full ring at m=0; far cards dissolve early in the morph,
      // neighbors crossfade smoothly while the drum spins
      var band = od <= 1.2 ? 1 : od >= 2.2 ? 0 : 1 - (od - 1.2);
      var op = 1 - (1 - band) * Math.min(1, m * (od > 2 ? 4 : 1));
      el.style.opacity = String(Math.max(0, op));
      el.style.zIndex = String(100 - Math.round(od * 2));
      // keep card text upright: counter the ring tilt, flip past 90deg
      var nrz = ((rz % 360) + 540) % 360 - 180;
      var flip = Math.abs(nrz) > 90 ? 180 : 0;
      el.firstChild.style.transform = "scale(" + (RING_SCALE + (1 - RING_SCALE) * m).toFixed(3) + ")" +
        " rotateZ(" + (-rz + flip).toFixed(2) + "deg)";
      el.classList.toggle("is-active", i === active && m > 0.5);
      idxBtns[i].classList.toggle("on", i === active);
    }
    if (centerEl) centerEl.style.opacity = String(clamp01(1 - m * 1.8));
    if (titleEl) { titleEl.style.opacity = String(clamp01((m - 0.3) / 0.7)); titleEl.textContent = DATA[active].t; }
    if (hintEl) hintEl.style.opacity = m > 0.05 ? "0" : "1";
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  var snapT = null;
  function scheduleSnap() {
    clearTimeout(snapT);
    snapT = setTimeout(function () { target = Math.max(0, Math.min(COUNT, Math.round(target))); }, 140);
  }

  // wheel: accumulate scroll units into whole-card steps; engage immediately,
  // release the page scroll at both ends
  var wAcc = 0, WHEEL_STEP = 240;
  stage.addEventListener("wheel", function (e) {
    var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
    if (!dy) return;
    var dir = dy > 0 ? 1 : -1;
    var atEnd = (dir > 0 && target >= COUNT) || (dir < 0 && target <= 0);
    if (!atEnd) e.preventDefault(); else { wAcc = 0; return; }
    wAcc += dy;
    var steps = Math.trunc(wAcc / WHEEL_STEP);
    if (steps !== 0) {
      wAcc -= steps * WHEEL_STEP;
      target = Math.max(0, Math.min(COUNT, target + steps));
      scheduleSnap();
    }
  }, { passive: false });

  var dragging = false, startY = 0, startX = 0, startTarget = 0, moved = 0, lastY = 0;
  stage.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".ww-index")) return;
    dragging = true; moved = 0;
    startY = e.clientY; startX = e.clientX; startTarget = target; lastY = e.clientY;
    clearTimeout(snapT);
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var idy = e.clientY - lastY; lastY = e.clientY;
    moved = Math.max(moved, Math.abs(e.clientY - startY) + Math.abs(e.clientX - startX));
    if (moved <= 10) return;
    var nt = target - idy / 420;
    if (nt < 0 || nt > COUNT) {
      // pushing past an end: hand the gesture to the page so users can scroll by
      try { window.scrollBy(0, -idy); } catch (err) {}
      nt = Math.max(0, Math.min(COUNT, nt));
    }
    target = nt;
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (moved <= 10) {
      // tap: pointer capture retargets e.target to the stage, so hit-test by point
      var under = (e.clientX !== undefined) ? document.elementFromPoint(e.clientX, e.clientY) : null;
      var card = under && under.closest ? under.closest(".ww-card") : null;
      if (card && card.dataset.i !== undefined) target = parseInt(card.dataset.i, 10) + 1;
    } else {
      target = target >= 0.5 ? Math.round(target) : 0;
    }
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { target = Math.min(COUNT, target + 1); e.preventDefault(); }
    if (e.key === "ArrowUp") { target = Math.max(0, target - 1); e.preventDefault(); }
  });
}
