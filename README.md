# TaxBridge — Tax Filing Document Control Dashboard (modular)

Modular rebuild of the former single-file `taxbridgeworkingpreview` prototype,
extended into a document-control dashboard. The markup, styles, and JavaScript
are split into separate files so the app is easier to read, test, and extend.

## Document Register (controlled IDs)

Every file in the system — tax returns, filing references, payment details,
SLSP/QAP, eSub replies, and entity Certificates of Registration — is a
**controlled document** with a unique, stable **Document Control Number**
(`DCN-0001`, `DCN-0002`, ...). The number is minted on first upload and never
reused, even after deletions.

- **Document Register view** (sidebar → *Document Register*): a searchable,
  filterable list of every controlled document across *all* entities, with
  filters for entity and document type.
- Each tracker cell shows its DCN beneath the file name, linking the working
  table to the register.
- The register reconciles itself with the packages/entities on every change:
  existing IDs and dates are preserved, new documents get the next number, and
  removed documents drop out automatically (`register.js → syncRegister`).

## Structure

```text
taxbridge/
  index.html          # markup only — no inline scripts or styles
  css/
    styles.css        # custom scrollbar + dropzone styles (Tailwind via CDN)
  js/
    config.js         # storage keys, doc-id format, doc types + seed data
    utils.js          # id generation, HTML escaping, file reading
    store.js          # localStorage CRUD (incl. doc ledger) + file cache
    status.js         # package status evaluation (pure)
    filter.js         # shared active-form-filter state
    sidebar.js        # collapsible menu + dynamic form filters
    admin.js          # Google Drive folder routing modal
    viewer.js         # in-app file preview modal
    entities.js       # entity selector, add entity, COR upload
    packages.js       # table-row CRUD + upload flows
    register.js       # controlled-id ledger: sync, ids, register rows
    registerView.js   # Document Register view rendering (search/filter)
    view.js           # view switching + single re-render path
    render.js         # tracker main-panel DOM rendering
    main.js           # entry point: seeds, wires events, boots UI
```

Open `index.html` in a browser. Everything runs client-side and persists to
`localStorage`; uploaded files are held in memory for the current session only.

## What changed from the single file

- **ES modules** with a single `<script type="module">` entry point.
- **Event delegation** via `data-action` attributes — no inline `onclick`
  strings and no global function namespace.
- **Robust storage reads** that recover from corrupt `localStorage` instead of
  white-screening.
- **Collision-free IDs** (the old `Date.now()` ids clashed on multi-file drops).
- **Consistent async file handling** — every upload is read to a data URL so the
  preview works for all file types within a session.
- **Escaped dynamic content** (periods, form types, file names) everywhere.
- **Dismissable modals** — click the backdrop or press `Escape` to close.
