# Aurelia Vinyl Live — Complete React + Node Project

A complete, runnable full-stack starter for the Aurelia Vinyl Live UK music portal. It includes a responsive React interface, Express API, persistent JSON data store, account registration/login, organiser-only event publishing, artist archive, following, UK venue map, server-checked seat reservations and reservation confirmations.

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. The API runs at **http://localhost:4000**.

For a production build:

```bash
npm run build
npm start
```

The Express server serves the compiled frontend from `client/dist`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Organiser | `admin@aurelia.uk` | `Aurelia2026!` |
| Guest | `guest@aurelia.uk` | `Vinyl2026!` |

The organiser account can publish performances. Both accounts can follow artists and save curator notes. Anyone can create a seat reservation in this demonstration build; sign-in is required to view a saved account's ticket list.

## What is included

- Home, genre discovery and upcoming performances
- Concert search and genre/availability filters
- Ten UK venue locations on a Leaflet map (street and satellite layers), real UK postcode/place geocoding and custom map-drop pins
- Interactive 10 × 10 seat plan; reserved seats are checked on the server
- Student, general and VIP ticket tiers; `UWS20` and `PAISLEY20` demo promo codes
- Reservation confirmation with a unique reference and selected seats
- Account registration and login with bcrypt password hashing and signed JWT sessions
- Organiser-only event publishing
- Artist archive, image upload, follows and editable curator notes
- English / Simplified Chinese interface toggle and dark / light colour themes

## Important operating notes

This is a runnable starter and demonstration ticketing workflow, **not a production payment platform**. The reservation endpoint records an order and prevents duplicate seat allocation within this single Node server process, but it does not collect money, send email, issue legally validated admission credentials, or integrate with a payment provider. The reservation confirmation clearly identifies itself as a demo reservation and not a payment receipt.

Before public deployment:

1. Set a long, random `JWT_SECRET` environment variable. Do not use the development fallback secret.
2. Replace the JSON file store with a transactional database (PostgreSQL is recommended) and enforce seat uniqueness with a database constraint/transaction. The included JSON store is suitable only for a single-instance demo.
3. Integrate a payment provider (for example Stripe Checkout) and only mark orders as paid / issue final tickets after a verified server-side payment webhook.
4. Configure `CLIENT_ORIGIN` to your production frontend origin, enable HTTPS, add transactional email, backups, monitoring and an organiser approval workflow.
5. Change the demo account passwords or remove the seeded demo users before deployment.
6. Review venue branding, event permissions, privacy policy, cookie policy, refund terms and UK GDPR obligations before accepting public customers.

## Project structure

```text
aurelia-vinyl-live/
  client/
    index.html
    vite.config.js
    src/
      App.jsx
      main.jsx
      styles.css
  server/
    index.js
    store.js
    data/           # Created automatically on first server start
  package.json
  README.md
```

## Reset demo data

Stop the server, remove `server/data/store.json`, then start the server again. Seed data and demo accounts will be recreated automatically.
