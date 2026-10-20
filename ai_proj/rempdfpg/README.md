# Pagekeep

Pagekeep is a local-first PDF page remover. It previews pages in the browser, lets you select pages to remove, and creates a new PDF directly on your machine. No upload, account, watermark, or subscription is involved.

## Use it

Double-click `index.html` and open it in a modern browser. Drop in a PDF, click the pages you want to remove, then choose **Download edited PDF**.

Everything needed at runtime is already included in `vendor/`. There is no server, install, or internet connection required.

The `package.json` and `scripts/` files are only for regenerating the vendored open-source PDF libraries if desired.
