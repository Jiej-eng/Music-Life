import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStore, writeStore, VENUES, newId } from './store.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret-before-public-deployment';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true, credentials: false }));
app.use(express.json({ limit: '4mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));

const getStore = () => readStore();
const safeUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, followedArtists: u.followedArtists || [] });
const tokenFor = (u) => jwt.sign({ sub: u.id, role: u.role }, JWT_SECRET, { expiresIn: '7d' });
const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const store = getStore();
    const user = store.users.find(x => x.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
};
const adminOnly = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Organizer access is required for this action.' });
const eventWithStats = (event, tickets) => {
  const bookedCount = tickets.filter(t => t.eventId === event.id).reduce((sum, t) => sum + t.seats.length, 0);
  return { ...event, bookedCount, remaining: Math.max(0, event.capacity - bookedCount) };
};
const seatInventory = (event, tickets) => {
  const reserved = tickets.filter(t => t.eventId === event.id).flatMap(t => t.seats);
  return { eventId: event.id, rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], columns: 10, reserved };
};
const cleanText = (value, max = 240) => String(value ?? '').trim().slice(0, max);
const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Aurelia Vinyl Live API', time: new Date().toISOString() }));

app.post('/api/auth/register', async (req, res) => {
  const name = cleanText(req.body.name, 80);
  const email = cleanText(req.body.email, 160).toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2) return res.status(400).json({ error: 'Please enter a name with at least 2 characters.' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
  const store = getStore();
  if (store.users.some(u => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' });
  const user = { id: newId(), name, email, passwordHash: await bcrypt.hash(password, 12), role: 'user', followedArtists: [] };
  store.users.push(user);
  writeStore(store);
  res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = cleanText(req.body.email, 160).toLowerCase();
  const password = String(req.body.password || '');
  const store = getStore();
  const user = store.users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
  res.json({ token: tokenFor(user), user: safeUser(user) });
});

app.get('/api/auth/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));

app.get('/api/events', (_req, res) => {
  const store = getStore();
  const result = store.events.map(e => eventWithStats(e, store.tickets)).sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ events: result, venues: VENUES });
});

app.get('/api/events/:id/seats', (req, res) => {
  const store = getStore();
  const event = store.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  res.json(seatInventory(event, store.tickets));
});

app.post('/api/events', auth, adminOnly, (req, res) => {
  const title = cleanText(req.body.title, 150);
  const artist = cleanText(req.body.artist, 100);
  const venue = VENUES.find(v => v.id === req.body.venueId);
  const date = new Date(req.body.date);
  const price = Number(req.body.price);
  if (title.length < 4 || artist.length < 2 || !venue || Number.isNaN(date.getTime()) || date <= new Date() || !Number.isFinite(price) || price < 1 || price > 1000) {
    return res.status(400).json({ error: 'Check the show title, artist, future date, venue and ticket price.' });
  }
  const store = getStore();
  const event = {
    ...venue, id: `evt-${crypto.randomUUID()}`, title, artist, description: cleanText(req.body.description, 1200), genreKey: cleanText(req.body.genreKey, 30) || 'britpop', artworkKey: cleanText(req.body.artworkKey, 40) || 'oasis',
    venueId: venue.id, date: date.toISOString(), price: Number(price.toFixed(2)), capacity: 100, status: 'On sale', createdAt: new Date().toISOString()
  };
  store.events.push(event);
  writeStore(store);
  res.status(201).json({ event: eventWithStats(event, store.tickets) });
});

app.get('/api/artists', (req, res) => {
  const store = getStore();
  const user = (() => {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    if (!token) return null;
    try { const payload = jwt.verify(token, JWT_SECRET); return store.users.find(u => u.id === payload.sub) || null; } catch { return null; }
  })();
  res.json({ artists: store.artists, followedArtists: user?.followedArtists || [] });
});

app.post('/api/artists', auth, (req, res) => {
  const name = cleanText(req.body.name, 100);
  if (name.length < 2) return res.status(400).json({ error: 'Artist name is required.' });
  const store = getStore();
  const artist = {
    id: `art-${crypto.randomUUID()}`, name, genreKey: cleanText(req.body.genreKey, 30) || 'britpop', origin: cleanText(req.body.origin, 160) || 'Independent archive entry',
    bio: cleanText(req.body.bio, 1600), tracks: String(req.body.tracks || '').split(/[,，\n]/).map(s => cleanText(s, 100)).filter(Boolean).slice(0, 12),
    note: '', artworkKey: 'custom', image: typeof req.body.image === 'string' && req.body.image.startsWith('data:image/') ? req.body.image.slice(0, 2500000) : ''
  };
  store.artists.unshift(artist);
  writeStore(store);
  res.status(201).json({ artist });
});

app.patch('/api/artists/:id/note', auth, (req, res) => {
  const store = getStore();
  const artist = store.artists.find(a => a.id === req.params.id);
  if (!artist) return res.status(404).json({ error: 'Artist not found.' });
  artist.note = cleanText(req.body.note, 1200);
  writeStore(store);
  res.json({ artist });
});

app.post('/api/artists/:id/follow', auth, (req, res) => {
  const store = getStore();
  if (!store.artists.some(a => a.id === req.params.id)) return res.status(404).json({ error: 'Artist not found.' });
  const user = store.users.find(u => u.id === req.user.id);
  user.followedArtists ||= [];
  const followed = user.followedArtists.includes(req.params.id);
  user.followedArtists = followed ? user.followedArtists.filter(id => id !== req.params.id) : [...user.followedArtists, req.params.id];
  writeStore(store);
  res.json({ followed: !followed, followedArtists: user.followedArtists });
});

app.post('/api/tickets', (req, res) => {
  const eventId = cleanText(req.body.eventId, 100);
  const seats = Array.isArray(req.body.seats) ? [...new Set(req.body.seats.map(s => cleanText(s, 8)))] : [];
  const holderName = cleanText(req.body.holderName, 100);
  const email = cleanText(req.body.email, 160).toLowerCase();
  const tier = ['student', 'general', 'vip'].includes(req.body.tier) ? req.body.tier : 'general';
  if (!eventId || seats.length < 1 || seats.length > 8 || !holderName || !validEmail(email)) return res.status(400).json({ error: 'Enter attendee details and select between 1 and 8 seats.' });
  const validSeats = new Set(Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => `${String.fromCharCode(65 + r)}${String(c + 1).padStart(2, '0')}`)).flat());
  if (seats.some(s => !validSeats.has(s))) return res.status(400).json({ error: 'One or more selected seats are invalid.' });
  const store = getStore();
  const event = store.events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'This show is no longer available.' });
  const inventory = seatInventory(event, store.tickets);
  const conflicts = seats.filter(s => inventory.reserved.includes(s));
  if (conflicts.length) return res.status(409).json({ error: `These seats have just been taken: ${conflicts.join(', ')}. Please choose again.`, conflicts });
  const booked = inventory.reserved.length;
  if (booked + seats.length > event.capacity) return res.status(409).json({ error: 'There are not enough seats remaining for this order.' });
  const multiplier = tier === 'student' ? 0.75 : tier === 'vip' ? 1.5 : 1;
  const promo = ['UWS20', 'PAISLEY20'].includes(cleanText(req.body.promoCode, 24).toUpperCase()) ? 0.2 : 0;
  const unitPrice = Number((event.price * multiplier * (1 - promo)).toFixed(2));
  const totalPrice = Number((unitPrice * seats.length).toFixed(2));
  const tierLabel = tier === 'student' ? 'Student Pass' : tier === 'vip' ? 'VIP Soundcheck' : 'General Admission';
  const ticket = {
    id: newId(), ticketCode: `AV-${crypto.randomInt(100000, 999999)}`, eventId, eventTitle: event.title, artist: event.artist, venueName: event.name, address: event.address, city: event.city, date: event.date,
    seats, tier, tierLabel, unitPrice, totalPrice, holderName, email, createdAt: new Date().toISOString(), status: 'reserved'
  };
  store.tickets.unshift(ticket);
  writeStore(store);
  res.status(201).json({ ticket, event: eventWithStats(event, store.tickets) });
});

app.get('/api/tickets', auth, (req, res) => {
  const store = getStore();
  const tickets = req.user.role === 'admin' ? store.tickets : store.tickets.filter(t => t.email === req.user.email);
  res.json({ tickets });
});

app.get('/api/venues', (_req, res) => res.json({ venues: VENUES }));

const distPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => err && res.status(404).send('Build the frontend with npm run build first.'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error. Please try again.' });
});

app.listen(PORT, () => console.log(`Aurelia Vinyl Live API running on http://localhost:${PORT}`));
