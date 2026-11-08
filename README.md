# MindCursor

AI-assisted autism awareness and preliminary screening platform.
Static site — no build step, no backend. Open `index.html` or serve the folder.

## Run it

```bash
npm start
# or
python3 -m http.server 8000
```

Then open http://localhost:8000 (or http://localhost:3000 with `npm run serve`).

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Home — hero, about, work wheel, technology, footer |
| `screening.html` | Screening quiz (age select → questions → result) |
| `signin.html` / `signup.html` | Auth pages (front-end only) |

## Folder layout

```
index.html  screening.html  signin.html  signup.html
package.json  README.md
assets/
  css/
    webflow.css       # base Webflow styles
    works-wheel.css   # 3D work wheel
    hero-brain.css    # hero brain animation
    about-ed.css      # about section
    screening.css     # screening page
    auth-v2.css       # sign in / sign up
  js/
    works-wheel.js    # 3D work wheel — scroll / swipe logic, do not rename its ids
    screening.js      # quiz questions, options, scoring, result
    floating-dock.js  # bottom navigation dock
    signature-footer.js
    auth-v2.js        # sign in / sign up
  images/
    tech/             # tech-01.jpg … tech-06.jpg (technology section)
    cards/            # work-wheel cards
    screening/        # hero-bg, opt-a…d, result-portrait
    icons/            # custom cursors
    favicon-*.jpg     # site icons (32 / 48 / 180 / 192 / 512)
    ascii-portrait.png  brain-cut.webp
  vendor/             # third-party code — do not edit
    gsap/             # GSAP + ScrollTrigger, SplitText, Inertia, CustomEase, DrawSVG
    webflow/          # Webflow runtime
    lenis.min.js      # smooth scroll (Lenis)
    barba.umd.min.js  # page transitions
    hls.js  jquery-3.5.1.min.js  webfont.js  odyn-bundle.js
```

## Easy edits

- **Text on the home page:** edit `index.html` directly.
- **Quiz questions / options / scoring:** `assets/js/screening.js` — questions are at the top of the file.
- **Change an image:** replace the file in `assets/images/` with a file of the same name, or update the `src` in the HTML/JS that uses it.
- **Work-wheel cards:** images in `assets/images/cards/` + `assets/images/tech/`, behaviour in `assets/js/works-wheel.js` and `assets/css/works-wheel.css`.
- **Colours / fonts:** `assets/css/webflow.css` (base) and the section CSS files above.
