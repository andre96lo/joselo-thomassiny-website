// data.js — Datos del sitio de Joselo Thomassiny
// Este archivo contiene los datos por defecto.
// Los cambios del panel de administración se guardan en localStorage.

const SITE_DATA_KEY = 'joselo_site_data';
// localStorage fallbacks for Supabase columns that may not exist yet
const LS_EXTENDED = 'joselo_bio_extended';
const LS_AWARDS   = 'joselo_awards';
const LS_GALLERY  = 'joselo_gallery';
function lsGet(key, def) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; } catch(e) { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

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
    extendedHtml: '',
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
  awards: [],
  gallery: { collage: [], slideshow: [], titles: {} },
  lastSaved: null
};

// Deep clone helper (pure JSON data, so this is safe)
function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}


// Map Supabase snake_case fields to the local camelCase used throughout the site
function normalizeArtwork(row) {
  return {
    id: row.id,
    title: row.title || '',
    technique: row.technique || '',
    medium: row.medium || '',
    size: row.size || '',
    price: row.price || '',
    status: row.status || 'available',
    category: row.category || 'painting',
    image: row.image_url || 'placeholder',
    sort_order: row.sort_order
  };
}
function normalizeAward(row) {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    institution: row.institution || '',
    sort_order: row.sort_order
  };
}

function normalizeBio(row) {
  if (!row) return cloneDefault().bio;
  return {
    paragraph1: row.paragraph1 || '',
    paragraph2: row.paragraph2 || '',
    statement: row.statement || '',
    portraitImage: row.portrait_url || null,
    extendedHtml: row.extended_html || '',
    stats: {
      works: row.stat_works || 0,
      exhibitions: row.stat_exhibitions || 0,
      collections: row.stat_collections || 0
    }
  };
}
function normalizeContact(row) {
  if (!row) return cloneDefault().contact;
  return {
    email: row.email || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    instagram: row.instagram || '',
    facebook: row.facebook || ''
  };
}
function normalizeExhibition(row) {
  return {
    id: row.id,
    name: row.name || '',
    venue: row.venue || '',
    year: row.year || '',
    status: row.status || 'past',
    sort_order: row.sort_order
  };
}

// Fetch all site data from Supabase (normalized to the local shape)
async function fetchSiteData() {
  try {
    const [artworksRes, bioRes, contactRes, exhibitionsRes] = await Promise.all([
      supabase.from('artworks').select('*').order('sort_order'),
      supabase.from('bio').select('*').eq('id', 1).maybeSingle(),
      supabase.from('contact').select('*').eq('id', 1).maybeSingle(),
      supabase.from('exhibitions').select('*').order('sort_order')
    ]);

    let awardsData = [];
    try {
      const { data } = await supabase.from('awards').select('*').order('sort_order');
      awardsData = data || [];
    } catch(e) { /* awards table may not exist yet */ }

    // Normalize bio and fill extendedHtml from localStorage if Supabase column missing
    const bioNorm = normalizeBio(bioRes.data);
    if (!bioNorm.extendedHtml) bioNorm.extendedHtml = lsGet(LS_EXTENDED, '');

    // Use localStorage awards if Supabase table missing/empty
    const normalizedAwards = awardsData.length
      ? awardsData.map(normalizeAward)
      : lsGet(LS_AWARDS, []);

    // Gallery selection — try Supabase gallery_config, fall back to localStorage
    let gallery = { collage: [], slideshow: [], titles: {} };
    try {
      const { data } = await supabase.from('gallery_config').select('*').eq('id', 1).maybeSingle();
      if (data) {
        gallery = {
          collage:   typeof data.collage   === 'string' ? JSON.parse(data.collage   || '[]') : (data.collage   || []),
          slideshow: typeof data.slideshow === 'string' ? JSON.parse(data.slideshow || '[]') : (data.slideshow || []),
          titles:    typeof data.titles    === 'string' ? JSON.parse(data.titles    || '{}') : (data.titles    || {})
        };
      } else {
        gallery = lsGet(LS_GALLERY, gallery);
      }
    } catch(e) { gallery = lsGet(LS_GALLERY, gallery); }

    return {
      artworks:    (artworksRes.data    || []).map(normalizeArtwork),
      bio:         bioNorm,
      contact:     normalizeContact(contactRes.data),
      exhibitions: (exhibitionsRes.data || []).map(normalizeExhibition),
      awards:      normalizedAwards,
      gallery:     gallery,
      lastSaved:   null
    };
  } catch (e) {
    console.warn('Supabase unavailable, using defaults:', e);
    return cloneDefault();
  }
}

// Legacy shim — admin code still calls getSiteData() synchronously in a few spots.
// It will be overwritten with the real async-loaded data at init.
function getSiteData() { return cloneDefault(); }

