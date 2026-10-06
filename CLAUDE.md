# Document Viewer - project rules

## What this project is

A webpack-bundled JS library that renders Tabit documents (order bills, invoices, refund invoices,
delivery notes, credit slips) as HTML from TLOG data and server print data. Entry point is
`src/index.js`; the rendering engine lives in `src/tlog-docs-template/`.

## Workflow

- Every task starts from a Jira ticket (`TAB-xxxxx`). Work only on a feature branch named for
  that ticket. Never edit code on `master`, `develop`, or `release/*`.
- Before touching code, add a release-notes line under `## NEXT` in `release_notes.md`:
  `* [TAB-xxxxx] <ticket title>`. If the line is already there, do not duplicate it.
- Commit messages are prefixed with the ticket key: `[TAB-xxxxx] <short description>`.
- Do not rebuild or commit `dist/`. Builds happen in dedicated `build:` commits made by the human.
- Do not bump `package.json` version. That is part of the release process.
- There is no test suite. Verify changes compile (Babel) and, when print data is available,
  render the affected document and check the output.

## Code conventions

- No comments in code. Make the code self-explanatory with clear names and small methods.
  Do not add ticket numbers, explanations, or "why" notes inside source files. That context
  belongs in the Jira ticket, the commit message, and `release_notes.md`.
- Never use the em dash (`—`) or en dash (`–`) anywhere: code, strings, docs, commits. Use `-`.
- Follow the existing patterns in the file you are editing (`var`/`const` style, quote style,
  `_.get` for optional paths, `this.$translate.getText` for all user-facing text).
- All user-facing strings go through `src/tlog-docs-template/tlogDocsTranslate.js`. Add every
  new key to both `en-US` and `he-IL`. Use `{{placeholder}}` and the `keys`/`values` arguments
  of `getText` for dynamic values. Never hardcode Hebrew or English text in templates.
- Region-specific behavior is gated with `this.$localization.allowByRegions([...])`. Regions in
  use: `il`, `us`, `au`, `eu`, `cy`.
- Dates are formatted with `Utils.toDate` (pass `timezone`, `realRegion`, and `withoutTime` when
  only the date is needed). Do not format dates with moment directly in templates.
- Document type checks must handle both entry points: `docObj.type` (OFC order search, built
  from TLOG) and `docObj.documentType` (SMS/email links, built from print data only).
- New header lines are added as elements in `HeaderService.createOrderHeader` and filled in
  `fillOrderHeaderData`. Keep the element order in `orderBasicInfoArray` as the source of truth
  for visual order.
- Optional print-data fields may be missing on older documents. Always guard with `_.get` and
  render nothing when the data is absent, so existing documents are unchanged.
