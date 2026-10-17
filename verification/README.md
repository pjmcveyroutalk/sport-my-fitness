# Verification evidence

Start at [the current project state](../docs/PROJECT_STATE.md).

recovery-audit-20261016.json contains fresh source, production HTTP, Chromium, WebKit and follow-up evidence. cinematic-content-baseline-20261016.json captures protected seven-page text and attributes.

October 11 motion-polish reports are historical checks of the older composition. Their exact geometry is not the current cinematic visual specification. Retain functional safeguards and test the redesigned appearance against the corrected references.

No real inquiry or booking was sent. Browser-engine checks do not establish physical-device coverage or mailbox delivery.

## Approved design implementation

`approved-design-content-check.json` records the fresh semantic comparison against the recovery parent and the intentionally removed duplicates. `approved-design-browser.cjs` exercises actual visitor behavior without submitting an inquiry or completing a booking. The `Approved design review` GitHub Actions workflow installs isolated Playwright 1.62.1 Chrome/WebKit tools, serves this static repository, and uploads screenshots, motion recordings and `results.json`.

Local reproduction with an installed Playwright package and browsers:

```sh
python3 -m http.server 8080
# In another terminal, with the development dependency resolvable:
SMF_BASE_URL=http://127.0.0.1:8080 SMF_EVIDENCE_DIR=/tmp/smf-evidence node verification/approved-design-browser.cjs
```

The workflow is the assistant-operated verification path for this revision. PJ does not need to install dependencies or debug tests. Fresh browser results are required before visual acceptance; source-level checks alone do not establish responsive or motion quality.

Current verified run: [39004509768](https://github.com/pjmcveyroutalk/sport-my-fitness/actions/runs/39004509768), checked runtime `38445de6578ab0c9e22d05358e895fe0bca7e1af`. All 70 layouts, 210 image checks, 28 navigation journeys, 14 motion runs and 21 safeguards pass. Mobile inner-hero checks cap blank space after actual content and into the next section. Home checks enforce removal of the training link group and preservation of its two hero actions. Shared typography, image proportions, navigation and motion remain covered. See `charcoal-depth-verification-20261017.json` and `charcoal-depth-browser-results-20261017.json` for current evidence. Earlier design reports remain historical.
