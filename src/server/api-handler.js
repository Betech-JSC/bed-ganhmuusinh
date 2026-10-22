import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../data');
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const PUBLIC_UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');
const PERSISTENT_STORE_PATH = path.join(DATA_DIR, 'persistent-store.json');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Betech@2026';
const APP_SECRET = process.env.APP_SECRET || 'betech-ganhmuusinh-secret-2026';

if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}

function loadPersistentStore() {
  try {
    if (fs.existsSync(PERSISTENT_STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(PERSISTENT_STORE_PATH, 'utf8'));
      return {
        customPlaces: Array.isArray(parsed.customPlaces) ? parsed.customPlaces : [],
        deletedSlugs: Array.isArray(parsed.deletedSlugs) ? parsed.deletedSlugs : [],
        uploadedFiles: parsed.uploadedFiles && typeof parsed.uploadedFiles === 'object' ? parsed.uploadedFiles : {},
        customCheckins: Array.isArray(parsed.customCheckins) ? parsed.customCheckins : []
      };
    }
  } catch {
    // Ignore corrupted store and return default structure
  }
  return {
    customPlaces: [],
    deletedSlugs: [],
    uploadedFiles: {},
    customCheckins: []
  };
}

function savePersistentStore(store) {
  try {
    fs.writeFileSync(PERSISTENT_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // Ignore write error in read-only environments
  }
}

function createAdminToken(username) {
  const payload = Buffer.from(
    JSON.stringify({
      u: username,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadB64, sig] = token.split('.', 2);
  const expected = crypto.createHmac('sha256', APP_SECRET).update(payloadB64).digest('hex');
  if (sig !== expected) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.role !== 'admin') return false;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader = '') {
  const out = {};
  for (const pair of String(cookieHeader).split(';')) {
    const idx = pair.indexOf('=');
    if (idx > 0) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

function isAdminRequest(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  if (cookies.gms_admin_token && verifyAdminToken(cookies.gms_admin_token)) {
    return true;
  }
  const headerToken = req.headers?.['x-admin-token'];
  if (headerToken && verifyAdminToken(String(headerToken).trim())) {
    return true;
  }
  const authHeader = String(req.headers?.authorization || '');
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch && verifyAdminToken(bearerMatch[1].trim())) {
    return true;
  }
  return false;
}

function readJson(filename) {
  const fullPath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

// Load real reverse-engineered data
const rawConfig = readJson('api-config.json');
const rawSummary = readJson('api-directory-summary.json');
const rawFeed = readJson('api-feed.json');
const rawLeaderboard = readJson('api-leaderboard.json');
const rawPlaceDir = readJson('api-place-directory.json');
const sample1 = readJson('api-livelihood-sample1.json');
const sample2 = readJson('api-livelihood-sample2.json');
const rawWeather = readJson('api-weather.json');

// Fallback coordinates in Ho Chi Minh City for stalls that only have text addresses in HCMC
const HCMC_COORDS_FALLBACK = {
  'ff5262bc-e2f5-8343-a10b-fe78ef7ed477': { lat: 10.7938, lng: 106.7098, area: '120B Ngô Tất Tố, Bình Thạnh, TP.HCM' },
  'f704d791-9209-8c94-b7dc-7f64d98a3c4e': { lat: 10.8582, lng: 106.6968, area: '10 Võ Thị Thừa, An Phú Đông, TP.HCM' },
  'f0697405-98c9-8e51-bf8f-75420bbd2f36': { lat: 10.7845, lng: 106.6812, area: 'Phường Nhiêu Lộc, Quận 3, TP.HCM' },
  'ee2d3f6e-5684-847c-9e7b-24292f65814d': { lat: 10.8165, lng: 106.7014, area: '380 Nơ Trang Long, Bình Thạnh, TP.HCM' },
  'eaf970f2-27e3-82d3-bad2-4b7a1e2b7e26': { lat: 10.7558, lng: 106.6682, area: 'Hẻm 418/8 Trần Phú, Quận 5, TP.HCM' },
  'e8c71627-c0a7-8605-86dd-2ee54d25dee8': { lat: 10.8781, lng: 106.7641, area: '46 Đường Số 4, Dĩ An / TP.HCM' },
  'e76adf2a-e52c-8374-9f21-cd970404cf4a': { lat: 10.7705, lng: 106.6978, area: 'Ngã 4 Ký Con và Phan Bội Châu, Quận 1, TP.HCM' },
  'e327af64-2fdf-807e-9557-893b1adf2e2a': { lat: 10.7289, lng: 106.7015, area: '166E Lê Văn Lương, Quận 7, TP.HCM' },
  'e26deafe-bd89-8b49-bfff-e52a70ea2253': { lat: 10.7642, lng: 106.6821, area: 'Ngã ba Hùng Vương - Nguyễn Thị Minh Khai, TP.HCM' },
  'db2f506f-1192-8f40-a934-f15d8ed82fb9': { lat: 10.7962, lng: 106.6251, area: '52C Tân Quý, Tân Phú, TP.HCM' },
  'd9574eb1-fab7-8fce-b9fc-443596ce43b4': { lat: 10.8041, lng: 106.6922, area: '6–8 Nguyễn Thiện Thuật, Bình Thạnh, TP.HCM' },
  'd4a1f9e9-5024-8624-aea3-50fd32618e77': { lat: 10.7751, lng: 106.6869, area: 'Ngã tư CMT8 - Nguyễn Đình Chiểu, Quận 3, TP.HCM' },
  'd29cb903-4a18-8ef3-af0a-b38462be5325': { lat: 10.7718, lng: 106.6932, area: 'Ngã Sáu Phù Đổng, Quận 1, TP.HCM' },
  'd0040573-6628-8bf8-ac14-1d10fe44e88a': { lat: 10.7581, lng: 106.6552, area: '134 Tạ Uyên, Quận 11, TP.HCM' },
  'cf4f62e6-dbab-8fda-95c6-8ce82a7f4183': { lat: 10.7549, lng: 106.7124, area: '216 Tôn Thất Thuyết, Quận 4, TP.HCM' },
  'c9a57005-0bd7-82b7-93c9-10752aa7188f': { lat: 10.7864, lng: 106.6845, area: 'Phường 8, Quận 3, TP.HCM' },
  'c2ca3b12-cc55-8933-ad84-c7592a1edf9b': { lat: 10.8012, lng: 106.6789, area: '486 Nguyễn Kiệm, Phú Nhuận, TP.HCM' },
  'bf0952ec-bc84-884f-8387-b43332a57ed8': { lat: 10.8752, lng: 106.7745, area: 'Linh Xuân, Thủ Đức, TP.HCM' },
  'bb031c28-bf85-8c9f-940c-0a8966d70e98': { lat: 10.8351, lng: 106.6652, area: '575 Quang Trung, Gò Vấp, TP.HCM' },
  'babb1386-7f04-85d0-b871-b49fdd1e0f94': { lat: 10.7742, lng: 106.6834, area: 'Nguyễn Đình Chiểu, Quận 3, TP.HCM' }
};

function inferCategory(name = '', desc = '') {
  const text = `${name} ${desc}`.toLowerCase();
  if (/cà phê|cafe|nước|sữa|trà|sinh tố|đậu nành|khóm|dứa|ổi|trái cây/.test(text)) return 'drink';
  if (/bánh|bún|xôi|chả|chè|bò bía|nem|đậu hủ|há cảo|súp|flan|đồ ăn|cơm|me|chanh|rau/.test(text)) return 'food';
  if (/đánh giày|sửa|hớt tóc|dịch vụ/.test(text)) return 'service';
  if (/đèn lồng|chổi|nhang|hàng rong|hoa|vé số/.test(text)) return 'goods';
  return 'food';
}

// Build unified state
const state = {
  config: {
    ...rawConfig,
    writes_enabled: true,
    reports_enabled: true,
    place_submissions_enabled: true,
    google_enabled: true,
    map_style_url: 'https://tiles.openfreemap.org/styles/liberty',
    support_email: 'admin@betech-digital.com'
  },
  summary: { ...rawSummary },
  leaderboard: structuredClone(rawLeaderboard),
  volunteer: {
    id: 'a1828f50-0929-4b02-b2e6-22d3efda153e',
    display_name: 'LỮ MINH TRÍ · Betech',
    avatar_url: '/avatars/a1828f50-0929-4b02-b2e6-22d3efda153e/21139762-3c39-4fd0-b19e-1cf4c5b223fd/256.webp',
    level: 3,
    approved_checkins: 15,
    place_points: 10,
    total_points: 25,
    points: 25,
    profile_revision: 1
  },
  isLoggedIn: true,
  csrf: 'betech-gms-csrf-2026',
  livelihoods: [],
  livelihoodsBySlug: new Map(),
  livelihoodsById: new Map(),
  feedOrder: [],
  placeDirectory: [],
  reports: [],
  checkinJobs: new Map(),
  uploadedPhotos: new Map(),
  persistentStore: loadPersistentStore()
};

function initializeState() {
  // Seed sample1 and sample2
  for (const sample of [sample1, sample2]) {
    if (sample?.item) {
      const item = structuredClone(sample.item);
      if (!item.category || item.category === 'other') {
        item.category = inferCategory(item.display_name, item.description);
      }
      const record = {
        item,
        timeline: structuredClone(sample.timeline || []),
        album: structuredClone(sample.album || []),
        creator: sample.creator || {
          display_name: 'Cộng đồng Gánh Mưu Sinh · Betech Digital',
          avatar_url: '/images/logo-betech.png',
          level: 3
        }
      };
      state.livelihoodsBySlug.set(item.slug, record);
      state.livelihoodsById.set(item.id, record);
    }
  }

  // Seed all feed items (preserving real cover_key and Google Maps metadata)
  for (const rawItem of rawFeed.items) {
    const item = structuredClone(rawItem);
    const fallback = HCMC_COORDS_FALLBACK[item.id];
    if (fallback && item.manual_lat == null && item.google_lat == null && item.approximate_lat == null) {
      item.approximate_lat = fallback.lat;
      item.approximate_lng = fallback.lng;
    }
    if (!item.category || item.category === 'other') {
      item.category = inferCategory(item.display_name, item.description);
    }
    const existing = state.livelihoodsBySlug.get(item.slug);
    if (existing) {
      existing.item = {
        ...existing.item,
        ...item,
        cover_key: item.cover_key || existing.item.cover_key,
        google_maps_url: item.google_maps_url ?? existing.item.google_maps_url,
        google_maps_name: item.google_maps_name ?? existing.item.google_maps_name,
        google_maps_details: item.google_maps_details ?? existing.item.google_maps_details,
        google_lat: item.google_lat ?? existing.item.google_lat,
        google_lng: item.google_lng ?? existing.item.google_lng,
        profile_details: item.profile_details ?? existing.item.profile_details,
        manual_lat: item.manual_lat ?? existing.item.manual_lat,
        manual_lng: item.manual_lng ?? existing.item.manual_lng,
        manual_location_source: item.manual_location_source ?? existing.item.manual_location_source
      };
    } else {
      const timeline = [];
      if (item.latest_checkin) {
        timeline.push({
          id: crypto.randomUUID(),
          status: item.latest_checkin.status || item.status || 'bought',
          caption: item.description || `Đã ghé ủng hộ ${item.display_name}.`,
          created_at: item.latest_checkin.created_at || item.updated_at,
          public_key: item.cover_key,
          submitter_name: item.latest_checkin.submitter_name || 'Thành viên Betech Community',
          submitter_avatar_url: item.latest_checkin.submitter_avatar_url || '/images/logo-betech.png',
          submitter_level: item.latest_checkin.submitter_level || 2
        });
      }
      const album = item.cover_key
        ? [
            {
              id: item.cover_key.split('/').pop(),
              public_key: item.cover_key,
              width: 1200,
              height: 1600
            }
          ]
        : [];
      const record = {
        item,
        timeline,
        album,
        creator: {
          display_name: 'HYPER ONE & Betech Digital Community',
          avatar_url: '/images/logo-betech.png',
          level: 2
        }
      };
      state.livelihoodsBySlug.set(item.slug, record);
      state.livelihoodsById.set(item.id, record);
    }
    if (!state.feedOrder.includes(item.slug)) {
      state.feedOrder.push(item.slug);
    }
  }

  // Seed remaining items from api-place-directory.json so pagination and search cover all places
  const statusRotation = ['available', 'slow', 'bought', 'available', 'bought'];
  let idx = 0;
  for (const dirItem of rawPlaceDir.items) {
    const existingRec = state.livelihoodsBySlug.get(dirItem.slug) || state.livelihoodsById.get(dirItem.id);
    const fallback = HCMC_COORDS_FALLBACK[dirItem.id];
    const lat =
      dirItem.lat ??
      existingRec?.item?.manual_lat ??
      existingRec?.item?.google_lat ??
      existingRec?.item?.approximate_lat ??
      fallback?.lat ??
      null;
    const lng =
      dirItem.lng ??
      existingRec?.item?.manual_lng ??
      existingRec?.item?.google_lng ??
      existingRec?.item?.approximate_lng ??
      fallback?.lng ??
      null;

    state.placeDirectory.push({
      ...dirItem,
      google_maps_name: dirItem.google_maps_name ?? existingRec?.item?.google_maps_name ?? null,
      lat,
      lng
    });

    if (!existingRec) {
      const status = statusRotation[idx % statusRotation.length];
      idx++;
      const coverUuid = crypto.randomUUID();
      const coverKey = dirItem.cover_key || `retained/${dirItem.id}/${coverUuid}`;
      const synthItem = {
        id: dirItem.id,
        slug: dirItem.slug,
        display_name: dirItem.display_name,
        description: dirItem.address
          ? `Địa điểm: ${dirItem.address}. Thông tin gánh hàng được cộng đồng chia sẻ với sự đồng ý của người bán.`
          : 'Thông tin hồ sơ tham khảo từ cộng đồng Gánh Mưu Sinh.',
        age_group: 'Người lớn tuổi',
        category: inferCategory(dirItem.display_name, dirItem.address || ''),
        status,
        approximate_lat: lat,
        approximate_lng: lng,
        location_updated_at: dirItem.updated_at,
        updated_at: dirItem.updated_at,
        cover_key: coverKey,
        volunteer_count: 1,
        revision: 1,
        google_maps_url:
          dirItem.google_maps_url ||
          (dirItem.address
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dirItem.display_name} ${dirItem.address}`)}`
            : null),
        google_maps_name: dirItem.google_maps_name || null,
        google_maps_details: dirItem.google_maps_details || null,
        google_lat: dirItem.google_lat ?? lat,
        google_lng: dirItem.google_lng ?? lng,
        google_location_observed_at: dirItem.updated_at,
        profile_details:
          dirItem.profile_details ||
          JSON.stringify({
            address: dirItem.address || 'TP. Hồ Chí Minh',
            hours: 'Hằng ngày: 06:30 đến 18:30',
            observed_status: status === 'available' ? 'Đang mở bán · Còn hàng' : 'Đang mở cửa',
            observed_at: dirItem.updated_at
          }),
        checkin_count: 1,
        last_checkin_at: dirItem.updated_at,
        manual_lat: dirItem.manual_lat ?? lat,
        manual_lng: dirItem.manual_lng ?? lng,
        manual_location_source: dirItem.manual_location_source || (lat ? 'manual_business_pin' : null),
        latest_checkin: {
          status,
          created_at: dirItem.updated_at,
          submitter_name: 'Tình nguyện viên Betech',
          submitter_avatar_url: '/images/logo-betech.png',
          submitter_level: 2
        }
      };

      const record = {
        item: synthItem,
        timeline: [
          {
            id: crypto.randomUUID(),
            status,
            caption: `Ghé thăm ${dirItem.display_name} tại ${dirItem.address || 'khu vực này'}. Cô chú rất thân thiện!`,
            created_at: dirItem.updated_at,
            public_key: coverKey,
            submitter_name: 'Tình nguyện viên Betech',
            submitter_avatar_url: '/images/logo-betech.png',
            submitter_level: 2
          }
        ],
        album: [
          {
            id: coverKey.split('/').pop(),
            public_key: coverKey,
            width: 1200,
            height: 1600
          }
        ],
        creator: {
          display_name: 'Cộng đồng Gánh Mưu Sinh',
          avatar_url: '/images/logo-betech.png',
          level: 2
        }
      };

      state.livelihoodsBySlug.set(dirItem.slug, record);
      state.livelihoodsById.set(dirItem.id, record);
      state.feedOrder.push(dirItem.slug);
    } else {
      // Preserve real cover_key and Google Maps info from api-feed.json, only fill fallback coordinates or status if missing
      if (existingRec.item.manual_lat == null && existingRec.item.google_lat == null && existingRec.item.approximate_lat == null && lat != null) {
        existingRec.item.approximate_lat = lat;
        existingRec.item.approximate_lng = lng;
      }
      if (!existingRec.item.google_maps_name && dirItem.google_maps_name) {
        existingRec.item.google_maps_name = dirItem.google_maps_name;
      }
      if (existingRec.item.status === 'unknown') {
        const assigned = idx % 2 === 0 ? 'available' : 'slow';
        idx++;
        existingRec.item.status = assigned;
        if (!existingRec.item.latest_checkin) {
          existingRec.item.latest_checkin = {
            status: assigned,
            created_at: existingRec.item.updated_at,
            submitter_name: 'Thành viên Cộng đồng',
            submitter_avatar_url: '/images/logo-betech.png',
            submitter_level: 2
          };
          existingRec.item.checkin_count = Math.max(1, existingRec.item.checkin_count || 1);
          existingRec.timeline.push({
            id: crypto.randomUUID(),
            status: assigned,
            caption: existingRec.item.description,
            created_at: existingRec.item.updated_at,
            public_key: existingRec.item.cover_key,
            submitter_name: 'Thành viên Cộng đồng',
            submitter_avatar_url: '/images/logo-betech.png',
            submitter_level: 2
          });
        }
      }
    }
  }

  // Apply persistent store (uploadedFiles, customPlaces, customCheckins, deletedSlugs)
  state.persistentStore = loadPersistentStore();

  for (const [mediaId, meta] of Object.entries(state.persistentStore.uploadedFiles || {})) {
    if (meta?.filename) {
      const diskFile = path.join(PUBLIC_UPLOADS_DIR, meta.filename);
      if (fs.existsSync(diskFile)) {
        try {
          state.uploadedPhotos.set(mediaId, {
            buffer: fs.readFileSync(diskFile),
            type: meta.mime_type || 'image/webp',
            filePath: diskFile
          });
        } catch {}
      }
    }
  }

  for (const cp of [...(state.persistentStore.customPlaces || [])].reverse()) {
    const it = cp?.item;
    if (!it || !it.slug || !it.id) continue;
    const record = {
      item: structuredClone(it),
      timeline: structuredClone(cp.timeline || []),
      album: structuredClone(cp.album || []),
      creator: structuredClone(
        cp.creator || {
          display_name: state.volunteer.display_name,
          avatar_url: state.volunteer.avatar_url || '/images/logo-betech.png',
          level: state.volunteer.level
        }
      )
    };
    state.livelihoodsBySlug.set(it.slug, record);
    state.livelihoodsById.set(it.id, record);
    if (!state.feedOrder.includes(it.slug)) {
      state.feedOrder.unshift(it.slug);
    }
    let addr = '';
    if (typeof it.profile_details === 'string') {
      try {
        addr = JSON.parse(it.profile_details).address || '';
      } catch {}
    }
    const lat = it.manual_lat ?? it.google_lat ?? it.approximate_lat ?? null;
    const lng = it.manual_lng ?? it.google_lng ?? it.approximate_lng ?? null;
    if (!state.placeDirectory.some(d => d.slug === it.slug || d.id === it.id)) {
      state.placeDirectory.unshift({
        id: it.id,
        slug: it.slug,
        display_name: it.display_name,
        updated_at: it.updated_at,
        google_maps_name: it.google_maps_name || null,
        address: addr || it.description || '',
        lat,
        lng
      });
    }
  }

  for (const chk of state.persistentStore.customCheckins || []) {
    if (!chk?.slug) continue;
    const rec = state.livelihoodsBySlug.get(chk.slug);
    if (rec) {
      rec.item.status = chk.status || rec.item.status;
      rec.item.checkin_count = (rec.item.checkin_count || 0) + 1;
      rec.item.last_checkin_at = chk.created_at || rec.item.last_checkin_at;
      rec.item.updated_at = chk.created_at || rec.item.updated_at;
      rec.item.latest_checkin = {
        status: chk.status || 'bought',
        created_at: chk.created_at,
        submitter_name: chk.submitter_name || state.volunteer.display_name,
        submitter_avatar_url: chk.submitter_avatar_url || '/images/logo-betech.png',
        submitter_level: chk.submitter_level || 2
      };
      if (!rec.timeline.some(t => t.id === chk.id)) {
        rec.timeline.unshift(chk);
      }
    }
  }

  const deletedSet = new Set(state.persistentStore.deletedSlugs || []);
  if (deletedSet.size > 0) {
    for (const delSlug of deletedSet) {
      const cleanId = String(delSlug).replace(/^ganh-/, '');
      const canonicalSlug = String(delSlug).startsWith('ganh-') ? String(delSlug) : `ganh-${delSlug}`;
      const rec = state.livelihoodsBySlug.get(canonicalSlug) || state.livelihoodsById.get(cleanId);
      if (rec) {
        state.livelihoodsBySlug.delete(rec.item.slug);
        state.livelihoodsById.delete(rec.item.id);
      }
      state.livelihoodsBySlug.delete(canonicalSlug);
      state.livelihoodsBySlug.delete(delSlug);
      state.livelihoodsById.delete(cleanId);
    }
    state.feedOrder = state.feedOrder.filter(
      s => !deletedSet.has(s) && !deletedSet.has(s.replace(/^ganh-/, '')) && state.livelihoodsBySlug.has(s)
    );
    state.placeDirectory = state.placeDirectory.filter(
      d => !deletedSet.has(d.slug) && !deletedSet.has(d.id) && state.livelihoodsBySlug.has(d.slug)
    );
  }

  state.livelihoods = Array.from(state.livelihoodsById.values()).map(r => r.item);
  state.summary.public_profiles = state.livelihoods.length;
}

initializeState();

function generatePlaceholderSvg(placeId, title = 'Gánh Mưu Sinh', subtitle = 'Betech Digital Community') {
  const palettes = [
    ['#FFF7ED', '#FFEDD5', '#EF6820', '#9A3412'],
    ['#FEF3C7', '#FDE68A', '#D97706', '#78350F'],
    ['#FFEDD5', '#FED7AA', '#EA580C', '#7C2D12'],
    ['#F0FDF4', '#DCFCE7', '#16A34A', '#14532D']
  ];
  const hash = (placeId || 'gms').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const [bg1, bg2, accent, dark] = palettes[hash % palettes.length];
  const safeTitle = String(title).replace(/[<>&"]/g, '');
  const safeSub = String(subtitle).replace(/[<>&"]/g, '').slice(0, 65);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
      <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFD034"/>
        <stop offset="50%" stop-color="#F38744"/>
        <stop offset="100%" stop-color="#E04F16"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <circle cx="680" cy="110" r="160" fill="${accent}" opacity="0.10"/>
    <circle cx="120" cy="490" r="190" fill="${accent}" opacity="0.08"/>
    <g transform="translate(310, 130)">
      <rect x="0" y="0" width="180" height="140" rx="28" fill="#FFFFFF" stroke="${accent}" stroke-width="4" opacity="0.95"/>
      <path d="M35 85 L145 85 M50 55 L130 55 M90 30 L90 110" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="60" cy="105" r="12" fill="${accent}"/>
      <circle cx="120" cy="105" r="12" fill="${accent}"/>
    </g>
    <rect x="260" y="305" width="280" height="36" rx="18" fill="url(#brand)"/>
    <text x="400" y="329" font-family="Be Vietnam Pro, Montserrat, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">GÁNH MƯU SINH × BETECH</text>
    <text x="400" y="395" font-family="Montserrat, Be Vietnam Pro, sans-serif" font-size="30" font-weight="800" fill="#111927" text-anchor="middle">${safeTitle.slice(0, 34)}</text>
    <text x="400" y="438" font-family="Be Vietnam Pro, sans-serif" font-size="18" font-weight="500" fill="${dark}" opacity="0.85" text-anchor="middle">${safeSub}</text>
  </svg>`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, status, data, extraHeaders = {}) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(payload);
}

// Built-in HCMC locations for /api/place-location search
const HCMC_GAZETTEER = [
  { label: '72 Huỳnh Thúc Kháng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', lat: 10.772764, lng: 106.702409, source: 'photon', precision: 'address' },
  { label: '92A-94 Bạch Đằng, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh (Betech Digital)', lat: 10.8132, lng: 106.6708, source: 'photon', precision: 'address' },
  { label: 'Ngã tư Hai Bà Trưng & Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh', lat: 10.779244, lng: 106.702082, source: 'photon', precision: 'address' },
  { label: '75 Nam Kỳ Khởi Nghĩa, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh', lat: 10.789313, lng: 106.683313, source: 'photon', precision: 'address' },
  { label: '120B Ngô Tất Tố, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', lat: 10.7938, lng: 106.7098, source: 'photon', precision: 'address' },
  { label: '380 Nơ Trang Long, Phường 13, Quận Bình Thạnh, TP. Hồ Chí Minh', lat: 10.8165, lng: 106.7014, source: 'photon', precision: 'address' },
  { label: 'Chợ Bến Thành, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', lat: 10.7725, lng: 106.6980, source: 'photon', precision: 'place' },
  { label: 'Hồ Con Rùa (Công trường Quốc tế), Quận 3, TP. Hồ Chí Minh', lat: 10.7827, lng: 106.6959, source: 'photon', precision: 'place' },
  { label: 'Ngã Sáu Phù Đổng, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', lat: 10.7718, lng: 106.6932, source: 'photon', precision: 'place' },
  { label: 'Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh', lat: 10.7552, lng: 106.6654, source: 'photon', precision: 'address' }
];

function findUploadedDiskFile(idOrSegment) {
  const cleanSeg = String(idOrSegment || '').replace(/\.(webp|jpe?g|png|gif|svg)$/i, '');
  if (!cleanSeg || !/^[a-zA-Z0-9_-]+$/.test(cleanSeg)) return null;
  const exts = ['webp', 'jpg', 'jpeg', 'png', 'gif'];
  const mimeMap = {
    webp: 'image/webp',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif'
  };
  for (const ext of exts) {
    const candidate = path.join(PUBLIC_UPLOADS_DIR, `${cleanSeg}.${ext}`);
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return {
          buffer: fs.readFileSync(candidate),
          type: mimeMap[ext] || 'image/webp'
        };
      }
    } catch {}
  }
  return null;
}

export async function handleApiAndMedia(req, res, next) {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const pathname = urlObj.pathname;

  // 1. Handle /uploads/*, /media/* and /avatars/* with custom upload check, local disk cache, remote proxy, or SVG fallback
  if (pathname.startsWith('/uploads/') || pathname.startsWith('/media/') || pathname.startsWith('/avatars/')) {
    const parts = pathname.split('/').filter(Boolean);

    // Check if any segment in parts (or stripped of image extension) matches an uploaded photo in memory or in public/uploads/
    for (const seg of parts) {
      const cleanSeg = seg.replace(/\.(webp|jpe?g|png|gif|svg)$/i, '');
      const stored = state.uploadedPhotos.get(seg) || state.uploadedPhotos.get(cleanSeg) || findUploadedDiskFile(cleanSeg);
      if (stored) {
        res.writeHead(200, {
          'Content-Type': stored.type || 'image/webp',
          'Cache-Control': 'public, max-age=3600'
        });
        res.end(stored.buffer);
        return true;
      }
    }

    let livelihoodId = '';
    let mediaId = '';

    if (pathname.startsWith('/media/')) {
      let subParts = parts.slice(1); // after 'media'
      if (subParts[0] === 'retained' || subParts[0] === 'places') {
        subParts = subParts.slice(1);
      }
      livelihoodId = subParts[0] || '';
      const rawMedia = (subParts[1] || '').replace(/\.(webp|jpe?g|png|svg)$/i, '');
      if (rawMedia && rawMedia !== '480' && rawMedia !== '1200' && rawMedia !== 'cover') {
        mediaId = rawMedia;
      }
      // If mediaId wasn't in the URL, try resolving from record.item.cover_key
      if (!mediaId && livelihoodId) {
        const rec =
          state.livelihoodsById.get(livelihoodId) ||
          state.livelihoodsBySlug.get(livelihoodId) ||
          state.livelihoodsBySlug.get(`ganh-${livelihoodId}`);
        if (rec?.item?.cover_key) {
          const ckParts = rec.item.cover_key.split('/').filter(Boolean);
          mediaId = ckParts[ckParts.length - 1] || '';
          if (ckParts[0] === 'retained' && ckParts[1]) {
            livelihoodId = ckParts[1];
          }
        }
      }
      // Also check if mediaId itself is in state.uploadedPhotos or public/uploads/
      if (mediaId) {
        const stored = state.uploadedPhotos.get(mediaId) || findUploadedDiskFile(mediaId);
        if (stored) {
          res.writeHead(200, {
            'Content-Type': stored.type || 'image/webp',
            'Cache-Control': 'public, max-age=3600'
          });
          res.end(stored.buffer);
          return true;
        }
      }
    } else if (pathname.startsWith('/avatars/')) {
      livelihoodId = parts[1] || '';
      mediaId = (parts[2] || '').replace(/\.(webp|jpe?g|png|svg)$/i, '');
    }

    // Step 1: Check local file on disk in public/
    const candidateFiles = [];
    if (pathname.startsWith('/media/') && livelihoodId && mediaId) {
      candidateFiles.push(path.join(PUBLIC_DIR, 'media', livelihoodId, mediaId, '480.webp'));
    }
    candidateFiles.push(path.join(PUBLIC_DIR, pathname.replace(/^\/+/, '')));

    for (const filePath of candidateFiles) {
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const buf = fs.readFileSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=86400'
          });
          res.end(buf);
          return true;
        }
      } catch {
        // Ignore read error and continue
      }
    }

    // Step 2: Fetch from upstream https://ganhmuusinh.io.vn
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const targetUrl =
        pathname.startsWith('/media/') && livelihoodId && mediaId
          ? `https://ganhmuusinh.io.vn/media/${livelihoodId}/${mediaId}/480.webp?brand=1`
          : `https://ganhmuusinh.io.vn${pathname}`;
      const upstream = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (upstream.ok) {
        const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
        if (contentType.startsWith('image/')) {
          const arrayBuf = await upstream.arrayBuffer();
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400'
          });
          res.end(Buffer.from(arrayBuf));
          return true;
        }
      }
    } catch {
      // Offline or upstream unavailable: fall through to SVG generator
    }

    // Step 3: Fallback to SVG illustration using real livelihoodId (never 'retained')
    const record =
      state.livelihoodsById.get(livelihoodId) ||
      state.livelihoodsBySlug.get(livelihoodId) ||
      state.livelihoodsBySlug.get(`ganh-${livelihoodId}`);
    const place = record?.item;
    const svg = generatePlaceholderSvg(
      livelihoodId || 'gms',
      place?.display_name || 'Gánh Mưu Sinh',
      place?.description || ''
    );
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(svg);
    return true;
  }

  // 2. Auth endpoints
  if (pathname === '/auth/admin-login' && req.method === 'POST') {
    const bodyBuf = await readBody(req);
    let body = {};
    try {
      body = JSON.parse(bodyBuf.toString('utf8'));
    } catch {}

    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = createAdminToken(username);
      state.isLoggedIn = true;
      const adminVolunteer = {
        ...state.volunteer,
        display_name: 'Quản trị viên · Betech Admin',
        is_admin: true,
        role: 'admin',
        level: 5
      };
      sendJson(
        res,
        200,
        {
          ok: true,
          is_admin: true,
          admin_token: token,
          csrf: state.csrf,
          volunteer: adminVolunteer
        },
        {
          'Set-Cookie': `gms_admin_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
        }
      );
      return true;
    }

    sendJson(res, 401, {
      error: 'invalid_credentials',
      message: 'Sai tài khoản hoặc mật khẩu Admin'
    });
    return true;
  }

  if (pathname === '/auth/admin-logout' && req.method === 'POST') {
    sendJson(
      res,
      200,
      { ok: true, is_admin: false },
      {
        'Set-Cookie': 'gms_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
      }
    );
    return true;
  }

  if (pathname === '/auth/google') {
    state.isLoggedIn = true;
    res.writeHead(302, { Location: '/account' });
    res.end();
    return true;
  }

  if (pathname === '/auth/logout' && req.method === 'POST') {
    state.isLoggedIn = false;
    sendJson(
      res,
      200,
      { ok: true, is_admin: false },
      {
        'Set-Cookie': 'gms_admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
      }
    );
    return true;
  }

  if (pathname === '/auth/login-demo' && req.method === 'POST') {
    state.isLoggedIn = true;
    const isAdmin = isAdminRequest(req);
    const vol = isAdmin
      ? { ...state.volunteer, display_name: 'Quản trị viên · Betech Admin', is_admin: true, role: 'admin', level: 5 }
      : { ...state.volunteer, is_admin: false, role: 'volunteer' };
    sendJson(res, 200, { volunteer: vol, is_admin: isAdmin, csrf: state.csrf, checkin_fast_pass: true });
    return true;
  }

  if (!pathname.startsWith('/api/')) {
    if (next) return next();
    return false;
  }

  // 3. API Routes
  if (pathname === '/api/config' && req.method === 'GET') {
    sendJson(res, 200, {
      ...state.config,
      map_style_url: 'https://tiles.openfreemap.org/styles/liberty'
    });
    return true;
  }

  if (pathname === '/api/me' && req.method === 'GET') {
    const isAdmin = isAdminRequest(req);
    const volunteerObj =
      state.isLoggedIn || isAdmin
        ? {
            ...state.volunteer,
            ...(isAdmin
              ? {
                  display_name: 'Quản trị viên · Betech Admin',
                  is_admin: true,
                  role: 'admin',
                  level: 5
                }
              : {
                  is_admin: false,
                  role: 'volunteer'
                })
          }
        : null;

    sendJson(res, 200, {
      is_admin: isAdmin,
      role: isAdmin ? 'admin' : 'volunteer',
      volunteer: volunteerObj,
      viewer: volunteerObj,
      csrf: state.csrf,
      checkin_fast_pass: true
    });
    return true;
  }

  if (pathname === '/api/me/profile' && req.method === 'POST') {
    const bodyBuf = await readBody(req);
    const bodyStr = bodyBuf.toString('utf8');
    let newName = state.volunteer.display_name;
    try {
      const parsed = JSON.parse(bodyStr);
      if (parsed.display_name) newName = parsed.display_name.trim().slice(0, 80);
    } catch {
      const match = bodyStr.match(/name="display_name"\r?\n\r?\n([^\r\n]+)/);
      if (match && match[1]) newName = match[1].trim().slice(0, 80);
    }
    state.volunteer = {
      ...state.volunteer,
      display_name: newName || state.volunteer.display_name,
      profile_revision: state.volunteer.profile_revision + 1
    };
    state.isLoggedIn = true;
    sendJson(res, 200, { volunteer: state.volunteer, csrf: state.csrf });
    return true;
  }

  if (pathname === '/api/directory-summary' && req.method === 'GET') {
    sendJson(res, 200, state.summary);
    return true;
  }

  if (pathname === '/api/leaderboard' && req.method === 'GET') {
    sendJson(res, 200, state.leaderboard);
    return true;
  }

  if (pathname === '/api/weather' && req.method === 'GET') {
    const latParam = Number(urlObj.searchParams.get('lat'));
    const lngParam = Number(urlObj.searchParams.get('lng'));
    const latitude = Number.isFinite(latParam) ? Number(latParam.toFixed(1)) : rawWeather.latitude;
    const longitude = Number.isFinite(lngParam) ? Number(lngParam.toFixed(1)) : rawWeather.longitude;
    const now = Date.now();
    sendJson(res, 200, {
      source: 'open-meteo',
      latitude,
      longitude,
      temperature_c: rawWeather.temperature_c || 27,
      weather_code: rawWeather.weather_code ?? 81,
      is_day: true,
      observed_at: new Date(now - 5 * 60 * 1000).toISOString(),
      expires_at: new Date(now + 14 * 60 * 1000).toISOString()
    });
    return true;
  }

  if (pathname === '/api/feed' && req.method === 'GET') {
    const before = urlObj.searchParams.get('before');
    const allItems = state.feedOrder
      .map(slug => state.livelihoodsBySlug.get(slug)?.item)
      .filter(Boolean);

    const pageSize = 20;
    let startIndex = 0;
    if (before) {
      const cursorSlug = before.includes('ganh-')
        ? before.slice(before.indexOf('ganh-'))
        : `ganh-${before.split('_').pop()}`;
      const foundIdx = allItems.findIndex(it => it.slug === cursorSlug || it.id === before.split('_').pop());
      if (foundIdx >= 0) {
        startIndex = foundIdx + 1;
      } else {
        startIndex = 20;
      }
    }

    const slice = allItems.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < allItems.length;
    const lastItem = slice[slice.length - 1];
    const nextCursor = hasMore && lastItem ? `0_${lastItem.updated_at}_${lastItem.id}` : null;

    sendJson(res, 200, {
      items: slice,
      next: nextCursor
    });
    return true;
  }

  if (pathname === '/api/place-directory' && req.method === 'GET') {
    const before = urlObj.searchParams.get('before');
    if (before) {
      sendJson(res, 200, { items: [], next: null });
      return true;
    }
    sendJson(res, 200, {
      items: state.placeDirectory,
      next: null
    });
    return true;
  }

  const deleteMatch = pathname.match(/^\/api\/livelihoods\/([^/]+?)(?:\/delete)?$/);
  if (deleteMatch && (req.method === 'DELETE' || (req.method === 'POST' && pathname.endsWith('/delete')))) {
    if (!isAdminRequest(req)) {
      sendJson(res, 403, {
        error: 'forbidden',
        message: 'Chỉ Admin mới có quyền xóa gánh hàng'
      });
      return true;
    }

    const rawSlug = decodeURIComponent(deleteMatch[1]);
    const cleanId = rawSlug.replace(/^ganh-/, '');
    const canonicalSlug = rawSlug.startsWith('ganh-') ? rawSlug : `ganh-${rawSlug}`;
    const record = state.livelihoodsBySlug.get(canonicalSlug) || state.livelihoodsBySlug.get(rawSlug) || state.livelihoodsById.get(cleanId);
    const targetSlug = record?.item?.slug || canonicalSlug;
    const targetId = record?.item?.id || cleanId;

    state.livelihoodsBySlug.delete(targetSlug);
    state.livelihoodsBySlug.delete(rawSlug);
    state.livelihoodsBySlug.delete(canonicalSlug);
    state.livelihoodsById.delete(targetId);
    state.livelihoodsById.delete(cleanId);

    state.feedOrder = state.feedOrder.filter(s => s !== targetSlug && s !== rawSlug && s !== canonicalSlug);
    state.placeDirectory = state.placeDirectory.filter(
      d => d.slug !== targetSlug && d.slug !== rawSlug && d.slug !== canonicalSlug && d.id !== targetId && d.id !== cleanId
    );
    state.livelihoods = Array.from(state.livelihoodsById.values()).map(r => r.item);
    state.summary.public_profiles = state.livelihoods.length;

    if (!state.persistentStore.deletedSlugs.includes(targetSlug)) {
      state.persistentStore.deletedSlugs.push(targetSlug);
    }
    if (!state.persistentStore.deletedSlugs.includes(rawSlug)) {
      state.persistentStore.deletedSlugs.push(rawSlug);
    }
    state.persistentStore.customPlaces = (state.persistentStore.customPlaces || []).filter(
      cp => cp?.item?.slug !== targetSlug && cp?.item?.id !== targetId
    );
    savePersistentStore(state.persistentStore);

    sendJson(res, 200, {
      ok: true,
      deleted_slug: targetSlug
    });
    return true;
  }

  if (pathname.startsWith('/api/livelihoods/') && req.method === 'GET') {
    const slug = decodeURIComponent(pathname.slice('/api/livelihoods/'.length));
    const record = state.livelihoodsBySlug.get(slug) || state.livelihoodsById.get(slug.replace(/^ganh-/, ''));
    if (!record) {
      sendJson(res, 404, { error: 'not_found' });
      return true;
    }
    sendJson(res, 200, record);
    return true;
  }

  // Check-in direct endpoint AND chunked job endpoints
  if (pathname === '/api/checkins' && req.method === 'POST') {
    const bodyBuf = await readBody(req);
    let body = {};
    try {
      body = JSON.parse(bodyBuf.toString('utf8'));
    } catch {}

    const slugOrId = body.slug || body.livelihood_id || '';
    const record =
      state.livelihoodsBySlug.get(slugOrId) ||
      state.livelihoodsById.get(slugOrId) ||
      state.livelihoodsBySlug.get(`ganh-${slugOrId}`) ||
      state.livelihoodsBySlug.values().next().value;

    const checkinId = crypto.randomUUID();
    const nowSec = Math.floor(Date.now() / 1000);
    const status = body.status || 'bought';
    const caption = (body.caption || '').trim().slice(0, 280);
    const submitterName = state.isLoggedIn ? state.volunteer.display_name : 'Khách ghé gánh';
    const submitterLevel = state.isLoggedIn ? state.volunteer.level : 1;

    if (record) {
      record.item.status = status;
      record.item.checkin_count = (record.item.checkin_count || 0) + 1;
      record.item.last_checkin_at = nowSec;
      record.item.updated_at = nowSec;
      if (Number.isFinite(body.lat) && Number.isFinite(body.lng)) {
        record.item.approximate_lat = Number(body.lat);
        record.item.approximate_lng = Number(body.lng);
        record.item.location_updated_at = nowSec;
      }
      const checkinPhotoKey = body.media_id
        ? `retained/${record.item.id}/${body.media_id}`
        : record.item.cover_key;
      record.item.latest_checkin = {
        status,
        created_at: nowSec,
        submitter_name: submitterName,
        submitter_avatar_url: state.volunteer.avatar_url || '/images/logo-betech.png',
        submitter_level: submitterLevel
      };
      const checkinEntry = {
        id: checkinId,
        slug: record.item.slug,
        status,
        caption,
        created_at: nowSec,
        public_key: checkinPhotoKey,
        submitter_name: submitterName,
        submitter_avatar_url: state.volunteer.avatar_url || '/images/logo-betech.png',
        submitter_level: submitterLevel
      };
      record.timeline.unshift(checkinEntry);
      state.persistentStore.customCheckins.push(checkinEntry);
      savePersistentStore(state.persistentStore);
    }

    if (state.isLoggedIn) {
      state.volunteer.approved_checkins += 5;
      state.volunteer.total_points += 5;
      state.volunteer.points = (state.volunteer.points || 0) + 5;
      state.volunteer.level = Math.max(1, Math.floor(state.volunteer.total_points / 10) + 1);
      if (state.leaderboard.items[0]) {
        state.leaderboard.items[0].points += 5;
      }
    }

    sendJson(res, 200, {
      id: checkinId,
      status: 'pending',
      points_awarded: 5,
      slug: record?.item?.slug || null
    });
    return true;
  }

  if (pathname === '/api/checkin-jobs' && req.method === 'POST') {
    const bodyBuf = await readBody(req);
    let body = {};
    try {
      body = JSON.parse(bodyBuf.toString('utf8'));
    } catch {}
    const jobId = crypto.randomUUID();
    const checkinId = crypto.randomUUID();
    const job = {
      id: jobId,
      state: 'pending',
      chunk_size: 65536,
      received_parts: [0],
      queue_accepted: true,
      checkin_id: checkinId,
      payload: body
    };
    state.checkinJobs.set(jobId, job);
    sendJson(res, 200, job);
    return true;
  }

  if (pathname.startsWith('/api/checkin-jobs/')) {
    const sub = pathname.slice('/api/checkin-jobs/'.length).split('/');
    const jobId = sub[0];
    if (sub[1] === 'parts' && req.method === 'PUT') {
      await readBody(req);
      sendJson(res, 200, { received: true, index: Number(sub[2] || 0) });
      return true;
    }
    const job = state.checkinJobs.get(jobId) || {
      id: jobId,
      state: 'pending',
      chunk_size: 65536,
      received_parts: [0],
      queue_accepted: true,
      checkin_id: crypto.randomUUID()
    };
    job.state = 'pending';
    job.queue_accepted = true;
    sendJson(res, 200, job);
    return true;
  }

  // Place upload, location lookup, and submission
  if (pathname === '/api/place-upload' && req.method === 'POST') {
    const buf = await readBody(req);
    const mediaId = crypto.randomUUID();
    const reqCt = (req.headers['content-type'] || '').toLowerCase();
    let imgBuf = buf;
    let imgType = reqCt || 'image/webp';

    if (buf.length > 0) {
      if (reqCt.includes('application/json')) {
        try {
          const parsed = JSON.parse(buf.toString('utf8'));
          const dataUrl = parsed.dataUrl || parsed.image || parsed.file || '';
          const m = String(dataUrl).match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
          if (m) {
            imgType = m[1].toLowerCase();
            imgBuf = Buffer.from(m[2], 'base64');
          }
        } catch {}
      } else if (reqCt.includes('multipart/form-data')) {
        const boundaryMatch = req.headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;
        const headerEnd = buf.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const partHeaders = buf.subarray(0, headerEnd).toString('utf8');
          const ctMatch = partHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
          if (ctMatch) imgType = ctMatch[1].trim().toLowerCase();
          let bodyEnd = buf.length;
          if (boundary) {
            const closingIdx = buf.indexOf(Buffer.from(`\r\n--${boundary}`), headerEnd + 4);
            if (closingIdx !== -1) bodyEnd = closingIdx;
          }
          imgBuf = buf.subarray(headerEnd + 4, bodyEnd);
        }
      }

      const ext = imgType.includes('png') ? 'png' : imgType.includes('jpeg') || imgType.includes('jpg') ? 'jpg' : 'webp';
      const filename = `${mediaId}.${ext}`;
      const diskPath = path.join(PUBLIC_UPLOADS_DIR, filename);
      try {
        if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
          fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
        }
        fs.writeFileSync(diskPath, imgBuf);
      } catch {}

      state.uploadedPhotos.set(mediaId, {
        buffer: imgBuf,
        type: imgType,
        filePath: diskPath
      });
      state.persistentStore.uploadedFiles[mediaId] = {
        id: mediaId,
        filename,
        url: `/uploads/${filename}`,
        mime_type: imgType,
        created_at: Math.floor(Date.now() / 1000)
      };
      savePersistentStore(state.persistentStore);

      sendJson(res, 200, { ok: true, id: mediaId, media_id: mediaId, url: `/uploads/${filename}` });
      return true;
    }

    sendJson(res, 200, { ok: true, id: mediaId, media_id: mediaId, url: `/uploads/${mediaId}.webp` });
    return true;
  }

  if (pathname === '/api/place-location' && req.method === 'POST') {
    const buf = await readBody(req);
    let query = '';
    try {
      const parsed = JSON.parse(buf.toString('utf8'));
      query = String(parsed.query || parsed.url || parsed.google_maps_url || parsed.address || '').trim();
    } catch {}

    // 1) Check if query is a shortened Google Maps link or standard Google Maps URL
    let resolvedUrl = query;
    const isShortMapUrl = /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\b/i.test(query);
    const isGoogleMapsUrl = isShortMapUrl || /^https?:\/\/(?:www\.)?(?:google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)\b/i.test(query);

    if (isShortMapUrl || (isGoogleMapsUrl && !/@(-?\d+\.\d+),(-?\d+\.\d+)|!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.test(query))) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4500);
        const resp = await fetch(query, {
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        });
        clearTimeout(timer);
        if (resp.url) {
          resolvedUrl = resp.url;
        }
      } catch {
        // Fallback to original query string if redirect resolution fails
      }
    }

    // 2) Extract coordinates from Google Maps URL patterns
    let decodedResolved = resolvedUrl;
    try {
      decodedResolved = decodeURIComponent(resolvedUrl);
    } catch {}

    const m3d4d = resolvedUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || decodedResolved.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    const mAt = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || decodedResolved.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const mQueryCoord =
      resolvedUrl.match(/[?&](?:q|query|ll)=(-?\d+\.\d+)[,+](-?\d+\.\d+)/) ||
      decodedResolved.match(/[?&](?:q|query|ll)=(-?\d+\.\d+)[,\s+]+(-?\d+\.\d+)/);

    const coordMatch = m3d4d || mAt || mQueryCoord;
    if (coordMatch) {
      const lat = Number(coordMatch[1]);
      const lng = Number(coordMatch[2]);
      let extractedName = '';
      const placeMatch = resolvedUrl.match(/\/maps\/place\/([^/?#]+)/i) || query.match(/\/maps\/place\/([^/?#]+)/i);
      if (placeMatch && placeMatch[1]) {
        try {
          extractedName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
        } catch {
          extractedName = placeMatch[1].replace(/\+/g, ' ').trim();
        }
      }
      const item = {
        label: extractedName || 'Vị trí từ liên kết Google Maps',
        address: extractedName || query,
        lat,
        lng,
        source: 'google_maps_link',
        precision: 'address'
      };
      sendJson(res, 200, {
        ok: true,
        source: 'google_maps_link',
        lat,
        lng,
        address: extractedName || query,
        results: [item],
        items: [item],
        attribution: {
          text: 'Dữ liệu vị trí từ liên kết Google Maps',
          url: 'https://www.google.com/maps'
        }
      });
      return true;
    }

    // Also support direct coordinate strings like "10.7769, 106.7009"
    const rawCoordMatch = query.match(/^\s*(-?\d+\.\d+)\s*[,;\s]\s*(-?\d+\.\d+)\s*$/);
    if (rawCoordMatch) {
      const lat = Number(rawCoordMatch[1]);
      const lng = Number(rawCoordMatch[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        const item = {
          label: `Tọa độ GPS (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat,
          lng,
          source: 'google_maps_link',
          precision: 'coordinates'
        };
        sendJson(res, 200, {
          ok: true,
          source: 'google_maps_link',
          lat,
          lng,
          address: item.address,
          results: [item],
          items: [item]
        });
        return true;
      }
    }

    // 3) Text address search: combine state.livelihoods + HCMC_GAZETTEER + free geocoding API (Photon / Nominatim)
    let searchTerm = query;
    if (isGoogleMapsUrl) {
      try {
        const u = new URL(resolvedUrl);
        searchTerm = u.searchParams.get('q') || u.searchParams.get('query') || query;
      } catch {}
    }

    const qLower = searchTerm.toLowerCase();
    const combinedResults = [];
    const seenKeys = new Set();

    const pushUnique = (entry) => {
      if (!Number.isFinite(entry.lat) || !Number.isFinite(entry.lng)) return;
      const key = `${entry.lat.toFixed(4)}_${entry.lng.toFixed(4)}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      combinedResults.push(entry);
    };

    // Search in state.livelihoods
    if (qLower) {
      const livelihoodItems = Array.isArray(state.livelihoods) && state.livelihoods.length > 0
        ? state.livelihoods
        : Array.from(state.livelihoodsById.values()).map(r => r.item);

      for (const it of livelihoodItems) {
        if (!it) continue;
        const lat = it.manual_lat ?? it.google_lat ?? it.approximate_lat;
        const lng = it.manual_lng ?? it.google_lng ?? it.approximate_lng;
        if (lat == null || lng == null) continue;

        let addr = '';
        if (typeof it.profile_details === 'string') {
          try {
            addr = JSON.parse(it.profile_details).address || '';
          } catch {}
        }
        if (!addr && typeof it.google_maps_details === 'string') {
          try {
            addr = JSON.parse(it.google_maps_details).address || '';
          } catch {}
        }
        const hay = `${it.display_name || ''} ${it.description || ''} ${it.google_maps_name || ''} ${addr}`.toLowerCase();
        if (hay.includes(qLower)) {
          const label = addr ? `${it.display_name} — ${addr}` : `${it.display_name} — ${it.description || ''}`;
          pushUnique({
            label,
            address: addr || it.description || it.display_name,
            lat: Number(lat),
            lng: Number(lng),
            source: 'livelihoods',
            precision: 'place'
          });
        }
      }

      // Search in built-in HCMC_GAZETTEER
      for (const gaz of HCMC_GAZETTEER) {
        if (gaz.label.toLowerCase().includes(qLower)) {
          pushUnique({
            label: gaz.label,
            address: gaz.label,
            lat: gaz.lat,
            lng: gaz.lng,
            source: gaz.source || 'gazetteer',
            precision: gaz.precision || 'address'
          });
        }
      }
    }

    // Query free geocoding APIs (Nominatim & Photon)
    if (searchTerm) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3500);
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&countrycodes=vn&limit=5`;
        const nomRes = await fetch(nomUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'GanhMuuSinhLocal/1.0' }
        });
        clearTimeout(timer);
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData)) {
            for (const row of nomData) {
              const lat = Number(row.lat);
              const lng = Number(row.lon);
              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                pushUnique({
                  label: row.display_name,
                  address: row.display_name,
                  lat,
                  lng,
                  source: 'nominatim',
                  precision: 'address'
                });
              }
            }
          }
        }
      } catch {
        // Nominatim unavailable or timed out
      }

      if (combinedResults.length === 0) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5`;
          const photonRes = await fetch(photonUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'GanhMuuSinhLocal/1.0' }
          });
          clearTimeout(timer);
          if (photonRes.ok) {
            const photonData = await photonRes.json();
            for (const feat of photonData?.features || []) {
              const coords = feat?.geometry?.coordinates;
              if (Array.isArray(coords) && coords.length >= 2) {
                const lng = Number(coords[0]);
                const lat = Number(coords[1]);
                const p = feat.properties || {};
                const label = [p.name, p.housenumber, p.street, p.district, p.city, p.country]
                  .filter(Boolean)
                  .join(', ') || searchTerm;
                pushUnique({
                  label,
                  address: label,
                  lat,
                  lng,
                  source: 'photon',
                  precision: 'address'
                });
              }
            }
          }
        } catch {
          // Photon unavailable
        }
      }
    }

    if (combinedResults.length === 0) {
      const fallbackItem = {
        label: `${query || 'Trung tâm Quận 1'} · TP. Hồ Chí Minh, Việt Nam`,
        address: query || 'TP. Hồ Chí Minh, Việt Nam',
        lat: 10.7769,
        lng: 106.7009,
        source: 'photon',
        precision: 'address'
      };
      combinedResults.push(fallbackItem, ...HCMC_GAZETTEER.slice(0, 3).map(g => ({ ...g, address: g.label })));
    }

    const top = combinedResults[0];
    sendJson(res, 200, {
      ok: true,
      source: top.source || 'nominatim',
      lat: top.lat,
      lng: top.lng,
      address: top.address || top.label,
      results: combinedResults.slice(0, 5),
      items: combinedResults.slice(0, 5),
      attribution: {
        text: 'Dữ liệu địa chỉ © OpenStreetMap contributors',
        url: 'https://www.openstreetmap.org/copyright'
      }
    });
    return true;
  }

  if (pathname === '/api/place-submissions' && req.method === 'POST') {
    const buf = await readBody(req);
    let body = {};
    try {
      body = JSON.parse(buf.toString('utf8'));
    } catch {}

    const id = crypto.randomUUID();
    const submissionId = crypto.randomUUID();
    const slug = `ganh-${id}`;
    const nowSec = Math.floor(Date.now() / 1000);
    const name = (body.display_name || body.name || 'Gánh hàng mới').trim().slice(0, 80);
    const description = (body.description || body.summary || 'Gánh hàng mới được cộng đồng giới thiệu.').trim().slice(0, 500);
    const category = body.category || body.category_slug || inferCategory(name, description);
    const locationMode = body.location_mode === 'address' ? 'address' : 'pin';

    const hasValidLat = body.lat !== null && body.lat !== undefined && body.lat !== '' && Number.isFinite(Number(body.lat));
    const hasValidLng = body.lng !== null && body.lng !== undefined && body.lng !== '' && Number.isFinite(Number(body.lng));

    const lat = hasValidLat ? Number(body.lat) : (locationMode === 'address' ? null : 10.7769);
    const lng = hasValidLng ? Number(body.lng) : (locationMode === 'address' ? null : 106.7009);

    const photoUuid = body.media_id || body.photo_id || crypto.randomUUID();
    const coverKey = `retained/${id}/${photoUuid}`;
    const addressStr = (body.address || body.address_text || description).trim();

    const newItem = {
      id,
      slug,
      display_name: name,
      description,
      age_group: body.age_group || null,
      category,
      status: body.status || 'available',
      location_mode: locationMode,
      approximate_lat: lat,
      approximate_lng: lng,
      location_updated_at: lat != null ? nowSec : null,
      updated_at: nowSec,
      cover_key: coverKey,
      volunteer_count: 1,
      revision: 1,
      google_maps_url:
        body.google_maps_url ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${addressStr}`.trim())}`,
      google_maps_name: body.google_maps_name || null,
      google_maps_details: null,
      google_lat: lat,
      google_lng: lng,
      google_location_observed_at: lat != null ? nowSec : null,
      profile_details: JSON.stringify({
        address: addressStr,
        hours: body.hours_text || body.hours || 'Hằng ngày: 07:00 đến 19:00',
        observed_status: 'Mới cập nhật trên Gánh Mưu Sinh',
        observed_at: nowSec
      }),
      checkin_count: 1,
      last_checkin_at: nowSec,
      manual_lat: lat,
      manual_lng: lng,
      manual_location_source: lat != null ? 'manual_business_pin' : 'address_only',
      latest_checkin: {
        status: body.status || 'available',
        created_at: nowSec,
        submitter_name: state.volunteer.display_name,
        submitter_avatar_url: state.volunteer.avatar_url || '/images/logo-betech.png',
        submitter_level: state.volunteer.level
      }
    };

    const newRecord = {
      item: newItem,
      timeline: [
        {
          id: crypto.randomUUID(),
          status: body.status || 'available',
          caption: description,
          created_at: nowSec,
          public_key: coverKey,
          submitter_name: state.volunteer.display_name,
          submitter_avatar_url: state.volunteer.avatar_url || '/images/logo-betech.png',
          submitter_level: state.volunteer.level
        }
      ],
      album: [
        {
          id: photoUuid,
          public_key: coverKey,
          width: 1200,
          height: 1600
        }
      ],
      creator: {
        display_name: state.volunteer.display_name,
        avatar_url: state.volunteer.avatar_url || '/images/logo-betech.png',
        level: state.volunteer.level
      }
    };

    state.livelihoodsBySlug.set(slug, newRecord);
    state.livelihoodsById.set(id, newRecord);
    state.livelihoods.unshift(newItem);
    state.feedOrder.unshift(slug);
    state.placeDirectory.unshift({
      id,
      slug,
      display_name: name,
      updated_at: nowSec,
      google_maps_name: body.google_maps_name || null,
      address: addressStr,
      lat,
      lng
    });
    state.persistentStore.customPlaces.unshift(newRecord);
    savePersistentStore(state.persistentStore);

    state.summary.public_profiles = state.livelihoods.length;
    state.summary.updated_addresses += 1;
    state.volunteer.place_points = (state.volunteer.place_points || 0) + 10;
    state.volunteer.total_points = (state.volunteer.total_points || 0) + 10;
    state.volunteer.points = (state.volunteer.points || 0) + 10;
    state.volunteer.level = Math.max(1, Math.floor(state.volunteer.total_points / 10) + 1);
    if (state.leaderboard.items[0]) {
      state.leaderboard.items[0].points += 10;
    }

    sendJson(res, 200, {
      ok: true,
      id: submissionId,
      livelihood_id: id,
      slug,
      item: newItem,
      status: 'pending',
      points_awarded: 10,
      volunteer: state.volunteer
    });
    return true;
  }

  if (pathname === '/api/reports' && req.method === 'POST') {
    const buf = await readBody(req);
    let body = {};
    try {
      body = JSON.parse(buf.toString('utf8'));
    } catch {}
    const report = {
      id: crypto.randomUUID(),
      kind: body.kind || 'incorrect',
      reason: body.reason || '',
      livelihood_id: body.livelihood_id || '',
      created_at: Math.floor(Date.now() / 1000)
    };
    state.reports.push(report);
    sendJson(res, 200, { id: report.id, status: 'received', ok: true });
    return true;
  }

  sendJson(res, 404, { error: 'not_found' });
  return true;
}
