# Book quote area — review mockup

Add a restrained pull quote to the open space to the right of the already
approved centered book. The cover’s existing position and size are retained.
The quote uses readable italic serif type, turquoise quotation marks and a
thin neutral rule; no panel fill or extra page section is added.

The motivational sentence is explicitly labeled **Sample text · not a book
excerpt**. It is invented layout text, not a quotation from Yoshi’s book, and
has no author attribution. Replace it with an owner-approved exact excerpt
later. At intermediate widths and on phones, the quote stacks after the book
inside the same hero section. All navigation, themes, footer and page links
remain available.

This branch is a mockup for PJ’s review. Main and the live page remain at the
approved release while the new area is reviewed. The branch temporarily scopes
the existing browser workflow to the changed Book page. Restore the full main
workflow before integrating this design. Setup, branding, payments, actual book
content, other pages and shared movement are outside this change.

## Fresh mockup evidence

Run `39710016484` succeeds on `a1faf52`: 24 layouts, four journeys and four native
fallbacks in Chromium/WebKit, both themes and six widths, with zero failures.
The quote is beside the book on desktop and stacks below it on smaller screens.
Direct comparison against the approved Book render confirms identical cover
left/top/width/height in all 24 cases. Desktop and phone dark renders were
inspected. See `verification/book-quote-preview-20261021.json`; the rendered
evidence is artifact `12396249537`. Main and the live page remain unchanged.
