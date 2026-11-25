import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, 'data');
export const STORE_FILE = path.join(DATA_DIR, 'store.json');

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
  return rows.map(([id, title, artist, artworkKey, genreKey, venueId, date, price, description]) => ({
    ...byId[venueId], id, title, artist, artworkKey, genreKey, venueId, date, price, description, status: 'On sale', capacity: 100, createdAt: new Date().toISOString()
  }));
}

export function readStore() {
  if (!fs.existsSync(STORE_FILE)) return initializeStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return { users: [], events: [], artists: [], tickets: [], ...parsed };
  } catch {
    return initializeStore();
  }
}

export function writeStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(temp, STORE_FILE);
}

export function initializeStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const admin = { id: randomUUID(), name: 'Aurelia Organizer', email: 'admin@aurelia.uk', passwordHash: bcrypt.hashSync('Aurelia2026!', 10), role: 'admin', followedArtists: [] };
  const guest = { id: randomUUID(), name: 'Vinyl Guest', email: 'guest@aurelia.uk', passwordHash: bcrypt.hashSync('Vinyl2026!', 10), role: 'user', followedArtists: ['art-oasis', 'art-jaychou'] };
  const store = { users: [admin, guest], events: makeEvents(), artists, tickets: [] };
  writeStore(store);
  return store;
}

export const VENUES = venues;
export const newId = () => randomUUID();
