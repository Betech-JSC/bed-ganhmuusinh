import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { handleApiAndMedia } from '../src/server/api-handler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function invokeApi(method, urlPath, bodyObj = null, extraHeaders = {}) {
  const payload = bodyObj ? Buffer.from(JSON.stringify(bodyObj), 'utf8') : Buffer.alloc(0);
  const req = Readable.from(payload.length > 0 ? [payload] : []);
  req.method = method;
  req.url = urlPath;
  req.headers = {
    'content-type': 'application/json',
    host: 'localhost:4173',
    ...extraHeaders
  };

  let statusCode = 200;
  const headers = {};
  const chunks = [];

  const res = {
    set statusCode(val) {
      statusCode = val;
    },
    get statusCode() {
      return statusCode;
    },
    setHeader(k, v) {
      headers[k.toLowerCase()] = v;
    },
    writeHead(code, hdrs = {}) {
      statusCode = code;
      for (const [k, v] of Object.entries(hdrs)) {
        headers[k.toLowerCase()] = v;
      }
    },
    end(data) {
      if (data) {
        chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8'));
      }
    }
  };

  await handleApiAndMedia(req, res);
  const rawBuffer = Buffer.concat(chunks);
  const text = rawBuffer.toString('utf8');
  return {
    status: statusCode,
    buffer: rawBuffer,
    headers: {
      get(name) {
        return headers[name.toLowerCase()] || null;
      }
    },
    text: async () => text,
    json: async () => JSON.parse(text)
  };
}

