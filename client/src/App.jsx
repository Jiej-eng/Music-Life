import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, AudioLines, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleHelp, Compass, Disc3, Globe2,
  MapPin, Menu, Moon, Music2, Search, ShieldCheck, Sun, Ticket, X,
  LogOut, UserRound, Plus, Heart, LocateFixed, SlidersHorizontal, Mail, LockKeyhole,
  WalletCards, MapPinned, LoaderCircle, BadgeCheck, Mic2
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=2200&q=90';

const ARTIST_COVERS = {
  oasis: '/cover/oasis-morning.jpg',
  adele: '/cover/adele.jpg',
  taylor: '/cover/taylorswift.jpg',
  jay: '/cover/jaychou-ep.jpg'
};

const DEFAULT_MEDIA = {
  stagePurple: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85',
  liveCrowd: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85',
  micDark: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=85',
  vinylDeck: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=85',
  guitarStage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=85',
  neonSynth: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=85',
  pianoHall: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1600&q=85',
  acousticStudio: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1600&q=85'
};

const INITIAL_VENUES = [
  { id: 'paisley-abbey', name: 'Paisley Abbey & High St Live Hall', address: 'Abbey Close, Paisley, PA1 1JG, Scotland, UK', city: 'Paisley', nation: 'Scotland', lat: 55.8456, lng: -4.4239 },
  { id: 'glasgow-barrowland', name: 'Glasgow Barrowland Ballroom', address: '244 Gallowgate, Glasgow, G4 0TT, Scotland, UK', city: 'Glasgow', nation: 'Scotland', lat: 55.8553, lng: -4.2367 },
  { id: 'edinburgh-usher', name: 'Edinburgh Usher Hall', address: 'Lothian Road, Edinburgh, EH1 2EA, Scotland, UK', city: 'Edinburgh', nation: 'Scotland', lat: 55.9472, lng: -3.2046 },
  { id: 'newcastle-boiler', name: 'Newcastle Boiler Shop & Ouseburn', address: '20 South Street, Newcastle upon Tyne, NE1 3PE, England, UK', city: 'Newcastle', nation: 'England', lat: 54.9685, lng: -1.6085 },
  { id: 'leeds-brudenell', name: 'Leeds Brudenell Social Club', address: '33 Queen’s Road, Hyde Park, Leeds, LS6 1NY, England, UK', city: 'Leeds', nation: 'England', lat: 53.8165, lng: -1.5774 },
  { id: 'manchester-apollo', name: 'Manchester O2 Apollo', address: 'Stockport Road, Manchester, M12 6AP, England, UK', city: 'Manchester', nation: 'England', lat: 53.4694, lng: -2.2223 },
  { id: 'liverpool-cavern', name: 'Liverpool Cavern Quarter', address: '10 Mathew Street, Liverpool, L2 6RE, England, UK', city: 'Liverpool', nation: 'England', lat: 53.4063, lng: -2.9879 },
  { id: 'sheffield-leadmill', name: 'Sheffield Leadmill & Kelham Hall', address: '7 Leadmill Road, Sheffield, S1 4SE, England, UK', city: 'Sheffield', nation: 'England', lat: 53.3752, lng: -1.4666 },
  { id: 'birmingham-symphony', name: 'Birmingham Symphony & Digbeth Hall', address: 'Broad Street, Birmingham, B1 2EA, England, UK', city: 'Birmingham', nation: 'England', lat: 52.4796, lng: -1.9102 },
  { id: 'bristol-beacon', name: 'Bristol Beacon & Harbourside Stage', address: 'Trenchard Street, Bristol, BS1 5AR, England, UK', city: 'Bristol', nation: 'England', lat: 51.4549, lng: -2.5993 },
  { id: 'cardiff-hoddinott', name: 'Cardiff Bay & St David’s Hall', address: 'The Hayes, Cardiff, CF10 1AH, Wales, UK', city: 'Cardiff', nation: 'Wales', lat: 51.4816, lng: -3.1757 },
  { id: 'brighton-dome', name: 'Brighton Dome & Pier Rooms', address: 'Church Street, Brighton, BN1 1UE, England, UK', city: 'Brighton', nation: 'England', lat: 50.8247, lng: -0.1381 },
  { id: 'london-royal-albert', name: 'London Royal Albert Hall', address: 'Kensington Gore, London, SW7 2AP, England, UK', city: 'London', nation: 'England', lat: 51.5009, lng: -0.1774 },
  { id: 'belfast-empire', name: 'Belfast Empire & Ulster Hall', address: '42 Botanic Avenue, Belfast, BT7 1JQ, Northern Ireland, UK', city: 'Belfast', nation: 'Northern Ireland', lat: 54.5886, lng: -5.9324 }
];

const INITIAL_EVENTS = [
  {
    id: 'evt-oasis-paisley',
    title: 'Paisley Abbey Britpop & Oasis Tribute Night',
    artist: 'Oasis',
    artworkKey: 'oasis',
    genreKey: 'britpop',
    venueId: 'paisley-abbey',
    name: 'Paisley Abbey & High St Live Hall',
    city: 'Paisley',
    date: '2026-12-06T19:30:00',
    price: 18,
    capacity: 100,
    remaining: 97,
    description: 'A full-band celebration of the guitar anthems that defined 90s British live music.',
    image: ARTIST_COVERS.oasis
  },
  {
    id: 'evt-jay-edinburgh',
    title: 'Edinburgh Mandopop Gala: The Jay Chou Sessions',
    artist: 'Jay Chou (周杰伦)',
    artworkKey: 'jay',
    genreKey: 'mandopop',
    venueId: 'edinburgh-usher',
    name: 'Edinburgh Usher Hall',
    city: 'Edinburgh',
    date: '2026-12-18T19:30:00',
    price: 28,
    capacity: 100,
    remaining: 97,
    description: 'Classical piano, live strings and contemporary Mandopop in an intimate orchestral celebration.',
    image: ARTIST_COVERS.jay
  },
  {
    id: 'evt-adele-london',
    title: 'Adele: Orchestral Soul Sessions',
    artist: 'Adele',
    artworkKey: 'adele',
    genreKey: 'soulpop',
    venueId: 'london-royal-albert',
    name: 'London Royal Albert Hall',
    city: 'London',
    date: '2026-12-21T20:00:00',
    price: 32,
    capacity: 100,
    remaining: 96,
    description: 'A close-up vocal showcase with piano and strings, celebrating some of the most loved modern soul ballads.',
    image: ARTIST_COVERS.adele
  },
  {
    id: 'evt-taylor-manchester',
    title: 'Manchester Midnights: Acoustic Sessions',
    artist: 'Taylor Swift',
    artworkKey: 'taylor',
    genreKey: 'folk',
    venueId: 'manchester-apollo',
    name: 'Manchester O2 Apollo',
    city: 'Manchester',
    date: '2026-12-23T19:30:00',
    price: 26,
    capacity: 100,
    remaining: 99,
    description: 'Late-night synth and storytelling arrangements inspired by nocturnal city lights.',
    image: ARTIST_COVERS.taylor
  },
  {
    id: 'evt-blaster-bristol',
    title: 'Bristol Bass & Blaster Wheel Live',
    artist: 'Blaster Wheel',
    artworkKey: 'prog',
    genreKey: 'prog',
    venueId: 'bristol-beacon',
    name: 'Bristol Beacon & Harbourside Stage',
    city: 'Bristol',
    date: '2027-01-09T21:00:00',
    price: 22,
    capacity: 100,
    remaining: 95,
    description: 'High-impact dub pulses, analog modulation and heavy live percussion.',
    image: DEFAULT_MEDIA.neonSynth
  },
  {
    id: 'evt-glasgow-vinyl-night',
    title: 'Glasgow Barrowland Late Vinyl Session',
    artist: 'The Verve',
    artworkKey: 'britpop',
    genreKey: 'britpop',
    venueId: 'glasgow-barrowland',
    name: 'Glasgow Barrowland Ballroom',
    city: 'Glasgow',
    date: '2027-01-14T20:00:00',
    price: 25,
    capacity: 100,
    remaining: 94,
    description: 'Widescreen shoegaze guitars and deep vinyl basslines under the Barrowland lights.',
    image: DEFAULT_MEDIA.vinylDeck
  }
];

const INITIAL_ARTISTS = [
  { id: 'art-1', name: 'Oasis', genreKey: 'britpop', origin: 'Manchester, England · Formed 1991', bio: 'Defining 90s Britpop with towering guitar hooks, sing-along choruses and stadium-sized swagger.', tracks: ['Don’t Look Back in Anger', 'Wonderwall', 'Champagne Supernova'], note: '', image: ARTIST_COVERS.oasis },
  { id: 'art-2', name: 'Adele', genreKey: 'soulpop', origin: 'Tottenham, London, England', bio: 'Soulful vocal storytelling anchored by grand piano arrangements and emotional clarity.', tracks: ['Rolling in the Deep', 'Someone Like You', 'Set Fire to the Rain'], note: '', image: ARTIST_COVERS.adele },
  { id: 'art-3', name: 'Taylor Swift', genreKey: 'folk', origin: 'West Reading, Pennsylvania · Singer-songwriter', bio: 'Intimate lyricism spanning acoustic folk textures, midnight synth pop and narrative songwriting.', tracks: ['Anti-Hero', 'All Too Well', 'Cardigan'], note: '', image: ARTIST_COVERS.taylor },
  { id: 'art-4', name: 'Jay Chou (周杰伦)', genreKey: 'mandopop', origin: 'New Taipei, Taiwan', bio: 'Blending classical piano motifs, R&B grooves and East Asian melodies into modern Mandopop.', tracks: ['晴天', '七里香', '夜曲'], note: '', image: ARTIST_COVERS.jay },
  { id: 'art-5', name: 'The Beatles', genreKey: 'britpop', origin: 'Liverpool, England · Formed 1960', bio: 'From Cavern Quarter club nights to studio innovation that reshaped global popular music.', tracks: ['Come Together', 'In My Life', 'Here Comes the Sun'], note: '', image: DEFAULT_MEDIA.vinylDeck },
  { id: 'art-6', name: 'Pink Floyd', genreKey: 'prog', origin: 'London, England · Formed 1965', bio: 'Architects of progressive soundscapes, concept records and spatial live lighting.', tracks: ['Wish You Were Here', 'Time', 'Comfortably Numb'], note: '', image: DEFAULT_MEDIA.stagePurple },
  { id: 'art-7', name: 'Arctic Monkeys', genreKey: 'britpop', origin: 'Sheffield, South Yorkshire, England', bio: 'Sharp indie-rock riffs, witty observations and late-night lounge evolutions.', tracks: ['Do I Wanna Know?', '505', 'Four Out of Five'], note: '', image: DEFAULT_MEDIA.liveCrowd },
  { id: 'art-8', name: 'The Verve', genreKey: 'britpop', origin: 'Wigan, Greater Manchester, England', bio: 'Psychedelic rock roots meeting orchestral strings and soaring Britpop anthems.', tracks: ['Bitter Sweet Symphony', 'Lucky Man', 'The Drugs Don’t Work'], note: '', image: DEFAULT_MEDIA.guitarStage },
  { id: 'art-9', name: 'Florence + The Machine', genreKey: 'soulpop', origin: 'Camberwell, London, England', bio: 'Sweeping harps, thunderous drums and theatrical vocal catharsis.', tracks: ['Dog Days Are Over', 'Shake It Out', 'Cosmic Love'], note: '', image: DEFAULT_MEDIA.micDark },
  { id: 'art-10', name: 'Eason Chan (陈奕迅)', genreKey: 'mandopop', origin: 'Hong Kong', bio: 'Expressive vocal phrasing across emotional ballads, jazz-inflected grooves and live theatre.', tracks: ['富士山下', 'K歌之王', '好久不见'], note: '', image: DEFAULT_MEDIA.pianoHall },
  { id: 'art-11', name: 'Phoebe Bridgers', genreKey: 'folk', origin: 'Los Angeles, California', bio: 'Quiet indie-folk confessionals, delicate guitar fingerpicking and haunting harmonies.', tracks: ['Motion Sickness', 'Kyoto', 'Scott Street'], note: '', image: DEFAULT_MEDIA.acousticStudio },
  { id: 'art-12', name: 'Amy Winehouse', genreKey: 'soulpop', origin: 'Camden Town, London, England', bio: 'Vintage 60s soul and jazz phrasing delivered with raw honesty and unmistakable timbre.', tracks: ['Back to Black', 'Valerie', 'Tears Dry on Their Own'], note: '', image: DEFAULT_MEDIA.micDark },
  { id: 'art-13', name: 'Blaster Wheel', genreKey: 'prog', origin: 'Bristol, England · Sound Collective', bio: 'Experimental live electronics, heavy sub-bass wheels and hypnotic modular synth journeys.', tracks: ['Wheel of Pressure', 'Sub-Harmonic Drift', 'Midnight Turbine'], note: '', image: DEFAULT_MEDIA.neonSynth },
  { id: 'art-14', name: 'Radiohead', genreKey: 'prog', origin: 'Abingdon, Oxfordshire, England', bio: 'Pioneering art-rock textures, polyrhythmic grooves and atmospheric studio craft.', tracks: ['Karma Police', 'Everything in Its Right Place', 'Weird Fishes'], note: '', image: DEFAULT_MEDIA.stagePurple },
  { id: 'art-15', name: 'Bicep', genreKey: 'prog', origin: 'Belfast, Northern Ireland', bio: 'Euphoric breakbeats, warm analog chords and club-to-festival electronic storytelling.', tracks: ['Glue', 'Apricots', 'Atlas'], note: '', image: DEFAULT_MEDIA.neonSynth },
  { id: 'art-16', name: 'Sam Fender', genreKey: 'folk', origin: 'North Shields, Tyne and Wear, England', bio: 'Heartland rock guitars and coastal storytelling rooted in Northern UK life.', tracks: ['Seventeen Going Under', 'Hypersonic Missiles', 'Spit of You'], note: '', image: DEFAULT_MEDIA.acousticStudio }
];

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SEAT_COLS = 10;