// Persist the admin's in-memory `data` object to Supabase.
// Returns true on success, false on any failure (caller shows a toast).
async function saveSiteDataToSupabase(data) {
  try {
    const now = new Date().toISOString();

    // 1) Bio (single row, id=1)
    {
      const b = data.bio || {};
      const stats = b.stats || {};
      // Always persist extendedHtml to localStorage as an immediate fallback
      lsSet(LS_EXTENDED, b.extendedHtml || '');
      const bioBase = {
        id: 1,
        paragraph1:       b.paragraph1 || '',
        paragraph2:       b.paragraph2 || '',
        statement:        b.statement  || '',
        portrait_url:     b.portraitImage || null,
        stat_works:       stats.works       || 0,
        stat_exhibitions: stats.exhibitions || 0,
        stat_collections: stats.collections || 0,
        updated_at:       now
      };
      // Try with extended_html; fall back without it if the column doesn't exist yet
      let { error } = await supabase.from('bio').upsert({ ...bioBase, extended_html: b.extendedHtml || '' });
      if (error) {
        const r2 = await supabase.from('bio').upsert(bioBase);
        if (r2.error) throw r2.error;
      }
    }

    // 2) Contact (single row, id=1)
    {
      const c = data.contact || {};
      const { error } = await supabase.from('contact').upsert({
        id: 1,
        email:     c.email     || '',
        phone:     c.phone     || '',
        whatsapp:  c.whatsapp  || '',
        instagram: c.instagram || '',
        facebook:  c.facebook  || '',
        updated_at: now
      });
      if (error) throw error;
    }

    // 3) Artworks — delete rows removed locally, upsert the rest with array index as sort_order
    {
      const localIds = (data.artworks || []).map(a => a.id).filter(Boolean);
      const { data: remote, error: selErr } = await supabase.from('artworks').select('id');
      if (selErr) throw selErr;
      const toDelete = (remote || []).map(r => r.id).filter(id => !localIds.includes(id));
      if (toDelete.length) {
        const { error: delErr } = await supabase.from('artworks').delete().in('id', toDelete);
        if (delErr) throw delErr;
      }
      const rows = (data.artworks || []).map((a, i) => ({
        id:         a.id,
        title:      a.title || '',
        technique:  a.technique || '',
        medium:     a.medium || '',
        size:       a.size || '',
        price:      a.price || '',
        status:     a.status || 'available',
        category:   a.category || 'painting',
        image_url:  (!a.image || a.image === 'placeholder') ? null : a.image,
        sort_order: i,
        updated_at: now
      }));
      if (rows.length) {
        const { error } = await supabase.from('artworks').upsert(rows);
        if (error) throw error;
      }
    }

    // 4) Exhibitions — same pattern
    {
      const localIds = (data.exhibitions || []).map(a => a.id).filter(Boolean);
      const { data: remote, error: selErr } = await supabase.from('exhibitions').select('id');
      if (selErr) throw selErr;
      const toDelete = (remote || []).map(r => r.id).filter(id => !localIds.includes(id));
      if (toDelete.length) {
        const { error: delErr } = await supabase.from('exhibitions').delete().in('id', toDelete);
        if (delErr) throw delErr;
      }
      const rows = (data.exhibitions || []).map((e, i) => ({
        id:         e.id,
        name:       e.name  || '',
        venue:      e.venue || '',
        year:       e.year  || '',
        status:     e.status || 'past',
        sort_order: i
      }));
      if (rows.length) {
        const { error } = await supabase.from('exhibitions').upsert(rows);
        if (error) throw error;
      }
    }

    // 5) Awards — always persist to localStorage, also try Supabase
    lsSet(LS_AWARDS, data.awards || []);
    try {
      const localAwardIds = (data.awards || []).map(a => a.id).filter(Boolean);
      const { data: remoteAw, error: selAwErr } = await supabase.from('awards').select('id');
      if (!selAwErr) {
        const toDeleteAw = (remoteAw || []).map(r => r.id).filter(id => !localAwardIds.includes(id));
        if (toDeleteAw.length) await supabase.from('awards').delete().in('id', toDeleteAw);
        const awRows = (data.awards || []).map((a, i) => ({
          id:          a.id,
          title:       a.title || '',
          description: a.description || '',
          institution: a.institution || '',
          sort_order:  i
        }));
        if (awRows.length) await supabase.from('awards').upsert(awRows);
      }
    } catch(e) { console.warn('Awards Supabase sync skipped (table may not exist):', e); }

    // 6) Gallery selection — always persist to localStorage, also try Supabase
    {
      const g = data.gallery || { collage: [], slideshow: [], titles: {} };
      lsSet(LS_GALLERY, g);
      try {
        await supabase.from('gallery_config').upsert({
          id: 1,
          collage:   JSON.stringify(g.collage || []),
          slideshow: JSON.stringify(g.slideshow || []),
          titles:    JSON.stringify(g.titles || {}),
          updated_at: now
        });
      } catch(e) { console.warn('Gallery Supabase sync skipped (table may not exist):', e); }
    }

    return true;
  } catch (e) {
    console.error('Supabase save failed:', e);
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
  'painting':     { label: 'Pintura',       color: '#E4247A', gradient: 'linear-gradient(135deg,rgb(72, 185, 255),rgb(30, 239, 239))' },
  'drawing':      { label: 'Dibujo',        color: '#275EEA', gradient: 'linear-gradient(135deg, #275EEA, #4AF2DC)' },
  'digital':      { label: 'Arte Digital',  color: '#4AF2DC', gradient: 'linear-gradient(135deg,rgb(138, 209, 227),rgb(15, 127, 239))' },
  'mixed-media':  { label: 'Técnica Mixta', color: '#9B2FAA', gradient: 'linear-gradient(135deg,rgb(198, 132, 146), #E4247A)' },
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
  // Full URL (Supabase Storage, etc.) — use as-is
  if (/^https?:\/\//i.test(val)) return val;
  // Bare filename — look in local images folder
  return 'images/obras/' + val;
}

// Resolve portrait image. Returns null when there is no real photo —
// the caller should fall back to the inline SVG (portraitPlaceholder()).
function getPortraitImageSrc(bio) {
  if (!bio || !bio.portraitImage) return null;
  const val = bio.portraitImage;
  if (/^https?:\/\//i.test(val)) return val;
  return 'images/artista/' + val;
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
