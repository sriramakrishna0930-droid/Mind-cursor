/* FloatingDock — vanilla JS port of the 21st.dev floating-dock component.
 * macOS-style dock: icons magnify as the cursor approaches, tooltips on hover.
 * No dependencies. */

'use strict';

const FD_CSS =
  ".fdock{position:fixed;top:1.1rem;right:1.1rem;z-index:90;" +
  "display:flex;align-items:flex-end;gap:.45rem;padding:.55rem .7rem;border-radius:1.3rem;" +
  "background:rgba(14,14,17,.72);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);" +
  "border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 48px rgba(0,0,0,.45);}" +
  ".fdock-item{position:relative;display:flex;align-items:center;justify-content:center;" +
  "width:46px;height:46px;border-radius:.95rem;background:rgba(255,255,255,.07);color:#f2f2f3;" +
  "transition:background .18s ease;will-change:transform;}" +
  ".fdock-item:hover{background:rgba(255,255,255,.16);}" +
  ".fdock-item svg{width:22px;height:22px;flex:none;}" +
  ".fdock-item.is-active{background:#0038ff;color:#fff;}" +
  ".fdock-tip{position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%) translateY(-5px);" +
  "background:#f2f2f3;color:#111;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:12px;font-weight:600;" +
  "padding:5px 11px;border-radius:7px;white-space:nowrap;opacity:0;pointer-events:none;" +
  "transition:opacity .18s ease,transform .18s ease;}" +
  ".fdock-item:hover .fdock-tip{opacity:1;transform:translateX(-50%) translateY(0);}" +
  ".fdock-menu{position:absolute;top:calc(100% + 14px);right:0;min-width:220px;" +
  "background:rgba(16,16,20,.94);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);" +
  "border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:14px;" +
  "box-shadow:0 18px 50px rgba(0,0,0,.45);color:#fff;z-index:95;}" +
  ".fdock-mail{font-size:12.5px;color:#b9b9c2;word-break:break-all;margin:0 0 10px;line-height:1.45;}" +
  ".fdock-mail b{display:block;color:#fff;font-size:13px;margin-bottom:2px;}" +
  ".fdock-signout{width:100%;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.22);" +
  "background:transparent;color:#fff;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;}" +
  ".fdock-signout:hover{background:rgba(255,255,255,.09);}" +
  "@media (hover:none){.fdock-tip{display:none;}}" +
  "@media (max-width:640px){.fdock{top:.8rem;right:.8rem;gap:.35rem;padding:.45rem .55rem;border-radius:1.1rem;}" +
  ".fdock-item{width:42px;height:42px;border-radius:.85rem;}.fdock-item svg{width:20px;height:20px;}}";

const FD_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  awareness: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  technology: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
  screening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/><path d="m13 8 4 4-4 4"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></svg>',
  signup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8" r="4"/><path d="M2 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/><path d="M19 8v6M16 11h6"/></svg>',
};

const FD_DEFAULT_ITEMS = [
  { id: "home", label: "Home", target: "#top", icon: "home" },
  { id: "about", label: "About", target: "#about", icon: "about" },
  { id: "awareness", label: "Awareness", target: "#awareness", icon: "awareness" },
  { id: "technology", label: "Technology", target: "#technology", icon: "technology" },
  { id: "screening", label: "Screening", target: "#screening", icon: "screening" },
];

/* Shared: session-aware navigation (also used by CTA buttons). */
window.MindCursor = window.MindCursor || {};
window.MindCursor.getSession = function () {
  try { return JSON.parse(localStorage.getItem("mindcursor_session") || "null"); }
  catch (e) { return null; }
};
window.MindCursor.goScreening = function () {
  location.href = window.MindCursor.getSession() ? "screening.html" : "signup.html";
};

