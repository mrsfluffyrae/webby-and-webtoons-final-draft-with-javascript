# Webby & Webtoons

LINK FOR THE LIVE SITE: https://mrsfluffyrae.github.io/webby-and-webtoons-final-draft-with-javascript/

A cozy, multi-page reading diary for webtoon and manhwa fans, built with HTML, CSS and JavaScript.

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Library | `library.html` |
| Discover (About/Services) | `about.html` |
| Contact & Recommend Me | `contact.html` |

Shared files: `styles.css` (one stylesheet for every page) and `app.js` (all JavaScript).

## JavaScript Extension (Capstone C)

### Student Details
- Name: Rachael Muthoni Njeru
- Registration Number: BDSA/MK/2243/09/25
- Date Submitted: 15/11/2026

### Features Implemented
- [x] H1 Personalised hero greeting
- [x] H2 Service card hover effects
- [x] H3 Persistent visit counter
- [x] A1 Filterable pricing table (the genre comparison table, filtered by tier: Quick Reads / Long Hauls)
- [x] A2 FAQ accordion from JS array
- [x] A3 TeamMember class with generateCard()
- [x] C1 Real-time form validation
- [x] C2 Form submission handler
- [x] C3 Enquiry history panel
- [x] S1 Dark mode toggle (all pages)
- [x] S2 Back to top button (all pages)
- [x] S3 Quote banner with fetch + fallback

### API Used
- URL: https://api.quotable.io/random
- Fallback: a local array of six hard-coded quotes inside `initQuoteBanner()` in `app.js`. If the request fails or takes longer than 5 seconds, the quotes are shown in rotation, and the "New Quote" button moves to the next one.

### Changes to Existing Files
**HTML**
- All pages: one `<script src="app.js" defer>` tag before `</body>` and a Dark Mode button added once to the shared navbar.
- `index.html`: `id="hero-heading"` and `class="hero-heading"` on the hero `<h1>`, `service-cards` class on the card grid, a hidden `<p class="card-more">` in each card, and `<span id="visit-count">` in the footer.
- `about.html`: `id="pricing-table"` on the table, `data-tier` on each table row, plus `<div id="faq">` and `<div id="team">` inside new cards.
- `contact.html`: `id="contact-form"` on the form, small `<span class="field-msg">` elements under each field, and `<span id="form-status">` for the success message.

**CSS**
- One block at the bottom of `styles.css`: the `.dark-mode` overrides, `.card-active`, and the small classes `app.js` toggles with `classList` (`hidden`, `show`, `active`, `open`, and styles for the generated banner, FAQ, team cards and history panel).

### Known Issues
- If `api.quotable.io` is unreachable, the browser may log a network error in the console even though the banner falls back correctly.
- Hiding table rows does not re-count the zebra stripes, so the stripe pattern can look uneven while a filter is on.
- With JavaScript running, the contact form saves enquiries in the browser (localStorage) instead of opening an email.
