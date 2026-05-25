# Connie Harris Art — Site Launch Guide

This folder is the **only** copy of the site. It matches https://rauth91.github.io/connieharrisart/

## Structure
```
index.html, *.html     — pages
css/style.css          — shared design system
css/home.css           — home page layout
css/classes.css        — classes page
css/contact.css        — contact page
css/gallery-page.css   — gallery slideshow pages
js/main.js             — menu, gallery, animations
js/photo-config.js     — image path map
```

## Live preview
- GitHub Pages: https://rauth91.github.io/connieharrisart/
- Local: open `index.html` in this folder

## Add your photos (fastest)
1. Put your image files in `client-photos/` using the destination filenames (`hero.jpg`, `slide-01.jpg`, etc.).
2. Run:
   ```bash
   node tools/replace-photos.js
   ```
3. Refresh the site.

Photo paths are defined in `js/photo-config.js`.

## Folder structure (recommended)
```
images/
  home/
    hero.jpg
    about-main.jpg
    about-sample.jpg
  work/
    bas-relief.jpg
    faux-finishes.jpg
    cabinet-finishes.jpg
    ceilings-floors.jpg
    murals.jpg
  gallery/
    murals/
      slide-01.jpg ... slide-04.jpg
      gallery-01.jpg ... gallery-06.jpg
      before.jpg
      after.jpg
    faux-finishes/ ...
    bas-relief/ ...
    cabinet-finishes/ ...
    ceilings-floors/ ...
  classes/
    hero.jpg
    signature.jpg
  videos/ (optional)
  contact/
    hero.jpg
```

## Before client meeting checklist
- [ ] Mobile menu works on every page
- [ ] Gallery pages: swipe left/right on image area
- [ ] Gallery + Before/After modals open correctly
- [ ] Contact form submits (Formspree endpoint configured)
- [ ] Replace placeholder images with Connie’s final photos

## Notes
- Current placeholders are temporary Unsplash images until client assets are added.
- Keep image filenames lowercase with hyphens for consistency.