function toggleAccountMenu(dock) {
  var open = dock.querySelector(".fdock-menu");
  if (open) { open.remove(); return; }
  var session = window.MindCursor.getSession();
  if (!session) return;
  var menu = document.createElement("div");
  menu.className = "fdock-menu";
  var mail = document.createElement("p");
  mail.className = "fdock-mail";
  var b = document.createElement("b"); b.textContent = "Signed in";
  mail.appendChild(b);
  mail.appendChild(document.createTextNode(session.email || ""));
  var btn = document.createElement("button");
  btn.className = "fdock-signout"; btn.type = "button"; btn.textContent = "Sign out";
  btn.addEventListener("click", function (ev) {
    ev.stopPropagation();
    try { localStorage.removeItem("mindcursor_session"); } catch (e) {}
    location.reload();
  });
  menu.appendChild(mail); menu.appendChild(btn);
  dock.appendChild(menu);
  setTimeout(function () {
    document.addEventListener("click", function closer(ev) {
      if (!menu.contains(ev.target)) { menu.remove(); document.removeEventListener("click", closer); }
    });
  }, 0);
}

function initFloatingDock(mount, items) {
  var session = window.MindCursor.getSession();
  var base = (items && items.length) ? items : FD_DEFAULT_ITEMS;
  const list = base.map(function (it) {
    if (it.id === "screening") {
      if (session) return { id: "account", label: "Account", icon: "user", target: "#" };
      return { id: "screening", label: "Sign up", icon: "signup", target: it.target };
    }
    if (session && (it.id === "signin" || it.id === "signup")) {
      return { id: "account", label: "Account", icon: "user", target: "#" };
    }
    return it;
  });

  const style = document.createElement("style");
  style.textContent = FD_CSS;
  document.head.appendChild(style);

  const dock = document.createElement("nav");
  dock.className = "fdock";
  dock.setAttribute("aria-label", "Primary");
  dock.innerHTML = list.map((it) =>
    '<a class="fdock-item" href="' + it.target + '" data-fd="' + it.id + '" aria-label="' + it.label + '">' +
    (FD_ICONS[it.icon] || FD_ICONS.home) +
    '<span class="fdock-tip">' + it.label + "</span></a>"
  ).join("");
  mount.appendChild(dock);

  const els = Array.from(dock.querySelectorAll(".fdock-item"));
  const state = els.map(() => ({ s: 1, t: 1 }));
  let raf = 0, running = false;

  const loop = () => {
    let settled = true;
    els.forEach((el, i) => {
      const st = state[i];
      st.s += (st.t - st.s) * 0.22;
      if (Math.abs(st.t - st.s) > 0.001) settled = false;
      const lift = (st.s - 1) * 14;
      el.style.transform = "scale(" + st.s.toFixed(3) + ") translateY(" + (-lift).toFixed(1) + "px)";
    });
    if (!settled) raf = requestAnimationFrame(loop);
    else running = false;
  };
  const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };

  dock.addEventListener("mousemove", (e) => {
    els.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const dist = Math.abs(e.clientX - cx);
      state[i].t = 1 + 0.55 * Math.max(0, 1 - dist / 130);
    });
    kick();
  });
  dock.addEventListener("mouseleave", () => {
    state.forEach((st) => { st.t = 1; });
    kick();
  });

  /* smooth scroll to sections */
  dock.addEventListener("click", (e) => {
    const a = e.target.closest("a.fdock-item");
    if (!a) return;
    if (a.getAttribute("data-fd") === "screening") {
      e.preventDefault();
      window.MindCursor.goScreening();
      return;
    }
    if (a.getAttribute("data-fd") === "account") {
      e.preventDefault();
      toggleAccountMenu(dock);
      return;
    }
    const sel = a.getAttribute("href");
    if (!sel || sel.charAt(0) !== "#") return;
    const target = document.querySelector(sel === "#top" ? "body" : sel);
    if (!target) return;
    e.preventDefault();
    if (sel === "#top") window.scrollTo({ top: 0, behavior: "smooth" });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* active section highlight */
  if ("IntersectionObserver" in window) {
    const map = {};
    els.forEach((el) => { map[el.getAttribute("href")] = el; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          els.forEach((el) => el.classList.remove("is-active"));
          const el = map["#" + en.target.id];
          if (el) el.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ["about", "awareness", "technology", "screening"].forEach((id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
}

if (typeof window !== "undefined") window.initFloatingDock = initFloatingDock;
