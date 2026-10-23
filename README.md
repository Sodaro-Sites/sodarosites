# Sodaro Sites — website

Public site for Sodaro Sites: https://sodaro-sites.github.io/sodarosites

Static HTML/CSS/JS on GitHub Pages. No build step.

- All 4 Stripe payment links live in ONE place: `assets/js/site.js` → `SODARO_CONFIG.stripe`. Empty values fall back to the contact page automatically.
- Demo request form posts to FormSubmit (free) addressed to sodarosites@gmail.com, with a pre-filled email + call/text fallback if it fails. The very first submission triggers a one-time activation email to that inbox — click it once.
