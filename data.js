// data.js — Datos del sitio de Joselo Thomassiny
// Este archivo contiene los datos por defecto.
// Los cambios del panel de administración se guardan en localStorage.

const SITE_DATA_KEY = 'joselo_site_data';

const DEFAULT_DATA = {
  artworks: [
    { id: 1, title: 'Sin Título I',   technique: 'Óleo sobre lienzo',       medium: 'Óleo sobre Lienzo',      size: '100 × 80 cm',       price: '$1,000 USD',        status: 'available', category: 'painting',    image: 'placeholder' },
    { id: 2, title: 'Sin Título II',  technique: 'Acrílico sobre lienzo',   medium: 'Acrílico sobre Lienzo',  size: '90 × 70 cm',        price: '$1,200 USD',        status: 'available', category: 'painting',    image: 'placeholder' },
    { id: 3, title: 'Sin Título III', technique: 'Carbón sobre papel',      medium: 'Carbón sobre Papel',     size: '60 × 50 cm',        price: '$800 USD',          status: 'available', category: 'drawing',     image: 'placeholder' },
    { id: 4, title: 'Sin Título IV',  technique: 'Mixta sobre madera',      medium: 'Técnica Mixta',          size: '120 × 90 cm',       price: 'CONSULTAR PRECIO',  status: 'inquire',   category: 'mixed-media', image: 'placeholder' },
    { id: 5, title: 'Sin Título V',   technique: 'Bronce',                  medium: 'Escultura en Bronce',    size: '40 × 30 × 20 cm',   price: '$2,500 USD',        status: 'available', category: 'sculpture',   image: 'placeholder' }
  ],
  bio: {
    name: 'Nombre del Artista',
    paragraph1: 'Artista visual con más de 20 años de trayectoria.',
    paragraph2: '',
    statement: '',
    portraitImage: null,
    stats: { works: 5, exhibitions: 0, collections: 0 }
  },
  contact: {
    email: 'contacto@ejemplo.com',
    phone: '+52 000 000 0000',
    instagram: '',
    facebook: '',
    whatsapp: '+52 000 000 0000'
  },
  exhibitions: [],
  lastSaved: null
};

// Deep clone helper (pure JSON data, so this is safe)
function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// Load data: check localStorage first, fall back to defaults
function getSiteData() {
  try {
    const saved = localStorage.getItem(SITE_DATA_KEY);
    if (!saved) return cloneDefault();
    const parsed = JSON.parse(saved);
    // Merge defaults so any newly-added top-level keys are present
    return Object.assign(cloneDefault(), parsed);
  } catch (e) {
    return cloneDefault();
  }
}

// Save data to localStorage. Returns true on success, false if storage is full.
function saveSiteData(data) {
  try {
    data.lastSaved = new Date().toISOString();
    localStorage.setItem(SITE_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

// Reset to defaults (used by the admin panel's "restaurar" feature, if added)
function resetSiteData() {
  try {
    localStorage.removeItem(SITE_DATA_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

// Category metadata shared across pages
const CATEGORY_META = {
  'painting':     { label: 'Pintura',       color: '#E4247A', gradient: 'linear-gradient(135deg, #E4247A, #FA7E1E)' },
  'drawing':      { label: 'Dibujo',        color: '#275EEA', gradient: 'linear-gradient(135deg, #275EEA, #4AF2DC)' },
  'digital':      { label: 'Arte Digital',  color: '#4AF2DC', gradient: 'linear-gradient(135deg, #09F557, #4AF2DC)' },
  'mixed-media':  { label: 'Técnica Mixta', color: '#9B2FAA', gradient: 'linear-gradient(135deg, #9B2FAA, #E4247A)' },
  'sculpture':    { label: 'Escultura',     color: '#FFCC00', gradient: 'linear-gradient(135deg, #FA7E1E, #FFCC00)' }
};

// Resolve an artwork's image to a usable src attribute.
// - null / 'placeholder' / empty  -> SVG file at images/obras/placeholder/obra-NN.svg
// - 'something.jpg' / 'retrato.png' -> images/obras/<filename>
// Keeps the inline SVG generator below as a last-resort fallback.
function getArtworkImageSrc(artwork) {
  if (!artwork) return '';
  const val = artwork.image;
  if (!val || val === 'placeholder') {
    const id = Number(artwork.id) || 1;
    const index = String(id).padStart(2, '0');
    return 'images/obras/placeholder/obra-' + index + '.svg';
  }
  return 'images/obras/' + val;
}

// Resolve portrait image. Returns null when there is no real photo —
// the caller should fall back to the inline SVG (portraitPlaceholder()).
function getPortraitImageSrc(bio) {
  if (!bio || !bio.portraitImage) return null;
  return 'images/artista/' + bio.portraitImage;
}

// SVG placeholder generator — kept for legacy fallbacks. The site now
// prefers the real .svg files in images/obras/placeholder/.
function artworkPlaceholder(artwork) {
  const palettes = [
    ['#E4247A', '#FA7E1E'],
    ['#E8451C', '#FFCC00'],
    ['#275EEA', '#4AF2DC'],
    ['#9B2FAA', '#E4247A'],
    ['#09F557', '#4AF2DC'],
    ['#E8451C', '#9B2FAA'],
    ['#FFCC00', '#E4247A'],
    ['#4AF2DC', '#275EEA'],
    ['#FA7E1E', '#9B2FAA'],
    ['#E4247A', '#275EEA']
  ];
  const idx = ((artwork && artwork.id) ? artwork.id - 1 : 0) % palettes.length;
  const [c1, c2] = palettes[idx];
  const title = (artwork && artwork.title) ? artwork.title : 'Obra';
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' preserveAspectRatio='xMidYMid slice'>
    <defs>
      <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${c1}'/>
        <stop offset='100%' stop-color='${c2}'/>
      </linearGradient>
    </defs>
    <rect width='800' height='1000' fill='url(#g)'/>
    <circle cx='${200 + ((artwork.id * 47) % 400)}' cy='${300 + ((artwork.id * 83) % 400)}' r='${120 + ((artwork.id * 31) % 80)}' fill='rgba(255,255,255,0.14)'/>
    <circle cx='${150 + ((artwork.id * 71) % 500)}' cy='${600 + ((artwork.id * 19) % 300)}' r='${80 + ((artwork.id * 43) % 60)}' fill='rgba(0,0,0,0.12)'/>
    <rect x='60' y='880' width='140' height='3' fill='rgba(255,255,255,0.9)'/>
    <text x='60' y='930' font-family='Georgia,serif' font-size='28' fill='rgba(255,255,255,0.95)' font-weight='600'>${safeTitle}</text>
    <text x='60' y='960' font-family='Georgia,serif' font-size='16' fill='rgba(255,255,255,0.75)' letter-spacing='2'>JOSELO THOMASSINY</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Portrait placeholder for About page
function portraitPlaceholder() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' preserveAspectRatio='xMidYMid slice'>
    <defs>
      <linearGradient id='p' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='#9B2FAA'/>
        <stop offset='100%' stop-color='#E4247A'/>
      </linearGradient>
    </defs>
    <rect width='800' height='1000' fill='url(#p)'/>
    <circle cx='400' cy='380' r='150' fill='rgba(255,255,255,0.18)'/>
    <path d='M 220 1000 Q 400 620 580 1000 Z' fill='rgba(255,255,255,0.14)'/>
    <text x='400' y='960' text-anchor='middle' font-family='Georgia,serif' font-size='18' fill='rgba(255,255,255,0.85)' letter-spacing='3'>RETRATO · ARTISTA</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