const INITIAL_RESERVED_BY_EVENT = {
  'evt-oasis-paisley': ['F08', 'G07', 'H10'],
  'evt-jay-edinburgh': ['D08', 'G07', 'J08'],
  'evt-adele-london': ['F08', 'G07', 'H10', 'J08'],
  'evt-taylor-manchester': ['F08'],
  'evt-blaster-bristol': ['C04', 'C05'],
  'evt-glasgow-vinyl-night': ['E06', 'E07']
};

function formatTicketCode(num) {
  return `AVL-${String(num).padStart(6, '0')}`;
}

function resolveArtistCover(nameOrKey = '', genreKey = '', fallback = FALLBACK_IMAGE) {
  const s = String(nameOrKey || '').toLowerCase();
  if (s.includes('oasis') || s.includes('绿洲')) return ARTIST_COVERS.oasis;
  if (s.includes('adele') || s.includes('阿黛尔')) return ARTIST_COVERS.adele;
  if (s.includes('taylor') || s.includes('swift') || s.includes('泰勒') || s.includes('斯威夫特')) return ARTIST_COVERS.taylor;
  if (s.includes('jay chou') || s.includes('jay') || s.includes('周杰伦')) return ARTIST_COVERS.jay;

  const genreMap = {
    britpop: DEFAULT_MEDIA.guitarStage,
    prog: DEFAULT_MEDIA.neonSynth,
    folk: DEFAULT_MEDIA.acousticStudio,
    soulpop: DEFAULT_MEDIA.micDark,
    mandopop: DEFAULT_MEDIA.pianoHall
  };
  return fallback || genreMap[genreKey] || FALLBACK_IMAGE;
}

function useSafeBg(primaryUrl, fallbackUrl = FALLBACK_IMAGE) {
  const [url, setUrl] = useState(primaryUrl || fallbackUrl);
  useEffect(() => {
    const target = primaryUrl || fallbackUrl;
    setUrl(target);
    if (!target || target.startsWith('http') || target.startsWith('data:')) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) setUrl(target); };
    img.onerror = () => { if (!cancelled) setUrl(fallbackUrl); };
    img.src = target;
    return () => { cancelled = true; };
  }, [primaryUrl, fallbackUrl]);
  return url;
}

const API = '/api';
const VALID_TABS = ['home', 'concerts', 'box', 'publish', 'search', 'artists', 'map'];
const LANG_OPTIONS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN · UK' },
  { code: 'us', label: 'US' },
  { code: 'fr', label: 'FR' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' }
];

const COPY = {
  zh: {
    nav: ['发现', '演出日历', '选座购票', '发布演出', '全站搜索', '艺人档案', '英国地图'],
    eyebrow: '现场音乐的艺术',
    heroTitle: '让每一个夜晚，\n都值得铭记。',
    heroText: '汇集现场音乐、传奇艺人与值得珍藏的瞬间。在英国各地发现精心策划的音乐现场。',
    heroBadge: '精选英国现场体验',
    heroSide: '声音与现场\n持续生长',
    scrollHint: '向下滚动探索',
    heroRight: '为热爱音乐而生',
    explore: '探索精彩演出',
    archive: '进入音乐档案',
    featured: '为热爱而精选',
    upcoming: '下一场值得期待的现场',
    allShows: '全部演出',
    from: '票价起',
    sold: '已售罄',
    limited: '余票紧张',
    onSale: '正在售票',
    boxTitle: '把这个夜晚留作珍藏',
    boxSub: '选择演出、挑选座位，并获取专属数字电子票。',
    publishTitle: '让一场新的现场发生',
    publishSub: '将你的音乐活动发布到 Aurelia 演出日历。',
    artistsTitle: '音乐人 · 传奇档案',
    artistsSub: '持续收藏那些声音、作品与值得传承的音乐故事。',
    mapTitle: '让音乐连接整个英国',
    mapSub: '支持鼠标滚轮缩放 · 探索承载现场音乐的城市与演出场馆。',
    searchPlaceholder: '搜索音乐人、演出或地点…',
    details: '查看详情',
    book: '立即选座',
    follow: '关注艺人',
    following: '已关注',
    signIn: '登录',
    register: '创建账号',
    signOut: '退出登录',
    date: '日期与时间',
    venue: '演出场馆',
    price: '票价起',
    genre: '音乐流派',
    artist: '艺人',
    title: '演出标题',
    description: '演出介绍',
    attendee: '观众姓名',
    email: '电子邮箱',
    tier: '票种',
    promo: '优惠码',
    reserve: '确认预订',
    total: '订单总额',
    seats: '已选座位',
    chooseEvent: '选择演出',
    student: '学生票 · 75折',
    general: '普通票',
    vip: 'VIP 试音票',
    open: '可预订',
    allGenres: '全部流派',
    allStatuses: '全部状态',
    reset: '重置筛选',
    loginTitle: '欢迎回来',
    registerTitle: '创建你的账号',
    password: '密码',
    name: '姓名',
    demo: '演示账号',
    organizer: '主办方',
    guest: '观众',
    noAccount: '还没有 Aurelia 账号？',
    hasAccount: '已经拥有账号？',
    publish: '发布演出',
    addArtist: '添加艺人',
    save: '保存修改',
    close: '关闭',
    note: '策展人手记',
    tracks: '代表作品',
    origin: '来自',
    mapSearch: '搜索英国地点…',
    allUK: '全英国',
    street: '街道地名',
    terrain: '自然地形',
    satellite: '卫星影像',
    ticketTitle: '预订确认单',
    ticketSub: '预订记录已保存。当前演示版本尚未收取款项。',
    loading: '正在加载…',
    empty: '这里暂时还没有内容。',
    error: '出现了一点问题，请重试。',
    secureNote: '提交预订时，系统会核验并锁定已选座位。',
    footer: '为现场音乐文化而生的独立空间。',
    rights: 'Aurelia Vinyl Live. 保留所有权利。',
    statsShows: '精选现场演出',
    statsCities: '英国目的地',
    statsArtists: '音乐人档案',
    discoverTag: '更有品位的现场音乐体验',
    viewArchive: '浏览音乐人档案',
    mapOpen: '探索地图',
    publishedNotice: '演出已创建，并已同步到演出日历与选座购票。',
    viewCalendar: '前往演出日历',
    storyHeading: '幕后故事',
    imageUrlLabel: '艺人图片链接（可选，留空自动匹配）',
    uploadFileLabel: '或从本地上传图片'
  },
  en: {
    nav: ['Discover', 'Concerts', 'Box office', 'Publish a show', 'Search', 'Artists', 'UK map'],
    eyebrow: 'THE ART OF LIVE MUSIC', heroTitle: 'A night worth\nremembering.',
    heroText: 'A considered home for live music, iconic artists and the moments that stay with you. Discover exceptional performances across the United Kingdom.',
    heroBadge: 'CURATED LIVE EXPERIENCES', heroSide: 'A CULTURE\nIN MOTION', scrollHint: 'SCROLL TO DISCOVER', heroRight: 'EST. FOR THE LOVE OF MUSIC',
    explore: 'Explore performances', archive: 'Enter the archive', featured: 'Curated for the curious', upcoming: 'The next great night out', allShows: 'All performances', from: 'FROM', sold: 'SOLD OUT', limited: 'FEW REMAINING', onSale: 'ON SALE',
    boxTitle: 'Make it a night to remember', boxSub: 'Choose your performance, select your seats and receive your digital pass.',
    publishTitle: 'Bring a new night to life', publishSub: 'Publish a live performance to the Aurelia calendar.', artistsTitle: 'Artists & archive', artistsSub: 'A living collection of voices, sounds and creative legacies.', mapTitle: 'Across the United Kingdom', mapSub: 'Scroll wheel to zoom · Explore venues, tour routes and cities.',
    searchPlaceholder: 'Search artists, performances or places…', details: 'View details', book: 'Choose seats', follow: 'Follow artist', following: 'Following', signIn: 'Sign in', register: 'Create account', signOut: 'Sign out',
    date: 'Date & time', venue: 'Venue', price: 'From', genre: 'Genre', artist: 'Artist', title: 'Performance title', description: 'About the performance',
    attendee: 'Attendee name', email: 'Email address', tier: 'Ticket type', promo: 'Promotional code', reserve: 'Confirm reservation', total: 'Total', seats: 'Selected seats', chooseEvent: 'Choose a performance',
    student: 'Student · 25% off', general: 'General admission', vip: 'VIP soundcheck',
    open: 'Available', allGenres: 'All genres', allStatuses: 'All availability', reset: 'Reset filters',
    loginTitle: 'Welcome back', registerTitle: 'Create your account', password: 'Password', name: 'Full name',
    demo: 'Demo access', organizer: 'Organizer', guest: 'Guest', noAccount: 'New to Aurelia?', hasAccount: 'Already have an account?',
    publish: 'Publish performance', addArtist: 'Add an artist', save: 'Save changes', close: 'Close',
    note: 'Curator notes', tracks: 'Essential listening', origin: 'Origin',
    mapSearch: 'Find a place in the UK…', allUK: 'All UK', street: 'Street', terrain: 'Terrain', satellite: 'Satellite',
    ticketTitle: 'Reservation confirmed', ticketSub: 'Your reservation is recorded. Payment is not collected in this demo.',
    loading: 'Loading…', empty: 'Nothing here just yet.', error: 'Something went wrong. Please try again.',
    secureNote: 'Seat availability is checked when you reserve.',
    footer: 'An independent home for live music culture.', rights: 'Aurelia Vinyl Live. All rights reserved.',
    statsShows: 'Curated performances', statsCities: 'UK destinations', statsArtists: 'Artist dossiers',
    discoverTag: 'A MORE CONSIDERED LIVE MUSIC EXPERIENCE', viewArchive: 'View artist archive', mapOpen: 'Explore the map',
    publishedNotice: 'Show created and live in Concerts & Box Office.', viewCalendar: 'View in Concerts',
    storyHeading: 'THE STORY',
    imageUrlLabel: 'Artist image URL (optional)',
    uploadFileLabel: 'Or upload image from device'
  }
};

function mergeCopy(lang) {
  return COPY[lang] || COPY.en;
}

const GENRES = [
  { id: 'britpop', label: 'Britpop & Rock', zh: '英伦摇滚', desc: 'Guitars, anthems & after-dark energy', zhDesc: '吉他、经典金曲与不眠的夜晚', image: ARTIST_COVERS.oasis, number: '01' },
  { id: 'prog', label: 'Blaster & Prog', zh: '爆破与前卫', desc: 'Heavy bass wheels, synth pulses & sonic journeys', zhDesc: '重低音爆破轮、合成器脉冲与声音旅程', image: DEFAULT_MEDIA.neonSynth, number: '02' },
  { id: 'folk', label: 'Folk & Songwriter', zh: '民谣与唱作', desc: 'Stories told one song at a time', zhDesc: '用一首歌讲述一个故事', image: ARTIST_COVERS.taylor, number: '03' },
  { id: 'soulpop', label: 'Soul & Pop', zh: '灵魂与流行', desc: 'Distinctive voices, timeless feeling', zhDesc: '独特嗓音与历久弥新的情感', image: ARTIST_COVERS.adele, number: '04' },
  { id: 'mandopop', label: 'Mandopop & Solo', zh: '华语与独唱', desc: 'Solo voices, piano motifs & modern grooves', zhDesc: '个人声线、钢琴旋律与当代律动', image: ARTIST_COVERS.jay, number: '05' }
];

const ZH_TEXT_MAP = {
  'A full-band celebration of the guitar anthems that defined 90s British live music.': '全乐队演绎定义 90 年代英伦现场的经典吉他圣歌。',
  'A close-up vocal showcase with piano and strings, celebrating some of the most loved modern soul ballads.': '一场聚焦永恒声线与词曲创作的亲密原声与管弦之夜。',
  'Late-night synth and storytelling arrangements inspired by nocturnal city lights.': '受午夜都市霓虹启发的深夜合成器与叙事编曲专场。',
  'High-impact dub pulses, analog modulation and heavy live percussion.': '高能量重低音爆破、模拟调制与强劲现场鼓点。',
  'Widescreen shoegaze guitars and deep vinyl basslines under the Barrowland lights.': '在舞厅灯光下铺开宽广吉他音墙与深沉黑胶低音。',
  'Paisley Abbey & High St Live Hall': '佩斯利修道院与高街现场厅',
  'Glasgow Barrowland Ballroom': '格拉斯哥巴罗兰舞厅',
  'Edinburgh Usher Hall': '爱丁堡亚瑟厅',
  'Manchester O2 Apollo': '曼彻斯特 O2 阿波罗剧院',
  'Liverpool Cavern Quarter': '利物浦洞穴街区',
  'London Royal Albert Hall': '伦敦皇家阿尔伯特音乐厅',
  'Bristol Beacon & Harbourside Stage': '布里斯托比肯与海港舞台',
  'Cardiff Bay & St David’s Hall': '卡迪夫湾与圣戴维斯音乐厅',
  'Brighton Dome & Pier Rooms': '布莱顿穹顶剧场与码头厅',
  'Birmingham Symphony & Digbeth Hall': '伯明翰交响与迪格贝斯大厅',
  'Leeds Brudenell Social Club': '利兹布鲁德内尔音乐俱乐部',
  'Sheffield Leadmill & Kelham Hall': '谢菲尔德利德米尔现场厅',
  'Newcastle Boiler Shop & Ouseburn': '纽卡斯尔锅炉房现场空间',
  'Belfast Empire & Ulster Hall': '贝尔法斯特帝国与阿尔斯特厅',
  'Paisley': '佩斯利',
  'Edinburgh': '爱丁堡',
  'Manchester': '曼彻斯特',
  'London': '伦敦',
  'Glasgow': '格拉斯哥',
  'Bristol': '布里斯托',
  'Cardiff': '卡迪夫',
  'Brighton': '布莱顿',
  'Birmingham': '伯明翰',
  'Leeds': '利兹',
  'Sheffield': '谢菲尔德',
  'Newcastle': '纽卡斯尔',
  'Belfast': '贝尔法斯特',
  'Scotland': '苏格兰',
  'England': '英格兰',
  'Wales': '威尔士',
  'Northern Ireland': '北爱尔兰',
  'United Kingdom': '英国'
};

