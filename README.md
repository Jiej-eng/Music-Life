# Aurelia Vinyl Live — Coursework 2 Proof of Concept

A responsive full-stack music discovery and ticket-reservation website. The project uses React + Vite for the client, Node.js + Express for the REST API, and SQLite for relational persistence.

## Requirements

- Node.js **22.5 or newer** (the repository pins 22.16.0 in `.node-version`) (the project uses the built-in `node:sqlite` module)
- npm 10 or newer

## Run locally

```bash
npm install
cp .env.example .env
```

Set a strong random `JWT_SECRET` in `.env`, then run:

```bash
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

Change or remove these accounts before any public deployment.

## Features

- Responsive event discovery, search and genre/availability filtering
- Artist archive, biographies, follows and curator notes
- UK venue map using Leaflet
- Interactive 10 × 10 seat plan and server-side availability validation
- Student, general and VIP ticket tiers; `UWS20` and `PAISLEY20` demonstration promo codes
- Reservation confirmation with a unique reference
- Registration/login with bcrypt password hashing and JWT sessions
- Organiser-only event publishing
- SQLite relational database with users, venues, artists, events, follows, tickets and ticket-seat records
- Database foreign keys and a unique `(event_id, seat_code)` key to prevent duplicate seat allocation
- English / Simplified Chinese interface and dark / light themes

## Database

The database is created automatically at `server/data/musiclife.sqlite` when running locally. Set `DB_DIR` to change the database directory; the Render blueprint mounts a persistent disk at `/var/data` and stores the database there. It does not require a separate database server. The previous JSON store is migrated automatically if `server/data/store.json` exists and the SQLite database is empty.

Back up `server/data/musiclife.sqlite` before replacing or redeploying the application. For a hosted deployment, use a persistent disk for this directory.

## Coursework documentation

See [`DESIGN_DOCUMENT.md`](./DESIGN_DOCUMENT.md) for the system design document, requirements, architecture, database model, API summary, workflows, security notes, test plan and deployment instructions. Add your personal/module details and real screenshots/test evidence before submission.

## Important limitations

This is a coursework proof of concept, not a production payment platform. It records demonstration reservations but does not collect money, send email, issue legally validated admission credentials or integrate with a payment provider. The demo administrator account is seeded for assessment. Before public use, add HTTPS, strong secret management, persistent backups, payment-provider integration, privacy/refund policies and a review of UK GDPR requirements.

## Deploy to Render

1. Push this repository to your GitHub account.
2. In Render, choose **New → Blueprint** and select the repository containing `render.yaml`.
3. Review the service. The blueprint creates a paid Starter web service and a 1 GB persistent disk because SQLite data must survive deploys and restarts.
4. Render generates `JWT_SECRET`; keep it private. `DB_DIR=/var/data` is configured for the persistent disk.
5. Wait for the first deploy to finish, then open the `onrender.com` URL and test `/api/health`, registration, login and a demo reservation.

Do not deploy this SQLite app as multiple web-service instances or remove its persistent disk. A free ephemeral instance can lose SQLite data on restart/redeploy. The generated Render URL does not exist until you create the service in your own Render account.

## Deployment notes

- Set `NODE_ENV=production` and a strong `JWT_SECRET`.
- Set `CLIENT_ORIGIN` to the production origin if the client is hosted separately.
- Ensure `server/data` is stored on a persistent disk.
- Run `npm run build` before starting the server.

## Project structure

```text
Music-Life-main/
  client/
    public/cover/
    src/App.jsx
    src/main.jsx
    src/styles.css
    index.html
    vite.config.js
  server/
    index.js
    store.js
    data/musiclife.sqlite   # created on first run
  DESIGN_DOCUMENT.md
  package.json
```