test('Gánh Mưu Sinh × Betech Digital API & Data Integrity Suite', async (t) => {
  await t.test('GET /api/place-directory and GET /api/feed return all 24 real reverse-engineered places', async () => {
    const dirRes = await invokeApi('GET', '/api/place-directory');
    assert.equal(dirRes.status, 200);
    const dirBody = await dirRes.json();
    assert.ok(Array.isArray(dirBody.items));
    assert.ok(dirBody.items.length >= 24, `Expected >= 24 places in place-directory, got ${dirBody.items.length}`);

    const feedRes = await invokeApi('GET', '/api/feed');
    assert.equal(feedRes.status, 200);
    const feedBody = await feedRes.json();
    assert.ok(Array.isArray(feedBody.items));
    assert.ok(feedBody.items.length >= 20, `Expected >= 20 places in feed, got ${feedBody.items.length}`);
    const first = feedBody.items[0];
    assert.ok(first.slug);
    assert.ok(first.display_name);
  });

  await t.test('GET /api/config, /api/me, /api/directory-summary, /api/leaderboard, /api/weather return 200 OK', async () => {
    for (const endpoint of ['/api/config', '/api/me', '/api/directory-summary', '/api/leaderboard', '/api/weather', '/api/feed']) {
      const res = await invokeApi('GET', endpoint);
      assert.equal(res.status, 200, `Endpoint ${endpoint} should return 200`);
      const json = await res.json();
      assert.ok(json, `Endpoint ${endpoint} should return valid JSON`);
    }
  });

  await t.test('GET /api/livelihoods/:slug returns specific place detail with timeline and album', async () => {
    const dirRes = await invokeApi('GET', '/api/place-directory');
    const dirData = await dirRes.json();
    const targetSlug = dirData.items[0].slug;

    const detailRes = await invokeApi('GET', `/api/livelihoods/${encodeURIComponent(targetSlug)}`);
    assert.equal(detailRes.status, 200);
    const detailData = await detailRes.json();
    assert.ok(detailData.item);
    assert.equal(detailData.item.slug, targetSlug);
    assert.ok(Array.isArray(detailData.timeline));
  });

  await t.test('POST /api/checkins creates a verified check-in and increments counter', async () => {
    const dirRes = await invokeApi('GET', '/api/place-directory');
    const dirData = await dirRes.json();
    const targetSlug = dirData.items[0].slug;

    const beforeDetail = await (await invokeApi('GET', `/api/livelihoods/${encodeURIComponent(targetSlug)}`)).json();
    const initialCount = Number(beforeDetail.item.checkin_count || 0);

    const postRes = await invokeApi('POST', '/api/checkins', {
      slug: targetSlug,
      status: 'bought',
      caption: 'Automated test check-in supporting vendor'
    });
    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.points_awarded, 5);

    const afterDetail = await (await invokeApi('GET', `/api/livelihoods/${encodeURIComponent(targetSlug)}`)).json();
    assert.equal(Number(afterDetail.item.checkin_count), initialCount + 1);
  });

  await t.test('POST /api/place-submissions adds a new street vendor to directory', async () => {
    const postRes = await invokeApi('POST', '/api/place-submissions', {
      name: 'Gánh Chè Đậu Xanh Cô Tư Betech',
      category: 'food',
      description: 'Chè đậu xanh nấu củi truyền thống thơm bùi mỗi chiều.',
      address: '1014 Phạm Văn Đồng, Hiệp Bình Chánh, TP. Thủ Đức, TP.HCM',
      lat: 10.8285,
      lng: 106.7215
    });
    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.ok(postData.slug.startsWith('ganh-'));
    assert.equal(postData.points_awarded, 10);
  });

  await t.test('GET /media/* returns image or branded SVG fallback', async () => {
    const res = await invokeApi('GET', '/media/retained/nonexistent-id/sample.svg');
    assert.equal(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('image/svg+xml'));
  });

  await t.test('Betech Digital assets & styling tokens exist on disk', () => {
    assert.ok(fs.existsSync(path.join(rootDir, 'public/images/logo-betech.png')));
    assert.ok(fs.existsSync(path.join(rootDir, 'public/branding/ganh-muu-sinh-banner-language-v2.jpg')));
    const css = fs.readFileSync(path.join(rootDir, 'src/styles/main.css'), 'utf8');
    assert.ok(css.includes('#EF6820'), 'CSS must include Betech primary orange #EF6820');
    assert.ok(css.includes('Be Vietnam Pro'), 'CSS must include Betech display font Be Vietnam Pro');
  });

  await t.test('Test 1: Branding assets & >=25 feed WebP images return 200 OK with RIFF....WEBP magic bytes', async () => {
    for (const rel of ['public/images/logo-betech.png', 'public/branding/ganh-muu-sinh-banner-language-v2.jpg', 'public/icon.svg', 'public/icon-192.png']) {
      const full = path.join(rootDir, rel);
      assert.ok(fs.existsSync(full) && fs.statSync(full).size > 50, `${rel} must exist and be non-empty`);
    }

    const p1 = await (await invokeApi('GET', '/api/feed')).json();
    const p2 = p1.next ? await (await invokeApi('GET', `/api/feed?before=${encodeURIComponent(p1.next)}`)).json() : { items: [] };
    const combined = [...p1.items, ...p2.items].filter(it => Boolean(it.cover_key) && !it.display_name.includes('Cô Tư Betech'));
    assert.ok(combined.length >= 25, `Expected at least 25 feed items with cover_key on pages 1-2, got ${combined.length}`);

    for (const item of combined.slice(0, 30)) {
      const parts = item.cover_key.split('/').filter(Boolean);
      const livelihoodId = parts.length >= 3 ? parts[1] : item.id;
      const mediaId = parts[parts.length - 1];
      const mediaRes = await invokeApi('GET', `/media/${livelihoodId}/${mediaId}/480.webp?brand=1`);
      assert.equal(mediaRes.status, 200);
      assert.equal(mediaRes.headers.get('content-type'), 'image/webp');
      assert.equal(mediaRes.buffer.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(mediaRes.buffer.subarray(8, 12).toString('ascii'), 'WEBP');
    }
  });

  await t.test('Test 2: /api/config map_style_url & /api/feed Google Maps fields', async () => {
    const cfg = await (await invokeApi('GET', '/api/config')).json();
    assert.equal(cfg.map_style_url, 'https://tiles.openfreemap.org/styles/liberty');

    let allItems = [];
    let cursor = null;
    for (let i = 0; i < 12; i++) {
      const res = await (await invokeApi('GET', cursor ? `/api/feed?before=${encodeURIComponent(cursor)}` : '/api/feed')).json();
      allItems.push(...res.items);
      cursor = res.next;
      if (!cursor) break;
    }
    assert.ok(allItems.some(it => Boolean(it.google_maps_url)), 'Should have items with google_maps_url');
    assert.ok(allItems.some(it => Boolean(it.google_maps_name)), 'Should have items with google_maps_name');
    assert.ok(allItems.some(it => Boolean(it.google_maps_details)), 'Should have items with google_maps_details');
  });

  await t.test('Test 3: POST /api/place-location decodes Google Maps links, raw coords, and text addresses', async () => {
    const rAt = await (await invokeApi('POST', '/api/place-location', {
      query: 'https://www.google.com/maps/place/Ch%E1%BB%A3+B%E1%BA%BFn+Th%C3%A0nh/@10.7725138,106.6980208,17z'
    })).json();
    assert.equal(rAt.ok, true);
    assert.equal(rAt.source, 'google_maps_link');
    assert.ok(Math.abs(rAt.lat - 10.7725138) < 1e-5);
    assert.ok(Math.abs(rAt.lng - 106.6980208) < 1e-5);

    const r3d4d = await (await invokeApi('POST', '/api/place-location', {
      query: 'https://www.google.com/maps/place/Ch%E1%BB%A3+B%E1%BA%BFn+Th%C3%A0nh/@10.7700,106.6900,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d10.7725138!4d106.6980208'
    })).json();
    assert.equal(r3d4d.ok, true);
    assert.equal(r3d4d.source, 'google_maps_link');
    assert.ok(Math.abs(r3d4d.lat - 10.7725138) < 1e-5);
    assert.ok(Math.abs(r3d4d.lng - 106.6980208) < 1e-5);

    const rCoord = await (await invokeApi('POST', '/api/place-location', {
      query: '10.7769, 106.7009'
    })).json();
    assert.equal(rCoord.ok, true);
    assert.ok(Math.abs(rCoord.lat - 10.7769) < 1e-5);
    assert.ok(Math.abs(rCoord.lng - 106.7009) < 1e-5);

    const rAddr = await (await invokeApi('POST', '/api/place-location', {
      query: 'Nguyễn Trãi, Hồ Chí Minh'
    })).json();
    assert.equal(rAddr.ok, true);
    assert.ok(Array.isArray(rAddr.results) && rAddr.results.length > 0);
    assert.ok(Number.isFinite(rAddr.results[0].lat) && Number.isFinite(rAddr.results[0].lng));
  });

  await t.test('Test 4: POST /api/place-upload & /api/place-submissions support both pin and address modes', async () => {
    const meBefore = await (await invokeApi('GET', '/api/me')).json();
    const initialPts = meBefore.volunteer.total_points;

    const sampleWebpBase64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const expectedBuf = Buffer.from(sampleWebpBase64, 'base64');
    const upRes = await (await invokeApi('POST', '/api/place-upload', {
      dataUrl: `data:image/webp;base64,${sampleWebpBase64}`
    })).json();
    assert.equal(upRes.ok, true);
    assert.ok(upRes.media_id);

    const pinSub = await (await invokeApi('POST', '/api/place-submissions', {
      display_name: 'Gánh Hàng Pin Mode',
      description: 'Test pin mode',
      address: 'Quận 1, TP.HCM',
      location_mode: 'pin',
      lat: 10.7725,
      lng: 106.6980,
      media_id: upRes.media_id
    })).json();
    assert.equal(pinSub.ok, true);
    assert.equal(pinSub.points_awarded, 10);
    assert.equal(pinSub.volunteer.total_points, initialPts + 10);

    const imgCheck = await invokeApi('GET', `/media/${pinSub.livelihood_id}/${upRes.media_id}/480.webp`);
    assert.equal(imgCheck.status, 200);
    assert.ok(imgCheck.buffer.equals(expectedBuf));

    const addrSub = await (await invokeApi('POST', '/api/place-submissions', {
      display_name: 'Gánh Hàng Address Mode',
      description: 'Test address mode',
      address: 'Đường Nguyễn Trãi, Quận 5, TP.HCM',
      location_mode: 'address',
      lat: null,
      lng: null
    })).json();
    assert.equal(addrSub.ok, true);
    assert.equal(addrSub.item.location_mode, 'address');
    assert.equal(addrSub.item.approximate_lat, null);
    assert.equal(addrSub.item.approximate_lng, null);

    // Clean up temporary test upload file and reset persistent-store.json
    const test4UploadPath = path.join(rootDir, 'public', 'uploads', `${upRes.media_id}.webp`);
    if (fs.existsSync(test4UploadPath)) {
      fs.unlinkSync(test4UploadPath);
    }
    const persistentStorePath = path.join(rootDir, 'src', 'data', 'persistent-store.json');
    const cleanStore = {
      customPlaces: [],
      deletedSlugs: [],
      uploadedFiles: {},
      customCheckins: []
    };
    fs.writeFileSync(persistentStorePath, JSON.stringify(cleanStore, null, 2) + '\n', 'utf8');
  });

  await t.test('Test 5: VPS PHP + MySQL & Nginx Artifacts exist, have valid schema/directives, and pass php -l', () => {
    const requiredFiles = [
      'public/config.php',
      'public/api.php',
      'public/seed-data.json',
      'public/.htaccess',
      'database/schema.sql',
      'nginx.conf.example',
      'dist/config.php',
      'dist/api.php',
      'dist/seed-data.json',
      'dist/.htaccess'
    ];
    for (const rel of requiredFiles) {
      const fullPath = path.join(rootDir, rel);
      assert.ok(fs.existsSync(fullPath) && fs.statSync(fullPath).size > 50, `${rel} must exist and be non-empty`);
    }

    const configPhp = fs.readFileSync(path.join(rootDir, 'public/config.php'), 'utf8');
    assert.ok(configPhp.includes('db_host') && configPhp.includes('admin_password'), 'config.php must define db_host and admin_password');

    const apiPhp = fs.readFileSync(path.join(rootDir, 'public/api.php'), 'utf8');
    const normalizedApiPhp = apiPhp.replace(/`/g, '');
    assert.ok(normalizedApiPhp.includes('CREATE TABLE IF NOT EXISTS livelihoods'), 'api.php must include auto-migration for livelihoods');
    assert.ok(normalizedApiPhp.includes('CREATE TABLE IF NOT EXISTS checkins'), 'api.php must include auto-migration for checkins');
    assert.ok(normalizedApiPhp.includes('CREATE TABLE IF NOT EXISTS media_uploads'), 'api.php must include auto-migration for media_uploads');

    const seedData = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/seed-data.json'), 'utf8'));
    assert.ok(Array.isArray(seedData.livelihoods) && seedData.livelihoods.length >= 24, 'seed-data.json must contain livelihoods array');

    const schemaSql = fs.readFileSync(path.join(rootDir, 'database/schema.sql'), 'utf8').replace(/`/g, '');
    assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS livelihoods'), 'schema.sql must define livelihoods table');
    assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS checkins'), 'schema.sql must define checkins table');
    assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS media_uploads'), 'schema.sql must define media_uploads table');

    const nginxConf = fs.readFileSync(path.join(rootDir, 'nginx.conf.example'), 'utf8');
    assert.ok(nginxConf.includes('fastcgi_pass'), 'nginx.conf.example must include fastcgi_pass');
    assert.ok(nginxConf.includes('client_max_body_size'), 'nginx.conf.example must include client_max_body_size');

    // Run php -l if php CLI is available
    let hasPhp = false;
    try {
      execFileSync('php', ['-v'], { stdio: 'ignore' });
      hasPhp = true;
    } catch {
      hasPhp = false;
    }
    if (hasPhp) {
      const lintConfig = execFileSync('php', ['-l', path.join(rootDir, 'public/config.php')], { encoding: 'utf8' });
      assert.ok(lintConfig.includes('No syntax errors detected'), `php -l public/config.php failed: ${lintConfig}`);
      const lintApi = execFileSync('php', ['-l', path.join(rootDir, 'public/api.php')], { encoding: 'utf8' });
      assert.ok(lintApi.includes('No syntax errors detected'), `php -l public/api.php failed: ${lintApi}`);
    }
  });

  await t.test('Test 6: Persistent Photo Upload on Disk & Admin Auth + Direct Delete', async () => {
    const sampleWebpBase64 = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    const expectedBuf = Buffer.from(sampleWebpBase64, 'base64');

    // 1. POST /api/place-upload -> verify physical file created in public/uploads/<media_id>.webp
    const uploadRes = await invokeApi('POST', '/api/place-upload', {
      dataUrl: `data:image/webp;base64,${sampleWebpBase64}`
    });
    assert.equal(uploadRes.status, 200);
    const uploadData = await uploadRes.json();
    assert.equal(uploadData.ok, true);
    assert.ok(uploadData.media_id);

    const diskUploadPath = path.join(rootDir, 'public', 'uploads', `${uploadData.media_id}.webp`);
    assert.ok(fs.existsSync(diskUploadPath), `Physical file ${diskUploadPath} must exist on disk`);
    assert.ok(fs.readFileSync(diskUploadPath).equals(expectedBuf), 'Physical file content must match uploaded WebP buffer');

    // Also verify GET /uploads/<media_id>.webp serves the uploaded photo from disk
    const serveUploadRes = await invokeApi('GET', `/uploads/${uploadData.media_id}.webp`);
    assert.equal(serveUploadRes.status, 200);
    assert.ok(serveUploadRes.buffer.equals(expectedBuf));

    // 2. Create a new test stall via POST /api/place-submissions with media_id
    const subRes = await invokeApi('POST', '/api/place-submissions', {
      display_name: 'Gánh Hàng Test Admin Xóa Trực Tiếp',
      description: 'Gánh hàng tạo tự động để kiểm thử quyền Admin xóa trực tiếp',
      address: '92A-94 Bạch Đằng, Phường 2, Tân Bình, TP.HCM',
      location_mode: 'pin',
      lat: 10.8132,
      lng: 106.6708,
      media_id: uploadData.media_id
    });
    assert.equal(subRes.status, 200);
    const subData = await subRes.json();
    assert.equal(subData.ok, true);
    const testSlug = subData.slug;
    assert.ok(testSlug && testSlug.startsWith('ganh-'));

    // 3. Call DELETE /api/livelihoods/<slug> WITHOUT Admin token -> must return 403 Forbidden
    const unauthDelRes = await invokeApi('DELETE', `/api/livelihoods/${encodeURIComponent(testSlug)}`);
    assert.equal(unauthDelRes.status, 403);
    const unauthDelBody = await unauthDelRes.json();
    assert.equal(unauthDelBody.error, 'forbidden');

    // 4. Call POST /auth/admin-login with wrong password -> must return 401
    const badLoginRes = await invokeApi('POST', '/auth/admin-login', {
      username: 'admin',
      password: 'WrongPassword123'
    });
    assert.equal(badLoginRes.status, 401);

    // 5. Call POST /auth/admin-login with valid credentials -> must return 200 OK, is_admin: true, admin_token
    const loginRes = await invokeApi('POST', '/auth/admin-login', {
      username: 'admin',
      password: 'Betech@2026'
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.ok, true);
    assert.equal(loginData.is_admin, true);
    assert.ok(loginData.admin_token && loginData.admin_token.includes('.'));

    // Verify GET /api/me with x-admin-token returns is_admin: true
    const meAdminRes = await invokeApi('GET', '/api/me', null, {
      'x-admin-token': loginData.admin_token
    });
    assert.equal(meAdminRes.status, 200);
    const meAdminData = await meAdminRes.json();
    assert.equal(meAdminData.is_admin, true);

    // 6. Call POST /api/livelihoods/<slug>/delete with header 'x-admin-token' -> returns 200 OK, deleted_slug: <slug>
    const adminDelRes = await invokeApi(
      'POST',
      `/api/livelihoods/${encodeURIComponent(testSlug)}/delete`,
      {},
      { 'x-admin-token': loginData.admin_token }
    );
    assert.equal(adminDelRes.status, 200);
    const adminDelData = await adminDelRes.json();
    assert.equal(adminDelData.ok, true);
    assert.equal(adminDelData.deleted_slug, testSlug);

    // Confirm deleted stall returns 404 on GET /api/livelihoods/<slug>
    const afterGetRes = await invokeApi('GET', `/api/livelihoods/${encodeURIComponent(testSlug)}`);
    assert.equal(afterGetRes.status, 404);

    // 7. Clean up temporary test upload file and restore clean state in src/data/persistent-store.json
    if (fs.existsSync(diskUploadPath)) {
      fs.unlinkSync(diskUploadPath);
    }
    const persistentStorePath = path.join(rootDir, 'src', 'data', 'persistent-store.json');
    const cleanStore = {
      customPlaces: [],
      deletedSlugs: [],
      uploadedFiles: {},
      customCheckins: []
    };
    fs.writeFileSync(persistentStorePath, JSON.stringify(cleanStore, null, 2) + '\n', 'utf8');
    const verifyClean = JSON.parse(fs.readFileSync(persistentStorePath, 'utf8'));
    assert.deepEqual(verifyClean, cleanStore);
  });
});


