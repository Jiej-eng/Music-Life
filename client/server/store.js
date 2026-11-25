import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.DB_DIR ? path.resolve(process.env.DB_DIR) : path.join(__dirname, 'data');
export const DB_FILE = path.join(DATA_DIR, 'musiclife.sqlite');
const LEGACY_STORE_FILE = path.join(DATA_DIR, 'store.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL,
  nation TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, genre_key TEXT NOT NULL, origin TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '', tracks_json TEXT NOT NULL DEFAULT '[]', note TEXT NOT NULL DEFAULT '',
  artwork_key TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT NOT NULL, artwork_key TEXT NOT NULL DEFAULT '',
  genre_key TEXT NOT NULL, venue_id TEXT NOT NULL REFERENCES venues(id), date TEXT NOT NULL,
  price REAL NOT NULL CHECK(price >= 0), description TEXT NOT NULL DEFAULT '', capacity INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'On sale', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS follows (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL, PRIMARY KEY(user_id, artist_id)
);
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY, ticket_code TEXT NOT NULL UNIQUE, event_id TEXT NOT NULL REFERENCES events(id),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL, event_title TEXT NOT NULL, artist TEXT NOT NULL,
  venue_name TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, event_date TEXT NOT NULL,
  tier TEXT NOT NULL, tier_label TEXT NOT NULL, unit_price REAL NOT NULL, total_price REAL NOT NULL,
  holder_name TEXT NOT NULL, email TEXT NOT NULL, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'reserved'
);
CREATE TABLE IF NOT EXISTS ticket_seats (
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_code TEXT NOT NULL, PRIMARY KEY(event_id, seat_code), UNIQUE(ticket_id, seat_code)
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets(email);
`);

const venues = [
  { id: 'paisley-abbey', name: 'Paisley Abbey & High St Live Hall', address: 'Abbey Close, Paisley, PA1 1JG, Scotland, UK', city: 'Paisley', nation: 'Scotland', lat: 55.8456, lng: -4.4239 },
  { id: 'glasgow-barrowland', name: 'Glasgow Barrowland Ballroom', address: '244 Gallowgate, Glasgow, G4 0TT, Scotland, UK', city: 'Glasgow', nation: 'Scotland', lat: 55.8552, lng: -4.2368 },
  { id: 'edinburgh-usher', name: 'Edinburgh Usher Hall', address: 'Lothian Road, Edinburgh, EH1 2EA, Scotland, UK', city: 'Edinburgh', nation: 'Scotland', lat: 55.9472, lng: -3.2046 },
  { id: 'manchester-apollo', name: 'Manchester O2 Apollo', address: 'Stockport Road, Manchester, M12 6AP, England, UK', city: 'Manchester', nation: 'England', lat: 53.4694, lng: -2.2223 },
  { id: 'liverpool-cavern', name: 'Liverpool Cavern Quarter', address: '10 Mathew Street, Liverpool, L2 6RE, England, UK', city: 'Liverpool', nation: 'England', lat: 53.4063, lng: -2.9879 },
  { id: 'london-royal-albert', name: 'London Royal Albert Hall', address: 'Kensington Gore, London, SW7 2AP, England, UK', city: 'London', nation: 'England', lat: 51.5009, lng: -0.1774 },
  { id: 'london-abbey-road', name: 'London St John’s Wood Studio Stage', address: '3 Abbey Road, London, NW8 9AY, England, UK', city: 'London', nation: 'England', lat: 51.5321, lng: -0.1773 },
  { id: 'bristol-beacon', name: 'Bristol Beacon', address: 'Trenchard Street, Bristol, BS1 5AR, England, UK', city: 'Bristol', nation: 'England', lat: 51.4547, lng: -2.5985 },
  { id: 'cardiff-arena', name: 'Cardiff International Arena', address: 'Mary Ann Street, Cardiff, CF10 2EQ, Wales, UK', city: 'Cardiff', nation: 'Wales', lat: 51.4789, lng: -3.1714 },
  { id: 'belfast-waterfront', name: 'Belfast Waterfront Hall', address: '2 Lanyon Place, Belfast, BT1 3WH, Northern Ireland, UK', city: 'Belfast', nation: 'Northern Ireland', lat: 54.5966, lng: -5.9203 }
];
const artists = [
  { id: 'art-oasis', name: 'Oasis', genreKey: 'britpop', origin: 'Manchester, England · Formed 1991', bio: 'A defining force in 1990s Britpop, known for huge guitar melodies, direct songwriting and anthems built for a crowd singing together.', tracks: ["Don’t Look Back in Anger", 'Wonderwall', 'Champagne Supernova'], note: '', artworkKey: 'oasis', image: '' },
  { id: 'art-beatles', name: 'The Beatles', genreKey: 'britpop', origin: 'Liverpool, England', bio: 'A landmark group whose songwriting, studio experimentation and cultural impact reshaped modern popular music.', tracks: ['Hey Jude', 'Let It Be', 'Here Comes the Sun'], note: '', artworkKey: 'beatles', image: '' },
  { id: 'art-pinkfloyd', name: 'Pink Floyd', genreKey: 'prog', origin: 'London, England', bio: 'Pioneers of progressive and psychedelic rock, celebrated for conceptual records, expansive sound design and immersive live production.', tracks: ['Wish You Were Here', 'Time', 'Comfortably Numb'], note: '', artworkKey: 'pinkfloyd', image: '' },
  { id: 'art-bobdylan', name: 'Bob Dylan', genreKey: 'folk', origin: 'Duluth, Minnesota · Singer-songwriter', bio: 'A Nobel Prize-winning songwriter whose poetic work helped redefine the possibilities of folk, rock and popular lyricism.', tracks: ["Blowin’ in the Wind", 'Like a Rolling Stone', 'The Times They Are A-Changin’'], note: '', artworkKey: 'bobdylan', image: '' },
  { id: 'art-adele', name: 'Adele', genreKey: 'soulpop', origin: 'Tottenham, London, England', bio: 'A British vocalist known for emotionally direct songwriting, rich piano-led arrangements and a commanding live voice.', tracks: ['Rolling in the Deep', 'Someone Like You', 'Set Fire to the Rain'], note: '', artworkKey: 'adele', image: '' },
  { id: 'art-taylor', name: 'Taylor Swift', genreKey: 'soulpop', origin: 'West Reading, Pennsylvania · Singer-songwriter', bio: 'A celebrated songwriter whose narrative craft moves across country, pop and intimate acoustic arrangements.', tracks: ['Anti-Hero', 'All Too Well', 'Style'], note: '', artworkKey: 'taylorswift', image: '' },
  { id: 'art-jaychou', name: 'Jay Chou (周杰伦)', genreKey: 'mandopop', origin: 'New Taipei, Taiwan', bio: 'A major figure in Mandopop, blending classical piano, R&B, hip-hop and traditional Chinese musical colours.', tracks: ['晴天', '七里香', '断了的弦'], note: '', artworkKey: 'jaychou', image: '' }
];
function makeEvents() {
  const byId = Object.fromEntries(venues.map(v => [v.id, v]));
  const rows = [
    ['evt-oasis-paisley', 'Paisley Abbey Britpop & Oasis Tribute Night', 'Oasis', 'oasis', 'britpop', 'paisley-abbey', '2026-12-06T19:30:00', 18, 'A full-band celebration of the guitar anthems that defined a generation, staged in the heart of Paisley.'],
    ['evt-beatles-liverpool', 'Liverpool: The Beatles 1967–1970 Live Ensemble', 'The Beatles', 'beatles', 'britpop', 'liverpool-cavern', '2026-12-12T20:00:00', 24, 'A richly arranged live journey through the late-period Beatles songbook in the city where it all began.'],
    ['evt-floyd-london', 'Wish You Were Here: A Pink Floyd Sound & Light Experience', 'Pink Floyd', 'pinkfloyd', 'prog', 'london-royal-albert', '2026-12-16T20:30:00', 35, 'Immersive sound, considered lighting and a live performance inspired by the band’s most atmospheric work.'],
    ['evt-jay-edinburgh', 'Edinburgh Mandopop Gala: The Jay Chou Sessions', 'Jay Chou (周杰伦)', 'jaychou', 'mandopop', 'edinburgh-usher', '2026-12-18T19:30:00', 28, 'Classical piano, live strings and contemporary Mandopop in an intimate orchestral celebration.'],
    ['evt-adele-london', 'Adele: Orchestral Soul Sessions', 'Adele', 'adele', 'soulpop', 'london-abbey-road', '2026-12-21T20:00:00', 32, 'A close-up vocal showcase with piano and strings, celebrating some of the most loved modern soul ballads.'],
    ['evt-taylor-manchester', 'Manchester Midnights: Acoustic Sessions', 'Taylor Swift', 'taylorswift', 'soulpop', 'manchester-apollo', '2026-12-23T19:30:00', 26, 'An intimate acoustic interpretation of contemporary pop songwriting, with candlelit staging and live ensemble.']
  ];
  return rows.map(([id, title, artist, artworkKey, genreKey, venueId, date, price, description]) => ({ ...byId[venueId], id, title, artist, artworkKey, genreKey, venueId, date, price, description, status: 'On sale', capacity: 100, createdAt: new Date().toISOString() }));
}

const count = () => db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
function seed() {
  const admin = { id: randomUUID(), name: 'Aurelia Organizer', email: 'admin@aurelia.uk', passwordHash: bcrypt.hashSync('Aurelia2026!', 10), role: 'admin', followedArtists: [] };
  const guest = { id: randomUUID(), name: 'Vinyl Guest', email: 'guest@aurelia.uk', passwordHash: bcrypt.hashSync('Vinyl2026!', 10), role: 'user', followedArtists: ['art-oasis', 'art-jaychou'] };
  writeStore({ users: [admin, guest], events: makeEvents(), artists, tickets: [] });
}

export function readStore() {
  const users = db.prepare('SELECT id, name, email, password_hash AS passwordHash, role FROM users').all().map(u => ({ ...u, followedArtists: db.prepare('SELECT artist_id FROM follows WHERE user_id = ?').all(u.id).map(x => x.artist_id) }));
  const venueRows = db.prepare('SELECT * FROM venues').all();
  const venueById = Object.fromEntries(venueRows.map(v => [v.id, v]));
  const events = db.prepare('SELECT * FROM events ORDER BY date').all().map(e => ({ ...venueById[e.venue_id], ...e, id: e.id, venueId: e.venue_id, artworkKey: e.artwork_key, genreKey: e.genre_key, createdAt: e.created_at, date: e.date, price: Number(e.price), capacity: Number(e.capacity) }));
  const artistRows = db.prepare('SELECT * FROM artists').all().map(a => ({ id: a.id, name: a.name, genreKey: a.genre_key, origin: a.origin, bio: a.bio, tracks: JSON.parse(a.tracks_json || '[]'), note: a.note, artworkKey: a.artwork_key, image: a.image }));
  const tickets = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all().map(t => ({ id: t.id, ticketCode: t.ticket_code, eventId: t.event_id, userId: t.user_id, eventTitle: t.event_title, artist: t.artist, venueName: t.venue_name, address: t.address, city: t.city, date: t.event_date, seats: db.prepare('SELECT seat_code FROM ticket_seats WHERE ticket_id = ? ORDER BY seat_code').all(t.id).map(s => s.seat_code), tier: t.tier, tierLabel: t.tier_label, unitPrice: Number(t.unit_price), totalPrice: Number(t.total_price), holderName: t.holder_name, email: t.email, createdAt: t.created_at, status: t.status }));
  return { users, events, artists: artistRows, tickets };
}

export function writeStore(store) {
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec('DELETE FROM ticket_seats; DELETE FROM tickets; DELETE FROM follows; DELETE FROM events; DELETE FROM artists; DELETE FROM venues; DELETE FROM users;');
    const venueInsert = db.prepare('INSERT INTO venues(id,name,address,city,nation,lat,lng) VALUES(?,?,?,?,?,?,?)');
    for (const v of venues) venueInsert.run(v.id, v.name, v.address, v.city, v.nation, v.lat, v.lng);
    const userInsert = db.prepare('INSERT INTO users(id,name,email,password_hash,role,created_at) VALUES(?,?,?,?,?,?)');
    for (const u of store.users || []) userInsert.run(u.id, u.name, u.email, u.passwordHash, u.role || 'user', u.createdAt || new Date().toISOString());
    const artistInsert = db.prepare('INSERT INTO artists(id,name,genre_key,origin,bio,tracks_json,note,artwork_key,image) VALUES(?,?,?,?,?,?,?,?,?)');
    for (const a of store.artists || []) artistInsert.run(a.id, a.name, a.genreKey || 'other', a.origin || '', a.bio || '', JSON.stringify(a.tracks || []), a.note || '', a.artworkKey || '', a.image || '');
    const followInsert = db.prepare('INSERT OR IGNORE INTO follows(user_id,artist_id,created_at) VALUES(?,?,?)');
    for (const u of store.users || []) for (const artistId of u.followedArtists || []) followInsert.run(u.id, artistId, new Date().toISOString());
    const eventInsert = db.prepare('INSERT INTO events(id,title,artist,artwork_key,genre_key,venue_id,date,price,description,capacity,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)');
    for (const e of store.events || []) eventInsert.run(e.id, e.title, e.artist, e.artworkKey || '', e.genreKey || 'other', e.venueId, e.date, Number(e.price), e.description || '', Number(e.capacity || 100), e.status || 'On sale', e.createdAt || new Date().toISOString());
    const ticketInsert = db.prepare('INSERT INTO tickets(id,ticket_code,event_id,user_id,event_title,artist,venue_name,address,city,event_date,tier,tier_label,unit_price,total_price,holder_name,email,created_at,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    const seatInsert = db.prepare('INSERT INTO ticket_seats(ticket_id,event_id,seat_code) VALUES(?,?,?)');
    for (const t of store.tickets || []) {
      ticketInsert.run(t.id, t.ticketCode, t.eventId, t.userId || null, t.eventTitle, t.artist, t.venueName, t.address, t.city, t.date, t.tier, t.tierLabel, Number(t.unitPrice), Number(t.totalPrice), t.holderName, t.email, t.createdAt, t.status || 'reserved');
      for (const seat of t.seats || []) seatInsert.run(t.id, t.eventId, seat);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// One-time migration from the original JSON prototype to the relational SQLite schema.
if (count() === 0) {
  if (fs.existsSync(LEGACY_STORE_FILE)) {
    try { writeStore(JSON.parse(fs.readFileSync(LEGACY_STORE_FILE, 'utf8'))); }
    catch (error) { console.error('Legacy JSON migration failed; creating fresh demo data.', error); seed(); }
  } else seed();
}

export const VENUES = venues;
export const newId = () => randomUUID();
