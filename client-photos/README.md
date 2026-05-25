# Client photos

Drop final images here using the **destination filename** (see `js/photo-config.js` and `README.md` in the site root).

Examples:
- `hero.jpg`
- `slide-01.jpg`
- `gallery-01.jpg`
- `before.jpg`
- `after.jpg`
- `bas-relief.jpg`

Then run from the site folder:

```bash
node tools/replace-photos.js
```

Refresh the site. Slots without a matching file keep the current placeholder image.