function localizeText(text, lang) {
  if (!text) return '';
  if (lang === 'zh' && ZH_TEXT_MAP[text]) return ZH_TEXT_MAP[text];
  return text;
}

const genreTitle = (genre, lang) => (!genre ? '' : (lang === 'zh' ? (genre.zh || genre.label) : genre.label));
const genreDesc = (genre, lang) => (!genre ? '' : (lang === 'zh' ? (genre.zhDesc || genre.desc) : genre.desc));

const formatDate = (date, lang = 'zh') => {
  if (!date) return lang === 'zh' ? '日期待定' : 'Date to be announced';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const money = (value) => new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2
}).format(Number(value || 0));

const timeShort = (date) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(d);
};

function getTabFromHash() {
  const raw = (window.location.hash || '').replace(/^#/, '').trim();
  return VALID_TABS.includes(raw) ? raw : 'home';
}

function getThemeTokens(theme) {
  if (theme === 'light') {
    return {
      rootBg: 'linear-gradient(180deg, #f7f4ee 0%, #f1ece2 52%, #ebe4d7 100%)',
      textPrimary: '#18181b',
      textSecondary: '#4b4b52',
      textMuted: '#686872',
      accentGold: '#9a7226',
      headerBg: 'rgba(250, 247, 242, 0.78)',
      headerBorder: 'rgba(24, 24, 27, 0.08)',
      panelBg: 'rgba(255, 253, 249, 0.74)',
      controlBg: 'rgba(255, 255, 255, 0.82)',
      pillBg: 'rgba(255, 255, 255, 0.68)',
      pillActiveBg: 'rgba(154, 114, 38, 0.14)',
      pillActiveText: '#7c5815',
      borderHairline: 'rgba(24, 24, 27, 0.09)',
      borderGoldHairline: 'rgba(154, 114, 38, 0.24)',
      selectOptionBg: '#faf7f2',
      selectOptionColor: '#18181b',
      footerBg: 'rgba(244, 239, 230, 0.82)'
    };
  }
  return {
    rootBg: 'radial-gradient(circle at 15% 0%, rgba(216, 189, 131, 0.06), transparent 42%), linear-gradient(180deg, #0b0d11 0%, #0f1218 55%, #0c0e13 100%)',
    textPrimary: '#f4f1ea',
    textSecondary: '#c4c0b6',
    textMuted: '#8d8a82',
    accentGold: '#dec286',
    headerBg: 'rgba(11, 13, 17, 0.72)',
    headerBorder: 'rgba(255, 255, 255, 0.08)',
    panelBg: 'rgba(18, 21, 28, 0.56)',
    controlBg: 'rgba(22, 26, 35, 0.62)',
    pillBg: 'rgba(20, 23, 31, 0.52)',
    pillActiveBg: 'rgba(222, 194, 134, 0.15)',
    pillActiveText: '#f0d79e',
    borderHairline: 'rgba(255, 255, 255, 0.09)',
    borderGoldHairline: 'rgba(222, 194, 134, 0.24)',
    selectOptionBg: '#151922',
    selectOptionColor: '#f4f1ea',
    footerBg: 'rgba(11, 13, 17, 0.74)'
  };
}

async function request(path, { token, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function BrandMark({ small = false, color = '#d8bd83' }) {
  const size = small ? 22 : 28;
  return (
    <span className={`brand-mark ${small ? 'small' : ''}`} aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M6 15.5C6 9.977 10.477 5.5 16 5.5C21.523 5.5 26 9.977 26 15.5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
        <rect x="3.5" y="13.5" width="4" height="6.5" rx="2" fill={color} />
        <rect x="24.5" y="13.5" width="4" height="6.5" rx="2" fill={color} />
        <rect x="8.5" y="10.5" width="15" height="11" rx="3.5" fill="rgba(16,19,26,0.72)" stroke={color} strokeWidth="1.35" />
        <line x1="16" y1="6.5" x2="16" y2="10.5" stroke={color} strokeWidth="1.35" />
        <circle cx="16" cy="5.5" r="1.4" fill={color} />
        <circle cx="12.8" cy="15.5" r="1.4" fill={color} />
        <circle cx="19.2" cy="15.5" r="1.4" fill={color} />
        <rect x="7" y="23.5" width="18" height="4" rx="1.5" fill="rgba(22,26,35,0.72)" stroke={color} strokeWidth="1.2" />
        <circle cx="13.5" cy="25.5" r="1.15" fill={color} />
        <line x1="18" y1="25.5" x2="22" y2="25.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SectionHeading({ overline, title, text, action }) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{overline}</div>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function EventCard({ event, lang, onDetails, onBook, compact = false, tokens }) {
  const defaultImg = resolveArtistCover(event.artist || event.title || event.artworkKey, event.genreKey, DEFAULT_MEDIA.liveCrowd);
  const image = useSafeBg(event.image || event.photo || defaultImg, defaultImg);
  const status = event.remaining === 0 ? 'sold' : event.remaining < 16 ? 'limited' : 'onSale';
  const statusText = status === 'sold'
    ? (lang === 'zh' ? '已售罄' : 'SOLD OUT')
    : status === 'limited'
      ? (lang === 'zh' ? '余票紧张' : 'FEW REMAINING')
      : (lang === 'zh' ? '正在售票' : 'ON SALE');
  const genreObj = GENRES.find(g => g.id === event.genreKey);

  return (
    <article
      className={`event-card ${compact ? 'compact' : ''}`}
      style={{
        background: tokens.panelBg,
        backdropFilter: 'blur(14px)',
        border: `1px solid ${tokens.borderHairline}`,
        color: tokens.textPrimary
      }}
    >
      <button
        type="button"
        className="event-image"
        onClick={onDetails}
        aria-label={`View ${event.title}`}
        style={{ backgroundImage: `linear-gradient(180deg,rgba(9,10,10,.05),rgba(9,10,10,.64)),url("${image}")` }}
      >
        <span className={`status-tag ${status}`}>{statusText}</span>
        <span className="image-arrow" style={{ borderColor: 'rgba(255,255,255,0.22)', background: 'rgba(12,14,19,0.52)' }}><ArrowUpRight size={19} /></span>
      </button>
      <div className="event-card-body">
        <div className="event-meta" style={{ color: tokens.textMuted }}>
          <span>{genreObj ? genreTitle(genreObj, lang).toUpperCase() : String(event.genreKey || '').toUpperCase()}</span>
          <span>{timeShort(event.date)}</span>
        </div>
        <h3 style={{ color: tokens.textPrimary }}>{event.title}</h3>
        <p className="event-artist" style={{ color: tokens.textSecondary }}>{event.artist}</p>
        <div className="event-card-bottom" style={{ borderTopColor: tokens.borderHairline }}>
          <span className="event-price" style={{ color: tokens.textPrimary }}>
            <small style={{ color: tokens.textMuted }}>{lang === 'zh' ? '票价起' : 'FROM'}</small>
            {money(event.price)}
          </span>
          <div className="event-actions">
            <button type="button" className="text-action" style={{ color: tokens.textPrimary }} onClick={onDetails}>
              {lang === 'zh' ? '详情' : 'Details'}
            </button>
            <button
              type="button"
              className="circle-action"
              style={{ borderColor: tokens.borderGoldHairline, background: tokens.pillBg, color: tokens.textPrimary }}
              onClick={onBook}
              aria-label="Choose seats"
            >
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ArtistCardItem({ artist, index, lang, followed, genreObj, onOpen, onToggleFollow, tokens }) {
  const fallbackImg = resolveArtistCover(artist.name, artist.genreKey, genreObj?.image || FALLBACK_IMAGE);
  const bgUrl = useSafeBg(artist.image || fallbackImg, fallbackImg);
  return (
    <article
      className="artist-card"
      style={{
        background: tokens.panelBg,
        backdropFilter: 'blur(14px)',
        border: `1px solid ${tokens.borderHairline}`,
        color: tokens.textPrimary
      }}
    >
      <button
        type="button"
        className="artist-image"
        onClick={onOpen}
        style={{ backgroundImage: `linear-gradient(180deg,rgba(12,12,12,.06),rgba(12,12,12,.78)),url("${bgUrl}")` }}
      >
        <span>ARCHIVE / {String(index + 1).padStart(2, '0')}</span>
        <i><ArrowUpRight size={19} /></i>
      </button>
      <div className="artist-card-body">
        <div className="artist-card-meta" style={{ color: tokens.textMuted }}>
          {genreTitle(genreObj, lang) || 'ARTIST'} <span style={{ color: tokens.textSecondary }}>{localizeText(artist.origin, lang)}</span>
        </div>
        <h3 style={{ color: tokens.textPrimary }}>{artist.name}</h3>
        <p style={{ color: tokens.textSecondary }}>{localizeText(artist.bio, lang)}</p>
        <div className="artist-card-bottom" style={{ borderTopColor: tokens.borderHairline }}>
          <button type="button" className="text-action" style={{ color: tokens.textPrimary }} onClick={onOpen}>
            {lang === 'zh' ? '打开档案' : 'Details'}
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            className={`follow-button ${followed ? 'following' : ''}`}
            style={{
              borderColor: followed ? tokens.borderGoldHairline : tokens.borderHairline,
              background: followed ? tokens.pillActiveBg : tokens.pillBg,
              color: followed ? tokens.pillActiveText : tokens.textPrimary
            }}
            onClick={onToggleFollow}
            title={followed ? 'Following' : 'Follow'}
          >
            {followed ? <Check size={15} /> : <Heart size={15} />}
          </button>
        </div>
      </div>
    </article>
  );
}

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 7, { duration: 0.7 });
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (event) => onMapClick?.(event.latlng) });
  return null;
}

function VenueMap({ venues, selected, onSelect, onMapClick, tile = 'street', height = '520px', lang = 'zh', tokens }) {
  const [center, setCenter] = useState([54.55, -3.0]);
  useEffect(() => {
    if (selected) setCenter([selected.lat, selected.lng]);
  }, [selected]);

  const tiles = tile === 'satellite'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : tile === 'terrain'
      ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = tile === 'satellite'
    ? 'Tiles © Esri'
    : tile === 'terrain'
      ? 'Map data: © OpenStreetMap & SRTM | © OpenTopoMap'
      : '&copy; OpenStreetMap contributors';

  const routeLine = useMemo(() => {
    if (!venues || venues.length < 2) return null;
    return venues
      .filter(v => typeof v.lat === 'number' && typeof v.lng === 'number')
      .map(v => [v.lat, v.lng]);
  }, [venues]);

  const makeBadgeIcon = useCallback((count, isSelected, tone = 'blue') => {
    const bg = tone === 'green' ? '#2d7a4f' : '#1b6fe8';
    const ring = tone === 'green' ? 'rgba(45, 122, 79, 0.28)' : 'rgba(27, 111, 232, 0.28)';
    const size = isSelected ? 36 : 30;
    return L.divIcon({
      className: `aurelia-marker ${isSelected ? 'selected' : ''}`,
      html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:999px;background:${bg};color:#fff;font-weight:700;font-size:12px;border:1.5px solid rgba(255,255,255,0.88);box-shadow:0 0 0 5px ${ring},0 4px 12px rgba(0,0,0,.3);transform:translate(-50%,-50%);">${count}</span>`,
      iconSize: [0, 0]
    });
  }, []);

  const markers = useMemo(() => {
    const groups = [];
    venues.forEach((v, i) => {
      const near = groups.find(g => Math.abs(g.lat - v.lat) < 0.55 && Math.abs(g.lng - v.lng) < 0.55);
      if (near) {
        near.items.push(v);
      } else {
        groups.push({ id: v.id, lat: v.lat, lng: v.lng, items: [v], tone: i % 2 === 0 ? 'blue' : 'green' });
      }
    });
    return groups;
  }, [venues]);

  return (
    <div className="map-frame" style={{ height, border: `1px solid ${tokens.borderHairline}`, borderRadius: 16, overflow: 'hidden' }}>
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} zoomControl={true}>
        <TileLayer attribution={attribution} url={tiles} />
        <MapFlyTo center={center} zoom={selected ? 12 : 6} />
        <MapClickHandler onMapClick={onMapClick} />
        {routeLine && <Polyline positions={routeLine} pathOptions={{ color: '#1b6fe8', weight: 2, dashArray: '5 6', opacity: 0.55 }} />}
        {markers.map(group => {
          const primary = group.items[0];
          const isSelected = selected && group.items.some(item => item.id === selected.id);
          return (
            <Marker
              key={group.id}
              position={[group.lat, group.lng]}
              icon={makeBadgeIcon(group.items.length, isSelected, group.tone)}
              eventHandlers={{ click: () => onSelect?.(primary) }}
            >
              <Popup>
                <strong>{localizeText(primary.name, lang)}</strong>
                <br />
                {localizeText(primary.address, lang)}
                {group.items.length > 1 && <><br /><small>+{group.items.length - 1}</small></>}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="map-caption" style={{ background: tokens.headerBg, backdropFilter: 'blur(12px)', color: tokens.textPrimary, borderTop: `1px solid ${tokens.borderHairline}` }}>
        <span><i /> {selected ? `${localizeText(selected.city, lang)} · ${localizeText(selected.name, lang)}` : (lang === 'zh' ? '英国现场场馆网络' : 'Live venue network')}</span>
        <span>UNITED KINGDOM</span>
      </div>
    </div>
  );
}

function Modal({ children, onClose, wide = false, tokens }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" style={{ backdropFilter: 'blur(10px)', background: 'rgba(6, 8, 12, 0.56)' }} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        className={`modal-card ${wide ? 'wide' : ''}`}
        style={{
          background: tokens.panelBg,
          backdropFilter: 'blur(18px)',
          border: `1px solid ${tokens.borderGoldHairline}`,
          color: tokens.textPrimary
        }}
      >
        {children}
      </div>
    </div>
  );
}

function App() {
  const toastTimerRef = useRef(null);
  const ticketSeqRef = useRef(105401);

  const [lang, setLang] = useState(() => localStorage.getItem('aurelia_lang') || 'zh');
  const [theme, setTheme] = useState('dark');
  const [tab, setTab] = useState(() => getTabFromHash());
  const [mobileNav, setMobileNav] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem('aurelia_token') || '');
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [artists, setArtists] = useState(INITIAL_ARTISTS);
  const [followed, setFollowed] = useState([]);

  const [reservedByEvent, setReservedByEvent] = useState(INITIAL_RESERVED_BY_EVENT);
  const [tickets, setTickets] = useState(() => [
    {
      id: 'tk-init-1',
      ticketCode: formatTicketCode(244380),
      eventTitle: INITIAL_EVENTS[0].title,
      artist: INITIAL_EVENTS[0].artist,
      date: INITIAL_EVENTS[0].date,
      venueName: INITIAL_EVENTS[0].name,
      city: INITIAL_EVENTS[0].city,
      holderName: 'Vinyl Guest',
      seats: ['G07'],
      tierLabel: 'General admission',
      totalPrice: 18,
      createdAt: '2026-11-25T12:00:00.000Z'
    },
    {
      id: 'tk-init-2',
      ticketCode: formatTicketCode(105400),
      eventTitle: INITIAL_EVENTS[0].title,
      artist: INITIAL_EVENTS[0].artist,
      date: INITIAL_EVENTS[0].date,
      venueName: INITIAL_EVENTS[0].name,
      city: INITIAL_EVENTS[0].city,
      holderName: 'Vinyl Guest',
      seats: ['F08'],
      tierLabel: 'General admission',
      totalPrice: 18,
      createdAt: '2026-11-25T13:10:00.000Z'
    },
    {
      id: 'tk-init-3',
      ticketCode: formatTicketCode(907384),
      eventTitle: INITIAL_EVENTS[0].title,
      artist: INITIAL_EVENTS[0].artist,
      date: INITIAL_EVENTS[0].date,
      venueName: INITIAL_EVENTS[0].name,
      city: INITIAL_EVENTS[0].city,
      holderName: 'Vinyl Guest',
      seats: ['H10'],
      tierLabel: 'General admission',
      totalPrice: 18,
      createdAt: '2026-11-25T14:25:00.000Z'
    }
  ]);

  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState('');
  const [toast, setToast] = useState('');
  const [publishedBanner, setPublishedBanner] = useState(null);

  const [authMode, setAuthMode] = useState('');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authBusy, setAuthBusy] = useState(false);

  const [detailsEvent, setDetailsEvent] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0]?.id || '');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState({ name: 'Vinyl Guest', email: 'guest@aurelia.uk', tier: 'general', promo: '' });
  const [bookBusy, setBookBusy] = useState(false);

  const [concertQuery, setConcertQuery] = useState('');
  const [concertGenre, setConcertGenre] = useState('all');
  const [concertStatus, setConcertStatus] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [artistQuery, setArtistQuery] = useState('');
  const [artistGenre, setArtistGenre] = useState('all');
  const [activeArtist, setActiveArtist] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [artistForm, setArtistForm] = useState({ name: '', genreKey: 'britpop', origin: '', bio: '', tracks: '', image: '' });

  const [showForm, setShowForm] = useState({
    title: '',
    artist: '',
    description: '',
    venueId: 'paisley-abbey',
    date: '2027-01-16T19:30',
    price: '24',
    genreKey: 'britpop'
  });
  const [publishBusy, setPublishBusy] = useState(false);

  const [mapQuery, setMapQuery] = useState('');
  const [geoQuery, setGeoQuery] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);
  const [customVenue, setCustomVenue] = useState(null);
  const [mapSelected, setMapSelected] = useState(null);
  const [mapTile, setMapTile] = useState('street');

  const t = mergeCopy(lang);
  const tokens = useMemo(() => getThemeTokens(theme), [theme]);

  const panelStyle = useMemo(() => ({
    background: tokens.panelBg,
    backdropFilter: 'blur(14px)',
    border: `1px solid ${tokens.borderHairline}`,
    color: tokens.textPrimary
  }), [tokens]);

  const controlStyle = useMemo(() => ({
    background: tokens.controlBg,
    color: tokens.textPrimary,
    border: `1px solid ${tokens.borderHairline}`,
    backdropFilter: 'blur(10px)'
  }), [tokens]);

  const pillStyle = useCallback((active) => ({
    background: active ? tokens.pillActiveBg : tokens.pillBg,
    color: active ? tokens.pillActiveText : tokens.textSecondary,
    border: `1px solid ${active ? tokens.borderGoldHairline : tokens.borderHairline}`,
    backdropFilter: 'blur(10px)'
  }), [tokens]);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId) || events[0] || null, [events, selectedEventId]);
  const reservedSeats = useMemo(() => (!selectedEvent ? [] : (reservedByEvent[selectedEvent.id] || [])), [reservedByEvent, selectedEvent]);

  const promoRate = ['UWS20', 'PAISLEY20'].includes(booking.promo.trim().toUpperCase()) ? 0.2 : 0;
  const tierMultiplier = booking.tier === 'student' ? 0.75 : booking.tier === 'vip' ? 1.5 : 1;
  const unitPrice = selectedEvent ? Number((selectedEvent.price * tierMultiplier * (1 - promoRate)).toFixed(2)) : 0;
  const orderTotal = Number((unitPrice * selectedSeats.length).toFixed(2));

  const detailsBg = useSafeBg(
    detailsEvent ? resolveArtistCover(detailsEvent.artist, detailsEvent.genreKey, detailsEvent.image || FALLBACK_IMAGE) : FALLBACK_IMAGE,
    FALLBACK_IMAGE
  );
  const dossierBg = useSafeBg(
    activeArtist ? resolveArtistCover(activeArtist.name, activeArtist.genreKey, activeArtist.image || FALLBACK_IMAGE) : FALLBACK_IMAGE,
    FALLBACK_IMAGE
  );
  const asideBg = useSafeBg(
    selectedEvent ? resolveArtistCover(selectedEvent.artist, selectedEvent.genreKey, selectedEvent.image || HERO_IMAGE) : HERO_IMAGE,
    HERO_IMAGE
  );

  useEffect(() => {
    localStorage.setItem('aurelia_lang', lang);
  }, [lang]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const initialTab = getTabFromHash();
    const targetHash = `#${initialTab}`;
    if (!window.location.hash) {
      window.history.replaceState({ tab: 'home' }, '', '#home');
    } else if (window.location.hash !== targetHash) {
      window.history.replaceState({ tab: initialTab }, '', targetHash);
    }
    const syncRoute = () => {
      setTab(getTabFromHash());
      setMobileNav(false);
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  const changeTab = useCallback((next) => {
    const safe = VALID_TABS.includes(next) ? next : 'home';
    setTab(safe);
    setMobileNav(false);
    const nextHash = `#${safe}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState({ tab: safe }, '', nextHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const notify = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, 3600);
  }, []);

  const loadBase = useCallback(async () => {
    setBusy(true);
    setPageError('');
    try {
      const [eventData, artistData, venueData] = await Promise.all([
        request('/events'), request('/artists', { token }), request('/venues')
      ]);
      const apiEvents = eventData.events || [];
      if (apiEvents.length) {
        setEvents(prev => {
          const localCreated = prev.filter(e => String(e.id || '').startsWith('local-'));
          const merged = [...localCreated, ...apiEvents];
          return merged.length >= INITIAL_EVENTS.length ? merged : INITIAL_EVENTS;
        });
      }
      if (venueData.venues?.length || eventData.venues?.length) {
        const mergedVenues = venueData.venues || eventData.venues;
        if (mergedVenues.length >= INITIAL_VENUES.length) setVenues(mergedVenues);
      }
      if (Array.isArray(artistData.followedArtists)) {
        setFollowed(artistData.followedArtists);
      }
      if (!selectedEventId && apiEvents.length) setSelectedEventId(apiEvents[0].id);
    } catch {
      setPageError('');
    } finally { setBusy(false); }
  }, [token, selectedEventId]);

  useEffect(() => { loadBase(); }, [loadBase]);

  useEffect(() => {
    let live = true;
    if (!token) { setUser(null); return; }
    request('/auth/me', { token }).then(data => { if (live) setUser(data.user); }).catch(() => {
      if (live) { setToken(''); localStorage.removeItem('aurelia_token'); setUser(null); }
    });
    return () => { live = false; };
  }, [token]);

  useEffect(() => {
    if (!selectedEvent?.id) return;
    setSelectedSeats([]);
    let live = true;
    request(`/events/${encodeURIComponent(selectedEvent.id)}/seats`)
      .then(data => {
        if (live && Array.isArray(data.reserved)) {
          setReservedByEvent(prev => ({
            ...prev,
            [selectedEvent.id]: Array.from(new Set([...(prev[selectedEvent.id] || []), ...data.reserved]))
          }));
        }
      })
      .catch(() => {});
    return () => { live = false; };
  }, [selectedEvent?.id]);

  const handleAuth = async (e) => {
    e.preventDefault(); setAuthBusy(true);
    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const data = await request(endpoint, { method: 'POST', body: JSON.stringify(authForm) });
      localStorage.setItem('aurelia_token', data.token); setToken(data.token); setUser(data.user); setAuthMode('');
      setBooking(prev => ({ ...prev, name: data.user.name, email: data.user.email }));
      notify(lang === 'zh' ? '已登录。' : 'Signed in.');
    } catch (error) { notify(error.message); }
    finally { setAuthBusy(false); }
  };

  const demoLogin = async (role) => {
    const values = role === 'admin'
      ? { email: 'admin@aurelia.uk', password: 'Aurelia2026!' }
      : { email: 'guest@aurelia.uk', password: 'Vinyl2026!' };
    setAuthBusy(true);
    try {
      const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(values) });
      localStorage.setItem('aurelia_token', data.token); setToken(data.token); setUser(data.user); setAuthMode('');
      setBooking(prev => ({ ...prev, name: data.user.name, email: data.user.email }));
      notify(lang === 'zh' ? '演示账号已登录。' : 'Demo account signed in.');
    } catch {
      const fallbackUser = role === 'admin'
        ? { name: 'Organizer Demo', email: 'admin@aurelia.uk', role: 'admin' }
        : { name: 'Vinyl Guest', email: 'guest@aurelia.uk', role: 'guest' };
      setUser(fallbackUser);
      setAuthMode('');
      setBooking(prev => ({ ...prev, name: fallbackUser.name, email: fallbackUser.email }));
      notify(lang === 'zh' ? '演示账号已登录。' : 'Demo account signed in.');
    } finally { setAuthBusy(false); }
  };

  const signOut = () => { localStorage.removeItem('aurelia_token'); setToken(''); setUser(null); notify(lang === 'zh' ? '已退出登录。' : 'Signed out.'); };

  const filteredEvents = useMemo(() => events.filter(event => {
    const q = concertQuery.trim().toLowerCase();
    const matchesText = !q || [event.title, event.artist, event.city, event.name].some(v => String(v || '').toLowerCase().includes(q));
    const matchesGenre = concertGenre === 'all' || event.genreKey === concertGenre;
    const matchesStatus = concertStatus === 'all' || (concertStatus === 'available' ? event.remaining > 0 : event.remaining === 0);
    return matchesText && matchesGenre && matchesStatus;
  }), [events, concertQuery, concertGenre, concertStatus]);

  const filteredArtists = useMemo(() => artists.filter(artist => {
    const q = artistQuery.trim().toLowerCase();
    return (artistGenre === 'all' || artist.genreKey === artistGenre) && (!q || [artist.name, artist.origin, artist.bio].some(v => String(v || '').toLowerCase().includes(q)));
  }), [artists, artistQuery, artistGenre]);

  const globalResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const showResults = events.filter(e => !q || [e.title, e.artist, e.city, e.name].some(v => String(v || '').toLowerCase().includes(q))).map(e => ({
      type: 'show',
      id: e.id,
      title: e.title,
      subtitle: `${e.artist} · ${localizeText(e.city, lang)}`,
      image: e.image,
      event: e
    }));
    const artistResults = artists.filter(a => !q || [a.name, a.origin, a.bio].some(v => String(v || '').toLowerCase().includes(q))).map(a => ({
      type: 'artist',
      id: a.id,
      title: a.name,
      subtitle: `${localizeText(a.origin, lang)} · ${lang === 'zh' ? '艺人档案' : 'Artist archive'}`,
      artist: a
    }));
    return [...showResults, ...artistResults].slice(0, 30);
  }, [events, artists, searchQuery, lang]);

  const openBooking = (event) => {
    if (event?.id) setSelectedEventId(event.id);
    setActiveTicket(null);
    setDetailsEvent(null);
    changeTab('box');
  };

  const toggleSeat = (seat) => {
    if (reservedSeats.includes(seat)) return;
    setSelectedSeats(current => {
      if (current.includes(seat)) return current.filter(s => s !== seat);
      if (current.length >= 8) {
        notify(lang === 'zh' ? '单次最多选择 8 个座位。' : 'Up to 8 seats per reservation.');
        return current;
      }
      return [...current, seat];
    });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!selectedEvent || selectedSeats.length === 0) {
      return notify(lang === 'zh' ? '请至少选择一个座位。' : 'Please select at least one seat.');
    }
    const conflict = selectedSeats.filter(s => reservedSeats.includes(s));
    if (conflict.length > 0) {
      setSelectedSeats(prev => prev.filter(s => !conflict.includes(s)));
      return notify(lang === 'zh' ? `座位 ${conflict.join(', ')} 已被占用。` : `Seats ${conflict.join(', ')} are already reserved.`);
    }
    if (!booking.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) {
      return notify(lang === 'zh' ? '请填写有效的姓名和邮箱。' : 'Please enter a valid name and email.');
    }

    setBookBusy(true);
    const nextCode = formatTicketCode(ticketSeqRef.current);
    ticketSeqRef.current += 1;
    const tierLabel = booking.tier === 'student' ? t.student : booking.tier === 'vip' ? t.vip : t.general;
    const seatsToBook = [...selectedSeats];

    const commitLocal = () => {
      setReservedByEvent(prev => ({
        ...prev,
        [selectedEvent.id]: Array.from(new Set([...(prev[selectedEvent.id] || []), ...seatsToBook]))
      }));
      setEvents(prev => prev.map(ev => ev.id === selectedEvent.id
        ? { ...ev, remaining: Math.max(0, Number(ev.remaining ?? 100) - seatsToBook.length) }
        : ev
      ));
      setSelectedSeats([]);
    };

    try {
      const data = await request('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          eventId: selectedEvent.id,
          seats: seatsToBook,
          holderName: booking.name.trim(),
          email: booking.email.trim(),
          tier: booking.tier,
          promoCode: booking.promo
        })
      });
      const confirmed = {
        ...(data.ticket || {}),
        ticketCode: nextCode,
        eventTitle: data.ticket?.eventTitle || selectedEvent.title,
        artist: data.ticket?.artist || selectedEvent.artist,
        date: data.ticket?.date || selectedEvent.date,
        venueName: data.ticket?.venueName || selectedEvent.name,
        city: data.ticket?.city || selectedEvent.city,
        holderName: booking.name.trim(),
        seats: seatsToBook,
        tierLabel,
        totalPrice: orderTotal,
        createdAt: new Date().toISOString()
      };
      setActiveTicket(confirmed);
      setTickets(prev => [confirmed, ...prev]);
      commitLocal();
      notify(lang === 'zh' ? '预订已确认。' : 'Reservation confirmed.');
    } catch {
      const pass = {
        id: `tk-${Date.now()}`,
        ticketCode: nextCode,
        eventTitle: selectedEvent.title,
        artist: selectedEvent.artist,
        date: selectedEvent.date,
        venueName: selectedEvent.name,
        city: selectedEvent.city,
        holderName: booking.name.trim(),
        seats: seatsToBook,
        tierLabel,
        totalPrice: orderTotal,
        createdAt: new Date().toISOString()
      };
      setActiveTicket(pass);
      setTickets(prev => [pass, ...prev]);
      commitLocal();
      notify(lang === 'zh' ? '预订已确认。' : 'Reservation confirmed.');
    } finally { setBookBusy(false); }
  };

  const submitShow = async (e) => {
    e.preventDefault();
    setPublishBusy(true);
    const chosenVenue = venues.find(v => v.id === showForm.venueId) || { id: showForm.venueId, name: 'Paisley Abbey & High St Live Hall', city: 'Paisley' };
    const genreMatch = GENRES.find(g => g.id === showForm.genreKey);
    const localItem = {
      id: `local-${Date.now()}`,
      title: showForm.title.trim(),
      artist: showForm.artist.trim(),
      description: showForm.description.trim() || (lang === 'zh' ? '黑胶与现场舞台演出。' : 'Live vinyl and stage performance.'),
      venueId: chosenVenue.id,
      name: chosenVenue.name,
      city: chosenVenue.city,
      date: showForm.date,
      price: Number(showForm.price) || 24,
      capacity: 100,
      remaining: 100,
      genreKey: showForm.genreKey,
      artworkKey: showForm.genreKey,
      image: resolveArtistCover(showForm.artist, showForm.genreKey, genreMatch?.image || FALLBACK_IMAGE)
    };

    try {
      const data = await request('/events', { token, method: 'POST', body: JSON.stringify(showForm) });
      const created = data.event || localItem;
      setEvents(prev => [created, ...prev]);
      setSelectedEventId(created.id);
      setPublishedBanner(created);
      setShowForm({ title: '', artist: '', description: '', venueId: chosenVenue.id, date: '2027-01-16T19:30', price: '24', genreKey: 'britpop' });
      notify(t.publishedNotice);
    } catch {
      setEvents(prev => [localItem, ...prev]);
      setSelectedEventId(localItem.id);
      setPublishedBanner(localItem);
      setShowForm({ title: '', artist: '', description: '', venueId: chosenVenue.id, date: '2027-01-16T19:30', price: '24', genreKey: 'britpop' });
      notify(t.publishedNotice);
    } finally {
      setPublishBusy(false);
    }
  };

  const submitArtist = async (e) => {
    e.preventDefault();
    const trackList = artistForm.tracks.split(',').map(s => s.trim()).filter(Boolean);
    const trimmedUrl = artistForm.image.trim();
    const fallbackArtist = {
      id: `art-${Date.now()}`,
      name: artistForm.name.trim(),
      genreKey: artistForm.genreKey,
      origin: artistForm.origin.trim() || 'United Kingdom',
      bio: artistForm.bio.trim() || (lang === 'zh' ? '收录在 Aurelia 黑胶档案中的音乐人。' : 'Artist dossier in the Aurelia archive.'),
      tracks: trackList.length ? trackList : ['Live Session I', 'Vinyl Cut'],
      note: '',
      image: trimmedUrl || resolveArtistCover(artistForm.name, artistForm.genreKey, FALLBACK_IMAGE)
    };
    try {
      const data = await request('/artists', { token, method: 'POST', body: JSON.stringify(artistForm) });
      const created = { ...(data.artist || fallbackArtist), image: data.artist?.image || fallbackArtist.image };
      setArtists(prev => [created, ...prev]);
      setShowArtistForm(false);
      setArtistForm({ name: '', genreKey: 'britpop', origin: '', bio: '', tracks: '', image: '' });
      setActiveArtist(created);
      setNoteDraft('');
      notify(lang === 'zh' ? '已添加艺人到档案。' : 'Artist added.');
    } catch {
      setArtists(prev => [fallbackArtist, ...prev]);
      setShowArtistForm(false);
      setArtistForm({ name: '', genreKey: 'britpop', origin: '', bio: '', tracks: '', image: '' });
      setActiveArtist(fallbackArtist);
      setNoteDraft('');
      notify(lang === 'zh' ? '已添加艺人到档案。' : 'Artist added.');
    }
  };

  const saveArtistNote = async () => {
    if (!activeArtist) return;
    try {
      const data = await request(`/artists/${activeArtist.id}/note`, { token, method: 'PATCH', body: JSON.stringify({ note: noteDraft }) });
      const updated = data.artist || { ...activeArtist, note: noteDraft };
      setArtists(prev => prev.map(a => a.id === updated.id ? updated : a));
      setActiveArtist(updated);
      notify(lang === 'zh' ? '手记已保存。' : 'Curator notes saved.');
    } catch {
      const updated = { ...activeArtist, note: noteDraft };
      setArtists(prev => prev.map(a => a.id === updated.id ? updated : a));
      setActiveArtist(updated);
      notify(lang === 'zh' ? '手记已保存。' : 'Curator notes saved.');
    }
  };

  const toggleFollow = async (artist) => {
    try {
      const data = await request(`/artists/${artist.id}/follow`, { token, method: 'POST', body: '{}' });
      setFollowed(data.followedArtists);
      notify(data.followed ? (lang === 'zh' ? `已关注 ${artist.name}` : `Following ${artist.name}`) : (lang === 'zh' ? `已取消关注 ${artist.name}` : `Unfollowed ${artist.name}`));
    } catch {
      setFollowed(prev => {
        const exists = prev.includes(artist.id);
        const next = exists ? prev.filter(id => id !== artist.id) : [...prev, artist.id];
        notify(!exists ? (lang === 'zh' ? `已关注 ${artist.name}` : `Following ${artist.name}`) : (lang === 'zh' ? `已取消关注 ${artist.name}` : `Unfollowed ${artist.name}`));
        return next;
      });
    }
  };

  const uploadImage = (file, setter) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return notify(lang === 'zh' ? '请选择图片文件。' : 'Please choose an image file.');
    if (file.size > 2 * 1024 * 1024) return notify(lang === 'zh' ? '图片大小请控制在 2MB 以内。' : 'Please keep images under 2MB.');
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const chooseVenue = (venue) => {
    setMapSelected(venue);
    setMapQuery('');
    notify(`${localizeText(venue.city, lang)} · ${localizeText(venue.name, lang)}`);
  };

  const visibleVenues = useMemo(
    () => venues.filter(v => !mapQuery || [v.name, v.city, v.address, v.nation].some(x => String(x || '').toLowerCase().includes(mapQuery.toLowerCase()))),
    [venues, mapQuery]
  );

  const mapPoints = useMemo(
    () => customVenue && (!mapQuery || [customVenue.name, customVenue.city, customVenue.address].some(x => String(x || '').toLowerCase().includes(mapQuery.toLowerCase())))
      ? [customVenue, ...visibleVenues.filter(v => v.id !== customVenue.id)]
      : visibleVenues,
    [customVenue, visibleVenues, mapQuery]
  );

  const searchUkPlace = async (e) => {
    e.preventDefault();
    if (!geoQuery.trim()) return;
    const localHit = venues.find(v => [v.city, v.name, v.nation].some(x => String(x || '').toLowerCase().includes(geoQuery.trim().toLowerCase())));
    if (localHit) {
      setMapSelected(localHit);
      notify(`${localizeText(localHit.city, lang)} · ${localizeText(localHit.name, lang)}`);
      return;
    }
    setGeoBusy(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&country=United%20Kingdom&limit=1&q=${encodeURIComponent(geoQuery.trim())}`;
      const response = await fetch(url, { headers: { 'Accept-Language': lang } });
      if (!response.ok) throw new Error(lang === 'zh' ? '地图检索服务暂时不可用，请重试。' : 'The map search service is unavailable.');
      const results = await response.json();
      if (!Array.isArray(results) || !results.length) throw new Error(lang === 'zh' ? '未找到该英国地点，请换个地名试试。' : 'No UK place found.');
      const hit = results[0];
      const address = hit.address || {};
      const city = address.city || address.town || address.village || address.county || geoQuery.trim();
      const point = { id: 'custom-geocode-pin', name: geoQuery.trim(), address: hit.display_name, city, nation: 'United Kingdom', lat: Number(hit.lat), lng: Number(hit.lon) };
      setCustomVenue(point);
      setMapSelected(point);
      setMapQuery('');
    } catch (error) {
      notify(error.message);
    } finally {
      setGeoBusy(false);
    }
  };

  const dropMapPin = (latlng) => {
    if (latlng.lat < 49.5 || latlng.lat > 59.5 || latlng.lng < -8.5 || latlng.lng > 2.5) {
      notify(lang === 'zh' ? '请在英国境内点击定位。' : 'Please drop your pin within the United Kingdom.');
      return;
    }
    const point = {
      id: 'custom-map-pin',
      name: lang === 'zh' ? '自选英国场馆点位' : 'Custom UK venue pin',
      address: `Coordinates ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}, United Kingdom`,
      city: lang === 'zh' ? '自选地点' : 'Custom location',
      nation: 'United Kingdom',
      lat: latlng.lat,
      lng: latlng.lng
    };
    setCustomVenue(point);
    setMapSelected(point);
  };

  const navKeys = ['home', 'concerts', 'box', 'publish', 'search', 'artists', 'map'];
  const navIcons = [Compass, CalendarDays, Ticket, Plus, Search, AudioLines, MapPinned];

  return (
    <div
      className={`app theme-${theme}`}
      style={{
        background: tokens.rootBg,
        color: tokens.textPrimary,
        minHeight: '100vh'
      }}
    >
      <div className="grain" />
      <header
        className="site-header"
        style={{
          background: tokens.headerBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${tokens.headerBorder}`,
          color: tokens.textPrimary
        }}
      >
        <button type="button" className="brand-lockup" onClick={() => changeTab('home')} aria-label="Aurelia Vinyl home" style={{ color: tokens.textPrimary }}>
          <BrandMark color={tokens.accentGold} />
          <span><strong>AURELIA <em>VINYL</em></strong><small style={{ color: tokens.textMuted }}>LIVE MUSIC · UK ARCHIVE</small></span>
        </button>

        <nav className={`main-nav ${mobileNav ? 'open' : ''}`}>
          {navKeys.map((key, index) => {
            const Icon = navIcons[index];
            const isActive = tab === key;
            return (
              <button
                key={key}
                type="button"
                className={isActive ? 'active' : ''}
                onClick={() => changeTab(key)}
                style={{
                  background: isActive ? tokens.pillActiveBg : 'transparent',
                  color: isActive ? tokens.pillActiveText : tokens.textSecondary,
                  border: `1px solid ${isActive ? tokens.borderGoldHairline : 'transparent'}`,
                  borderRadius: 999,
                  padding: '7px 13px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={15} />
                <span>{t.nav[index]}</span>
              </button>
            );
          })}
        </nav>

        <div className="header-tools">
          <button
            type="button"
            className="icon-button theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            style={{
              ...pillStyle(false),
              color: tokens.textPrimary,
              borderRadius: 999
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <select
            className="language-select"
            aria-label="Language"
            value={lang}
            onChange={e => setLang(e.target.value)}
            style={{
              background: tokens.controlBg,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.borderHairline}`,
              backdropFilter: 'blur(10px)',
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {LANG_OPTIONS.map(opt => (
              <option
                key={opt.code}
                value={opt.code}
                style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {user ? (
            <div className="account-chip" style={{ ...pillStyle(true), borderRadius: 999 }}>
              <span className="account-avatar">{user.name?.slice(0, 1).toUpperCase()}</span>
              <span className="account-name" style={{ color: tokens.textPrimary }}>{user.name}</span>
              <button type="button" onClick={signOut} title={t.signOut} style={{ color: tokens.textSecondary }}><LogOut size={15} /></button>
            </div>
          ) : (
            <button
              type="button"
              className="header-signin"
              onClick={() => { setAuthMode('login'); setAuthForm({ name: '', email: '', password: '' }); }}
              style={{
                ...pillStyle(false),
                color: tokens.textPrimary,
                borderRadius: 999
              }}
            >
              <UserRound size={15} />{t.signIn}
            </button>
          )}

          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMobileNav(v => !v)}
            aria-label="Toggle menu"
            style={{ ...pillStyle(false), color: tokens.textPrimary }}
          >
            {mobileNav ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main style={{ color: tokens.textPrimary }}>
        {pageError && <div className="page-error"><CircleHelp size={16} />{pageError}<button type="button" onClick={() => loadBase()}>Retry</button></div>}
        {busy && events.length === 0 && <div className="loading-screen"><BrandMark color={tokens.accentGold} /><span>{t.loading}</span></div>}

        {tab === 'home' && (
          <>
            <section className="hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(8,9,12,.86) 0%,rgba(8,9,12,.58) 46%,rgba(8,9,12,.22) 100%),linear-gradient(0deg,rgba(8,9,12,.56),transparent 45%),url("${HERO_IMAGE}")` }}>
              <div className="hero-inner">
                <div className="hero-copy">
                  <div className="hero-kicker"><span className="kicker-line" />{t.eyebrow}</div>
                  <h1>{t.heroTitle.split('\n')[0]}<br /><i>{t.heroTitle.split('\n')[1] || ''}</i></h1>
                  <p>{t.heroText}</p>
                  <div className="hero-buttons">
                    <button type="button" className="button button-gold" onClick={() => changeTab('concerts')}>{t.explore}<ArrowUpRight size={17} /></button>
                    <button type="button" className="button button-ghost" style={{ background: 'rgba(16, 19, 26, 0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.16)' }} onClick={() => changeTab('artists')}>{t.archive}<ArrowRight size={16} /></button>
                  </div>
                  <div className="hero-footnote"><span className="live-dot" /> {t.heroBadge} <span className="hero-divider" /> UNITED KINGDOM</div>
                </div>
                <div className="hero-side-note"><span>AV / 001</span><div />{t.heroSide.split('\n')[0]}<br />{t.heroSide.split('\n')[1] || ''}</div>
              </div>
              <div className="hero-bottom"><span>{t.scrollHint}</span><ArrowDownRight size={17} /><span className="hero-bottom-right">{t.heroRight}</span></div>
            </section>

            <section className="stats-strip" style={{ background: tokens.panelBg, backdropFilter: 'blur(12px)', borderTop: `1px solid ${tokens.borderHairline}`, borderBottom: `1px solid ${tokens.borderHairline}` }}>
              <div><strong>{String(events.length).padStart(2, '0')}</strong><span style={{ color: tokens.textMuted }}>{t.statsShows}</span></div>
              <div><strong>{String(venues.length).padStart(2, '0')}</strong><span style={{ color: tokens.textMuted }}>{t.statsCities}</span></div>
              <div><strong>{String(artists.length).padStart(2, '0')}</strong><span style={{ color: tokens.textMuted }}>{t.statsArtists}</span></div>
              <div className="stats-aside" style={{ color: tokens.textSecondary }}>A curated stage for<br /><i>the sound of now.</i></div>
            </section>

            <section className="content-section genre-section">
              <SectionHeading overline={t.discoverTag} title={t.featured} text={t.heroText} />
              <div className="genre-grid">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    className="genre-card"
                    onClick={() => { setConcertGenre(genre.id); changeTab('concerts'); }}
                    style={{
                      backgroundImage: `linear-gradient(180deg,rgba(7,8,11,.08),rgba(7,8,11,.84)),url("${genre.image}")`,
                      border: `1px solid ${tokens.borderHairline}`
                    }}
                  >
                    <span className="genre-number">{genre.number}</span>
                    <span className="genre-card-copy">
                      <small>{t.explore.toUpperCase()}</small>
                      <strong>{genreTitle(genre, lang)}</strong>
                      <em>{genreDesc(genre, lang)}</em>
                    </span>
                    <span className="genre-arrow" style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(12,14,19,0.45)' }}><ArrowUpRight size={19} /></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="content-section events-section">
              <SectionHeading
                overline="THE AURELIA SELECTION"
                title={t.upcoming}
                text={t.boxSub}
                action={<button type="button" className="underlined-action" style={{ color: tokens.textPrimary }} onClick={() => changeTab('concerts')}>{t.allShows}<ArrowUpRight size={16} /></button>}
              />
              <div className="event-grid">
                {events.slice(0, 3).map(event => (
                  <EventCard key={event.id} event={event} lang={lang} tokens={tokens} onDetails={() => setDetailsEvent(event)} onBook={() => openBooking(event)} />
                ))}
              </div>
            </section>

            <section className="archive-promo" style={{ ...panelStyle, borderLeft: 'none', borderRight: 'none' }}>
              <div className="archive-visual">
                <div className="archive-disc" style={{ borderColor: tokens.borderGoldHairline }}><Disc3 size={170} strokeWidth={0.55} /><span>AURELIA<br />VINYL</span></div>
                <div className="archive-visual-caption" style={{ color: tokens.textMuted }}>SIDE A / THE ARCHIVE</div>
              </div>
              <div className="archive-copy">
                <div className="eyebrow">BEYOND THE STAGE</div>
                <h2>Every artist has<br />a <i>story to tell.</i></h2>
                <p style={{ color: tokens.textSecondary }}>{t.artistsSub}</p>
                <button type="button" className="button button-gold" onClick={() => changeTab('artists')}>{t.viewArchive}<ArrowUpRight size={17} /></button>
              </div>
            </section>

            <section className="map-teaser">
              <div className="map-teaser-copy">
                <div className="eyebrow">{venues.length} DESTINATIONS · ONE LIVE CULTURE</div>
                <h2>Music has<br /><i>no borders.</i></h2>
                <p style={{ color: tokens.textSecondary }}>{t.mapSub}</p>
                <button type="button" className="button button-outline" style={{ ...pillStyle(false), color: tokens.textPrimary }} onClick={() => changeTab('map')}>{t.mapOpen}<ArrowUpRight size={16} /></button>
              </div>
              <div className="map-teaser-art" style={{ borderColor: tokens.borderHairline }}>
                <div className="map-orbit orbit-one" />
                <div className="map-orbit orbit-two" />
                <div className="map-orbit orbit-three" />
                <span className="map-glow-point p1" />
                <span className="map-glow-point p2" />
                <span className="map-glow-point p3" />
                <span className="map-glow-point p4" />
                <div className="map-abstract-label">55° 50′ N<br />04° 25′ W</div>
              </div>
            </section>
          </>
        )}

        {tab === 'concerts' && (
          <div className="page-wrap">
            <section className="page-intro">
              <div className="eyebrow">THE LIVE CALENDAR</div>
              <h1>{t.nav[1]}</h1>
              <p style={{ color: tokens.textSecondary }}>{t.upcoming}</p>
            </section>

            <div className="genre-filter-row" style={{ marginBottom: 14 }}>
              <button type="button" className={concertGenre === 'all' ? 'selected' : ''} style={pillStyle(concertGenre === 'all')} onClick={() => setConcertGenre('all')}>{t.allGenres}</button>
              {GENRES.map(g => (
                <button key={g.id} type="button" className={concertGenre === g.id ? 'selected' : ''} style={pillStyle(concertGenre === g.id)} onClick={() => setConcertGenre(g.id)}>
                  {genreTitle(g, lang)}
                </button>
              ))}
            </div>

            <div className="filter-bar" style={{ ...panelStyle, padding: 12, borderRadius: 16 }}>
              <div className="search-field" style={controlStyle}>
                <Search size={17} />
                <input style={{ color: tokens.textPrimary }} value={concertQuery} onChange={e => setConcertQuery(e.target.value)} placeholder={t.searchPlaceholder} />
              </div>
              <div className="filter-select" style={controlStyle}>
                <SlidersHorizontal size={15} />
                <select value={concertGenre} onChange={e => setConcertGenre(e.target.value)} style={{ color: tokens.textPrimary, background: 'transparent' }}>
                  <option value="all" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.allGenres}</option>
                  {GENRES.map(g => <option key={g.id} value={g.id} style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{genreTitle(g, lang)}</option>)}
                </select>
                <ChevronDown size={14} />
              </div>
              <div className="filter-select" style={controlStyle}>
                <select value={concertStatus} onChange={e => setConcertStatus(e.target.value)} style={{ color: tokens.textPrimary, background: 'transparent' }}>
                  <option value="all" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.allStatuses}</option>
                  <option value="available" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.open}</option>
                  <option value="sold" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.sold}</option>
                </select>
                <ChevronDown size={14} />
              </div>
              <button
                type="button"
                className="filter-reset"
                style={{ ...pillStyle(false), color: tokens.textPrimary }}
                onClick={() => { setConcertQuery(''); setConcertGenre('all'); setConcertStatus('all'); }}
              >
                {t.reset}
              </button>
            </div>

            <div className="event-grid page-events">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} lang={lang} tokens={tokens} onDetails={() => setDetailsEvent(event)} onBook={() => openBooking(event)} />
              ))}
            </div>
            {filteredEvents.length === 0 && <div className="empty-state" style={panelStyle}><Disc3 size={36} /><h3>{t.empty}</h3></div>}
          </div>
        )}

        {tab === 'box' && (
          <div className="page-wrap">
            <section className="page-intro">
              <div className="eyebrow">THE AURELIA BOX OFFICE</div>
              <h1>{t.boxTitle}</h1>
              <p style={{ color: tokens.textSecondary }}>{t.boxSub}</p>
            </section>
            <div className="booking-layout">
              <form className="booking-panel" style={panelStyle} onSubmit={submitBooking}>
                <div className="panel-topline" style={{ borderBottomColor: tokens.borderHairline }}><span>01 / {t.chooseEvent.toUpperCase()}</span><ShieldCheck size={17} /></div>
                <label className="field-label" style={{ color: tokens.textSecondary }}>
                  {t.chooseEvent}
                  <select className="field-control" style={controlStyle} value={selectedEvent?.id || ''} onChange={e => { setSelectedEventId(e.target.value); setActiveTicket(null); }}>
                    {events.map(event => <option key={event.id} value={event.id} style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{event.title} · {localizeText(event.city, lang)}</option>)}
                  </select>
                </label>

                {selectedEvent && (
                  <div className="booking-event-summary" style={{ ...controlStyle, borderRadius: 14 }}>
                    <div>
                      <span className="eyebrow">{selectedEvent.artist}</span>
                      <strong style={{ color: tokens.textPrimary }}>{selectedEvent.title}</strong>
                      <span style={{ color: tokens.textSecondary }}><CalendarDays size={14} />{formatDate(selectedEvent.date, lang)}</span>
                      <span style={{ color: tokens.textSecondary }}><MapPin size={14} />{localizeText(selectedEvent.name, lang)} · {localizeText(selectedEvent.city, lang)}</span>
                    </div>
                    <strong className="summary-price" style={{ color: tokens.accentGold }}>{money(selectedEvent.price)}<small style={{ color: tokens.textMuted }}> / {t.from}</small></strong>
                  </div>
                )}

                <div className="seat-heading">
                  <div>
                    <span className="panel-step">02 / {t.seats.toUpperCase()}</span>
                    <h3>{t.book}</h3>
                    <p style={{ color: tokens.textMuted }}>1–8 seats.</p>
                  </div>
                  <div className="seat-legend" style={{ color: tokens.textSecondary }}>
                    <span><i className="seat-dot available" />{t.open}</span>
                    <span><i className="seat-dot selected" />{t.seats}</span>
                    <span><i className="seat-dot reserved" />{t.sold}</span>
                  </div>
                </div>

                <div className="stage-label" style={{ borderColor: tokens.borderGoldHairline, color: tokens.accentGold }}><span>STAGE</span></div>
                <div className="seat-map">
                  {SEAT_ROWS.map(row => (
                    <div className="seat-row" key={row}>
                      <span className="row-label" style={{ color: tokens.textMuted }}>{row}</span>
                      <div className="seat-row-cells">
                        {Array.from({ length: SEAT_COLS }, (_, index) => {
                          const seat = `${row}${String(index + 1).padStart(2, '0')}`;
                          const reserved = reservedSeats.includes(seat);
                          const picked = selectedSeats.includes(seat);
                          return (
                            <button
                              type="button"
                              key={seat}
                              disabled={reserved}
                              className={`seat ${reserved ? 'reserved' : picked ? 'selected' : ''}`}
                              style={reserved ? undefined : pillStyle(picked)}
                              onClick={() => toggleSeat(seat)}
                              aria-label={`${seat}${reserved ? ' reserved' : picked ? ' selected' : ''}`}
                            >
                              {String(index + 1).padStart(2, '0')}
                            </button>
                          );
                        })}
                      </div>
                      <span className="row-label" style={{ color: tokens.textMuted }}>{row}</span>
                    </div>
                  ))}
                </div>

                <div className="seat-selected-line" style={{ borderTopColor: tokens.borderHairline, borderBottomColor: tokens.borderHairline }}>
                  <span style={{ color: tokens.textMuted }}>{t.seats}</span>
                  <strong>{selectedSeats.length ? selectedSeats.join(' · ') : '—'}</strong>
                </div>

                <div className="panel-step panel-step-gap">03 / {t.attendee.toUpperCase()}</div>
                <div className="form-two">
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.attendee}
                    <input className="field-control" style={controlStyle} value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} required />
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.email}
                    <input className="field-control" style={controlStyle} type="email" value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} required />
                  </label>
                </div>

                <div className="form-two">
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.tier}
                    <select className="field-control" style={controlStyle} value={booking.tier} onChange={e => setBooking({ ...booking, tier: e.target.value })}>
                      <option value="general" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.general}</option>
                      <option value="student" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.student}</option>
                      <option value="vip" style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{t.vip}</option>
                    </select>
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.promo}
                    <input className="field-control" style={controlStyle} value={booking.promo} onChange={e => setBooking({ ...booking, promo: e.target.value })} placeholder="UWS20" />
                  </label>
                </div>

                <div className="order-total" style={{ borderTopColor: tokens.borderHairline }}>
                  <div>
                    <span>{t.total}</span>
                    <small style={{ color: tokens.textMuted }}>{selectedSeats.length} × {money(unitPrice)}</small>
                  </div>
                  <strong style={{ color: tokens.accentGold }}>{money(orderTotal)}</strong>
                </div>

                <button className="button button-gold full-width" type="submit" disabled={bookBusy || selectedSeats.length === 0}>
                  {bookBusy ? <LoaderCircle className="spin" size={17} /> : <Ticket size={17} />}
                  {bookBusy ? t.loading : t.reserve}
                  <ArrowRight size={16} />
                </button>
                <p className="secure-copy" style={{ color: tokens.textMuted }}><ShieldCheck size={14} />{t.secureNote}</p>
              </form>

              <aside className="booking-aside">
                <div className="aside-image" style={{ backgroundImage: `linear-gradient(180deg,transparent 20%,rgba(10,11,14,.85)),url("${asideBg}")`, border: `1px solid ${tokens.borderHairline}` }}>
                  <div><span>THE AURELIA EXPERIENCE</span><strong>Not just<br />a ticket.<br /><i>A memory.</i></strong></div>
                </div>
                <div className="aside-details" style={panelStyle}>
                  <h3>{t.ticketTitle}</h3>
                  <div style={{ color: tokens.textSecondary }}><CheckCircle2 size={16} /><span>{t.secureNote}</span></div>
                  <div style={{ color: tokens.textSecondary }}><CheckCircle2 size={16} /><span>{t.ticketSub}</span></div>
                </div>
                {tickets.length > 0 && (
                  <div className="my-tickets" style={panelStyle}>
                    <h3>{t.ticketTitle}</h3>
                    {tickets.slice(0, 6).map(ticket => (
                      <button key={ticket.id} type="button" style={{ ...controlStyle, color: tokens.textPrimary }} onClick={() => setActiveTicket(ticket)}>
                        <span><Ticket size={15} />{ticket.ticketCode}</span>
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}

        {tab === 'publish' && (
          <div className="page-wrap">
            <section className="page-intro">
              <div className="eyebrow">FOR ARTISTS & ORGANISERS</div>
              <h1>{t.publishTitle}</h1>
              <p style={{ color: tokens.textSecondary }}>{t.publishSub}</p>
            </section>
            {publishedBanner && (
              <div style={{ ...panelStyle, marginBottom: 20, padding: '14px 18px', borderRadius: 14, borderColor: tokens.borderGoldHairline, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div><strong>{publishedBanner.title}</strong> · {publishedBanner.artist} · {localizeText(publishedBanner.city, lang)}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="button button-outline" style={{ ...pillStyle(false), color: tokens.textPrimary }} onClick={() => changeTab('concerts')}>{t.viewCalendar}<ArrowUpRight size={15} /></button>
                  <button type="button" className="button button-gold" onClick={() => openBooking(publishedBanner)}>{t.book}<ArrowRight size={15} /></button>
                </div>
              </div>
            )}
            <div className="publish-layout">
              <form className="publish-form" style={panelStyle} onSubmit={submitShow}>
                <div className="panel-topline" style={{ borderBottomColor: tokens.borderHairline }}><span>CREATE A LIVE LISTING</span><Mic2 size={18} /></div>
                <div className="field-grid">
                  <label className="field-label full" style={{ color: tokens.textSecondary }}>
                    {t.title}
                    <input className="field-control" style={controlStyle} required minLength={3} value={showForm.title} onChange={e => setShowForm({ ...showForm, title: e.target.value })} placeholder="e.g. An Evening of Britpop" />
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.artist}
                    <input className="field-control" style={controlStyle} required value={showForm.artist} onChange={e => setShowForm({ ...showForm, artist: e.target.value })} placeholder="Oasis / Adele / Taylor Swift / Jay Chou…" />
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.genre}
                    <select className="field-control" style={controlStyle} value={showForm.genreKey} onChange={e => setShowForm({ ...showForm, genreKey: e.target.value })}>
                      {GENRES.map(g => <option key={g.id} value={g.id} style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{genreTitle(g, lang)}</option>)}
                    </select>
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.venue}
                    <select className="field-control" style={controlStyle} value={showForm.venueId} onChange={e => setShowForm({ ...showForm, venueId: e.target.value })}>
                      {venues.map(v => <option key={v.id} value={v.id} style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{localizeText(v.city, lang)} · {localizeText(v.name, lang)}</option>)}
                    </select>
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.date}
                    <input className="field-control" style={controlStyle} type="datetime-local" required value={showForm.date} onChange={e => setShowForm({ ...showForm, date: e.target.value })} />
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.price} (£)
                    <input className="field-control" style={controlStyle} type="number" min="1" max="1000" step="0.5" required value={showForm.price} onChange={e => setShowForm({ ...showForm, price: e.target.value })} />
                  </label>
                  <label className="field-label full" style={{ color: tokens.textSecondary }}>
                    {t.description}
                    <textarea className="field-control textarea" style={controlStyle} rows="5" value={showForm.description} onChange={e => setShowForm({ ...showForm, description: e.target.value })} />
                  </label>
                </div>
                <div className="publish-bottom" style={{ borderTopColor: tokens.borderHairline }}>
                  <div style={{ color: tokens.textMuted }}><ShieldCheck size={15} /><span>{t.publishedNotice}</span></div>
                  <button className="button button-gold" type="submit" disabled={publishBusy}>
                    {publishBusy ? <LoaderCircle className="spin" size={16} /> : <Plus size={17} />}
                    {t.publish}<ArrowRight size={16} />
                  </button>
                </div>
              </form>
              <aside className="publish-aside">
                <div className="publish-aside-art" style={{ border: `1px solid ${tokens.borderHairline}` }}><span>AV / LIVE LISTINGS</span><Music2 size={58} strokeWidth={1} /><strong>Make room<br />for <i>the sound.</i></strong></div>
                <div className="aside-details" style={panelStyle}>
                  <h3>{t.statsShows} ({events.length})</h3>
                  {events.slice(0, 4).map(ev => (
                    <div key={ev.id} style={{ justifyContent: 'space-between', gap: 8, color: tokens.textSecondary }}>
                      <span><strong style={{ color: tokens.textPrimary }}>{ev.title}</strong> · {localizeText(ev.city, lang)}</span>
                      <button type="button" className="text-action" style={{ color: tokens.textPrimary }} onClick={() => setDetailsEvent(ev)}>{t.details}</button>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}

        {tab === 'search' && (
          <div className="page-wrap">
            <section className="page-intro">
              <div className="eyebrow">DISCOVER SOMETHING NEW</div>
              <h1>{t.nav[4]}</h1>
              <p style={{ color: tokens.textSecondary }}>{t.searchPlaceholder}</p>
            </section>
            <div className="global-search" style={panelStyle}>
              <Search size={22} />
              <input style={{ color: tokens.textPrimary }} autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} />
              <span style={{ color: tokens.textMuted }}>{globalResults.length}</span>
            </div>
            <div className="search-results">
              {globalResults.map(item => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  className="search-result"
                  style={panelStyle}
                  onClick={() => item.type === 'show' ? setDetailsEvent(item.event) : (setActiveArtist(item.artist), setNoteDraft(item.artist.note || ''))}
                >
                  <span className="result-type" style={{ color: tokens.accentGold }}>{item.type === 'show' ? (lang === 'zh' ? '现场演出' : 'LIVE PERFORMANCE') : (lang === 'zh' ? '艺人档案' : 'ARTIST DOSSIER')}</span>
                  <strong style={{ color: tokens.textPrimary }}>{item.title}</strong>
                  <span style={{ color: tokens.textSecondary }}>{item.subtitle}</span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
            {globalResults.length === 0 && <div className="empty-state" style={panelStyle}><Search size={34} /><h3>{t.empty}</h3></div>}
          </div>
        )}

        {tab === 'artists' && (
          <div className="page-wrap">
            <section className="page-intro">
              <div className="eyebrow">THE AURELIA ARCHIVE</div>
              <h1>{t.artistsTitle}</h1>
              <p style={{ color: tokens.textSecondary }}>{t.artistsSub}</p>
            </section>
            <div className="archive-toolbar">
              <div className="search-field" style={controlStyle}>
                <Search size={17} />
                <input style={{ color: tokens.textPrimary }} value={artistQuery} onChange={e => setArtistQuery(e.target.value)} placeholder={t.searchPlaceholder} />
              </div>
              <button type="button" className="button button-outline" style={{ ...pillStyle(showArtistForm), color: tokens.textPrimary }} onClick={() => setShowArtistForm(v => !v)}>
                <Plus size={16} />{t.addArtist}
              </button>
            </div>
            <div className="genre-filter-row">
              <button type="button" className={artistGenre === 'all' ? 'selected' : ''} style={pillStyle(artistGenre === 'all')} onClick={() => setArtistGenre('all')}>{t.allGenres}</button>
              {GENRES.map(g => (
                <button key={g.id} type="button" className={artistGenre === g.id ? 'selected' : ''} style={pillStyle(artistGenre === g.id)} onClick={() => setArtistGenre(g.id)}>
                  {genreTitle(g, lang)}
                </button>
              ))}
            </div>
            {showArtistForm && (
              <form className="inline-create-form" style={panelStyle} onSubmit={submitArtist}>
                <div className="panel-topline" style={{ borderBottomColor: tokens.borderHairline }}>
                  <span>ADD TO THE ARCHIVE</span>
                  <button type="button" className="bare-icon" style={{ color: tokens.textSecondary }} onClick={() => setShowArtistForm(false)}><X size={17} /></button>
                </div>
                <div className="field-grid">
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.name}
                    <input className="field-control" style={controlStyle} required value={artistForm.name} onChange={e => setArtistForm({ ...artistForm, name: e.target.value })} placeholder="e.g. Solo Echo" />
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.genre}
                    <select className="field-control" style={controlStyle} value={artistForm.genreKey} onChange={e => setArtistForm({ ...artistForm, genreKey: e.target.value })}>
                      {GENRES.map(g => <option key={g.id} value={g.id} style={{ background: tokens.selectOptionBg, color: tokens.selectOptionColor }}>{genreTitle(g, lang)}</option>)}
                    </select>
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.origin}
                    <input className="field-control" style={controlStyle} value={artistForm.origin} onChange={e => setArtistForm({ ...artistForm, origin: e.target.value })} placeholder="London / Bristol / Taipei…" />
                  </label>
                  <label className="field-label" style={{ color: tokens.textSecondary }}>
                    {t.tracks}
                    <input className="field-control" style={controlStyle} value={artistForm.tracks} onChange={e => setArtistForm({ ...artistForm, tracks: e.target.value })} placeholder="Track one, Track two…" />
                  </label>
                  <label className="field-label full" style={{ color: tokens.textSecondary }}>
                    {lang === 'zh' ? '简介' : 'Biography'}
                    <textarea className="field-control textarea" style={controlStyle} rows="3" value={artistForm.bio} onChange={e => setArtistForm({ ...artistForm, bio: e.target.value })} />
                  </label>
                  <label className="field-label full" style={{ color: tokens.textSecondary }}>
                    {t.imageUrlLabel}
                    <input
                      className="field-control"
                      style={controlStyle}
                      type="url"
                      value={artistForm.image}
                      onChange={e => setArtistForm({ ...artistForm, image: e.target.value })}
                      placeholder="https://…"
                    />
                  </label>
                  <label className="field-label full" style={{ color: tokens.textSecondary }}>
                    {t.uploadFileLabel}
                    <input
                      className="field-control file-control"
                      style={controlStyle}
                      type="file"
                      accept="image/*"
                      onChange={e => uploadImage(e.target.files?.[0], image => setArtistForm(prev => ({ ...prev, image })))}
                    />
                  </label>
                </div>
                <button className="button button-gold" type="submit"><Plus size={16} />{t.addArtist}</button>
              </form>
            )}
            <div className="artist-grid">
              {filteredArtists.map((artist, index) => (
                <ArtistCardItem
                  key={artist.id}
                  artist={artist}
                  index={index}
                  lang={lang}
                  tokens={tokens}
                  followed={followed.includes(artist.id)}
                  genreObj={GENRES.find(g => g.id === artist.genreKey)}
                  onOpen={() => { setActiveArtist(artist); setNoteDraft(artist.note || ''); }}
                  onToggleFollow={() => toggleFollow(artist)}
                />
              ))}
            </div>
            {filteredArtists.length === 0 && <div className="empty-state" style={panelStyle}><AudioLines size={34} /><h3>{t.empty}</h3></div>}
          </div>
        )}

        {tab === 'map' && (
          <div className="page-wrap">
            <section className="page-intro">
              <div className="eyebrow">THE UNITED KINGDOM · LIVE</div>
              <h1>{t.mapTitle}</h1>
              <p style={{ color: tokens.textSecondary }}>{t.mapSub}</p>
            </section>
            <form className="geo-search-bar" onSubmit={searchUkPlace}>
              <div className="search-field" style={controlStyle}>
                <Search size={17} />
                <input style={{ color: tokens.textPrimary }} value={geoQuery} onChange={e => setGeoQuery(e.target.value)} placeholder={t.mapSearch} />
              </div>
              <button className="button button-gold" type="submit" disabled={geoBusy}>
                {geoBusy ? <LoaderCircle className="spin" size={16} /> : <LocateFixed size={16} />}
                {t.mapSearch}
              </button>
            </form>
            <div className="map-explorer">
              <aside className="venue-panel" style={panelStyle}>
                <div className="search-field" style={controlStyle}>
                  <Search size={16} />
                  <input style={{ color: tokens.textPrimary }} value={mapQuery} onChange={e => setMapQuery(e.target.value)} placeholder={t.mapSearch} />
                </div>
                <div className="venue-count" style={{ color: tokens.textMuted }}>{mapPoints.length} · {t.statsCities}</div>
                <div className="venue-list">
                  {mapPoints.map(venue => {
                    const active = mapSelected?.id === venue.id;
                    return (
                      <button
                        key={venue.id}
                        type="button"
                        className={`venue-item ${active ? 'active' : ''}`}
                        style={{
                          background: active ? tokens.pillActiveBg : 'transparent',
                          border: `1px solid ${active ? tokens.borderGoldHairline : tokens.borderHairline}`,
                          color: tokens.textPrimary
                        }}
                        onClick={() => chooseVenue(venue)}
                      >
                        <span className="venue-pin"><MapPin size={16} /></span>
                        <span>
                          <strong>{localizeText(venue.city, lang)}</strong>
                          <small style={{ color: tokens.textSecondary }}>{localizeText(venue.name, lang)}</small>
                          <em style={{ color: tokens.textMuted }}>{localizeText(venue.nation, lang)}</em>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    );
                  })}
                </div>
              </aside>
              <div className="map-main">
                <div className="map-toolbar" style={panelStyle}>
                  <span><Globe2 size={16} />{t.mapTitle}</span>
                  <div>
                    <button type="button" className={mapTile === 'street' ? 'active' : ''} style={pillStyle(mapTile === 'street')} onClick={() => setMapTile('street')}>{t.street}</button>
                    <button type="button" className={mapTile === 'terrain' ? 'active' : ''} style={pillStyle(mapTile === 'terrain')} onClick={() => setMapTile('terrain')}>{t.terrain}</button>
                    <button type="button" className={mapTile === 'satellite' ? 'active' : ''} style={pillStyle(mapTile === 'satellite')} onClick={() => setMapTile('satellite')}>{t.satellite}</button>
                  </div>
                </div>
                <VenueMap venues={mapPoints} selected={mapSelected} onSelect={chooseVenue} onMapClick={dropMapPin} tile={mapTile} height="510px" lang={lang} tokens={tokens} />
                {mapSelected && (
                  <div className="selected-venue" style={panelStyle}>
                    <div>
                      <span className="eyebrow">{t.venue}</span>
                      <h3>{localizeText(mapSelected.name, lang)}</h3>
                      <p style={{ color: tokens.textSecondary }}>{localizeText(mapSelected.address, lang)}</p>
                    </div>
                    <button
                      type="button"
                      className="button button-gold"
                      onClick={() => {
                        const match = events.find(e => e.venueId === mapSelected.id);
                        if (match) openBooking(match);
                        else changeTab('concerts');
                      }}
                    >
                      {t.explore}<ArrowUpRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        className="site-footer"
        style={{
          background: tokens.footerBg,
          backdropFilter: 'blur(14px)',
          borderTop: `1px solid ${tokens.borderHairline}`,
          color: tokens.textPrimary
        }}
      >
        <div className="footer-main">
          <div className="footer-brand">
            <BrandMark color={tokens.accentGold} />
            <div><strong>AURELIA <em>VINYL</em></strong><span style={{ color: tokens.textMuted }}>LIVE MUSIC · UK ARCHIVE</span></div>
          </div>
          <p style={{ color: tokens.textSecondary }}>{t.footer}</p>
          <div className="footer-links">
            <button type="button" style={{ color: tokens.textSecondary }} onClick={() => changeTab('concerts')}>{t.nav[1]}</button>
            <button type="button" style={{ color: tokens.textSecondary }} onClick={() => changeTab('artists')}>{t.nav[5]}</button>
            <button type="button" style={{ color: tokens.textSecondary }} onClick={() => changeTab('map')}>{t.nav[6]}</button>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTopColor: tokens.borderHairline, color: tokens.textMuted }}>
          <span>© 2026 AURELIA VINYL LIVE</span>
          <span>{t.rights}</span>
          <span>MADE FOR THE LOVE OF MUSIC <Disc3 size={13} /></span>
        </div>
      </footer>

      {authMode && (
        <Modal tokens={tokens} onClose={() => setAuthMode('')}>
          <div className="modal-top" style={{ borderBottomColor: tokens.borderHairline }}>
            <BrandMark color={tokens.accentGold} />
            <button type="button" className="bare-icon" style={{ color: tokens.textSecondary }} onClick={() => setAuthMode('')}><X size={19} /></button>
          </div>
          <div className="auth-heading">
            <div className="eyebrow">AURELIA VINYL ACCOUNT</div>
            <h2>{authMode === 'register' ? t.registerTitle : t.loginTitle}</h2>
          </div>
          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === 'register' && (
              <label className="field-label" style={{ color: tokens.textSecondary }}>
                {t.name}
                <span className="input-icon" style={controlStyle}>
                  <UserRound size={16} />
                  <input style={{ color: tokens.textPrimary }} value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} required minLength={2} />
                </span>
              </label>
            )}
            <label className="field-label" style={{ color: tokens.textSecondary }}>
              {t.email}
              <span className="input-icon" style={controlStyle}>
                <Mail size={16} />
                <input style={{ color: tokens.textPrimary }} type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
              </span>
            </label>
            <label className="field-label" style={{ color: tokens.textSecondary }}>
              {t.password}
              <span className="input-icon" style={controlStyle}>
                <LockKeyhole size={16} />
                <input style={{ color: tokens.textPrimary }} type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required minLength={8} />
              </span>
            </label>
            <button type="submit" className="button button-gold full-width" disabled={authBusy}>
              {authBusy ? <LoaderCircle className="spin" size={16} /> : null}
              {authMode === 'register' ? t.register : t.signIn}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-switch" style={{ color: tokens.textSecondary }}>
            {authMode === 'register' ? t.hasAccount : t.noAccount}
            <button type="button" style={{ color: tokens.accentGold }} onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}>
              {authMode === 'register' ? t.signIn : t.register}
            </button>
          </div>
          <div className="demo-access" style={{ borderTopColor: tokens.borderHairline }}>
            <span>{t.demo}</span>
            <div>
              <button type="button" style={{ ...controlStyle, color: tokens.textPrimary }} onClick={() => demoLogin('admin')} disabled={authBusy}><ShieldCheck size={15} />{t.organizer}</button>
              <button type="button" style={{ ...controlStyle, color: tokens.textPrimary }} onClick={() => demoLogin('guest')} disabled={authBusy}><UserRound size={15} />{t.guest}</button>
            </div>
            <small style={{ color: tokens.textMuted }}>Organizer: admin@aurelia.uk · Aurelia2026!</small>
            <small style={{ color: tokens.textMuted }}>Guest: guest@aurelia.uk · Vinyl2026!</small>
          </div>
        </Modal>
      )}

      {detailsEvent && (
        <Modal tokens={tokens} onClose={() => setDetailsEvent(null)} wide>
          <div className="details-hero" style={{ backgroundImage: `linear-gradient(0deg,rgba(9,10,13,.92),rgba(9,10,13,.15)),url("${detailsBg}")` }}>
            <button type="button" className="details-close" onClick={() => setDetailsEvent(null)}><X size={18} /></button>
            <span className="eyebrow">AURELIA PRESENTS</span>
            <h2>{detailsEvent.title}</h2>
            <span className="details-artist">{detailsEvent.artist}</span>
          </div>
          <div className="details-body">
            <p style={{ color: tokens.textSecondary }}>{localizeText(detailsEvent.description, lang)}</p>
            <div className="details-facts" style={{ borderColor: tokens.borderHairline }}>
              <div><CalendarDays size={17} /><span>{t.date}<strong>{formatDate(detailsEvent.date, lang)}</strong></span></div>
              <div><MapPin size={17} /><span>{t.venue}<strong>{localizeText(detailsEvent.name, lang)} · {localizeText(detailsEvent.city, lang)}</strong></span></div>
              <div><WalletCards size={17} /><span>{t.price}<strong>{money(detailsEvent.price)}</strong></span></div>
            </div>
            <div className="details-actions">
              <button type="button" className="button button-gold" onClick={() => openBooking(detailsEvent)}>{t.book}<ArrowUpRight size={17} /></button>
              <button type="button" className="button button-outline" style={{ ...pillStyle(false), color: tokens.textPrimary }} onClick={() => setDetailsEvent(null)}>{t.close}</button>
            </div>
          </div>
        </Modal>
      )}

      {activeArtist && (
        <Modal tokens={tokens} onClose={() => setActiveArtist(null)} wide>
          <div className="artist-dossier">
            <div className="dossier-cover" style={{ backgroundImage: `linear-gradient(0deg,rgba(9,10,13,.88),rgba(9,10,13,.12)),url("${dossierBg}")` }}>
              <button type="button" className="details-close" onClick={() => setActiveArtist(null)}><X size={18} /></button>
              <span className="eyebrow">ARTIST DOSSIER / AURELIA ARCHIVE</span>
              <h2>{activeArtist.name}</h2>
              <span>{localizeText(activeArtist.origin, lang)}</span>
            </div>
            <div className="dossier-content">
              <div className="eyebrow">{t.storyHeading}</div>
              <p className="artist-bio-large" style={{ color: tokens.textSecondary }}>{localizeText(activeArtist.bio, lang) || (lang === 'zh' ? 'Aurelia 档案中的新艺人记录。' : 'A new artist dossier in the Aurelia archive.')}</p>
              {activeArtist.tracks?.length > 0 && (
                <div className="dossier-tracks">
                  <div className="eyebrow">{t.tracks.toUpperCase()}</div>
                  {activeArtist.tracks.map((track, i) => (
                    <div key={`${track}-${i}`} style={{ ...controlStyle, borderRadius: 10 }}><span>{String(i + 1).padStart(2, '0')}</span><strong>{track}</strong><AudioLines size={15} /></div>
                  ))}
                </div>
              )}
              <div className="curator-note">
                <div className="eyebrow">{t.note.toUpperCase()}</div>
                <textarea style={{ ...controlStyle, borderRadius: 10, padding: 10, width: '100%' }} value={noteDraft} onChange={e => setNoteDraft(e.target.value)} rows={3} />
                <button type="button" className="button button-outline" style={{ ...pillStyle(false), color: tokens.textPrimary }} onClick={saveArtistNote}>{t.save}<Check size={15} /></button>
              </div>
              <div className="dossier-bottom" style={{ borderTopColor: tokens.borderHairline }}>
                <button type="button" className={`button ${followed.includes(activeArtist.id) ? 'button-outline' : 'button-gold'}`} style={followed.includes(activeArtist.id) ? { ...pillStyle(true), color: tokens.textPrimary } : undefined} onClick={() => toggleFollow(activeArtist)}>
                  {followed.includes(activeArtist.id) ? <Check size={16} /> : <Heart size={16} />}
                  {followed.includes(activeArtist.id) ? t.following : t.follow}
                </button>
                <button type="button" className="text-action" style={{ color: tokens.textPrimary }} onClick={() => { const match = events.find(e => e.artist.toLowerCase().includes(activeArtist.name.split(' ')[0].toLowerCase())); if (match) openBooking(match); else { setActiveArtist(null); changeTab('concerts'); } }}>
                  {t.explore}<ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {activeTicket && (
        <Modal tokens={tokens} onClose={() => setActiveTicket(null)}>
          <div className="ticket-pass">
            <div className="pass-top" style={{ borderBottomColor: tokens.borderHairline }}><BrandMark small color={tokens.accentGold} /><span>RESERVATION CONFIRMATION</span><BadgeCheck size={18} /></div>
            <div className="pass-heading">
              <div className="eyebrow">AURELIA VINYL LIVE</div>
              <h2>{t.ticketTitle}</h2>
              <p style={{ color: tokens.textSecondary }}>{t.ticketSub}</p>
            </div>
            <div className="pass-event" style={{ ...controlStyle, borderRadius: 14 }}>
              <span className="eyebrow">{activeTicket.artist}</span>
              <h3>{activeTicket.eventTitle}</h3>
              <p style={{ color: tokens.textSecondary }}><CalendarDays size={14} />{formatDate(activeTicket.date, lang)}</p>
              <p style={{ color: tokens.textSecondary }}><MapPin size={14} />{localizeText(activeTicket.venueName, lang)} · {localizeText(activeTicket.city, lang)}</p>
            </div>
            <div className="pass-stub" style={{ borderColor: tokens.borderHairline }}>
              <div><small>BOOKING REFERENCE</small><strong>{activeTicket.ticketCode}</strong></div>
              <div><small>ATTENDEE</small><strong>{activeTicket.holderName}</strong></div>
              <div><small>SEAT{activeTicket.seats?.length > 1 ? 'S' : ''}</small><strong>{activeTicket.seats?.join(', ')}</strong></div>
              <div><small>ADMISSION</small><strong>{activeTicket.tierLabel}</strong></div>
              <div><small>ORDER TOTAL</small><strong>{money(activeTicket.totalPrice)}</strong></div>
            </div>
            <div className="barcode" aria-label="Decorative ticket barcode" />
            <div className="pass-footer" style={{ color: tokens.textMuted }}>
              <span>RESERVATION REFERENCE · NOT A PAYMENT RECEIPT</span>
              <span>25/11/2026</span>
            </div>
            <button type="button" className="button button-gold full-width" onClick={() => setActiveTicket(null)}>{t.close}<Check size={16} /></button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="toast" style={{ ...panelStyle, borderColor: tokens.borderGoldHairline, color: tokens.textPrimary }}>
          <CheckCircle2 size={17} />{toast}
        </div>
      )}
    </div>
  );
}

export default App;