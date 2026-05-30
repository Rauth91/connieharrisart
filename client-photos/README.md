# Client photos

Drop final images here using the **destination filename** (see `js/photo-config.js`).

Examples:
- `hero.jpg`
- `slide-01.jpg`
- `gallery-01.jpg`
- `bas-relief.jpg`

Then run from the site folder:

```bash
node tools/replace-photos.js
```

Refresh the site. Slots without a matching file keep the current image.
