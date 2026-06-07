# Connie Harris Art

Static portfolio site for Connie Harris — decorative murals, finishes, bas relief, and studio classes.

**Live:** https://rauth91.github.io/connieharrisart/

## Structure

```
index.html              Home
classes.html            Classes
contact.html            Contact
*.html                  Practice galleries (magazine layout)

css/style.css           Shared design system
css/home.css            Home page
css/classes.css         Classes page
css/contact.css         Contact page
css/magazine.css        Practice gallery pages

js/site-config.js       Nav, practice list, cache version (SITE_VERSION)
js/site-nav.js          Active nav state
js/main.js              Menu, scroll header, reveal animations
js/home.js              Home page animations
js/classes.js           Class offerings modal
js/contact-form.js      Contact form handler
js/magazine.js          Practice page spreads + gallery
js/photo-config.js      Image paths (used by import tools)
js/curated-pages.js     Hero/spread order (used by build tool)

tools/build-portfolio-pages.js   Regenerate 6 practice HTML pages
tools/import-edited-photos.js    Import photos from Desktop/website-ready
tools/normalize-gallery-display.js Batch 3:4 crop on gallery images
tools/replace-photos.js            Copy files from client-photos/ by filename
tools/sync-nav.js                  Sync nav markup from site-config.js
```

## Local preview

```bash
cd connieharris
python3 -m http.server 8765
```

Open http://localhost:8765 and hard refresh (Cmd+Shift+R).

## Update photos

Import from a prepared folder (default: `~/Desktop/website-ready`):

```bash
node tools/import-edited-photos.js
node tools/build-portfolio-pages.js
```

Or drop named files into `client-photos/` and run:

```bash
node tools/replace-photos.js
```

Image paths live in `js/photo-config.js`.

## Rebuild practice pages

After editing `js/curated-pages.js` or toggling photos in the build script:

```bash
node tools/build-portfolio-pages.js
```

## Sync navigation

After editing `js/site-config.js`:

```bash
node tools/sync-nav.js
```

## Sync navigation (home, classes, contact only)

Practice gallery pages get nav from `build-portfolio-pages.js`. For static pages:

```bash
node tools/sync-nav.js
```

## Cache busting

All pages use `SITE_VERSION` in `js/site-config.js`. Bump it when CSS or JS changes ship.
