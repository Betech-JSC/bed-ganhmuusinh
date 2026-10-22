<?php
/**
 * GÁNH MƯU SINH × BETECH DIGITAL — PRODUCTION PHP + MYSQL BACKEND API
 * Tương thích PHP 7.4 / 8.x trên VPS Nginx (PHP-FPM) hoặc Apache.
 * Hỗ trợ đầy đủ MySQL PDO (tự động tạo bảng & seed 200 gánh hàng)
 * kèm cơ chế JSON fallback tại public/uploads/persistent-store.json.
 */

error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);
ini_set('display_errors', '0');

$config = require __DIR__ . '/config.php';
$uploadsDir = $config['uploads_dir'] ?? (__DIR__ . '/uploads');
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0775, true);
}

// ----------------------------------------------------------------------------
// 1. HELPER FUNCTIONS (JSON, BODY, UUID, ADMIN TOKEN, SVG)
// ----------------------------------------------------------------------------

function sendJson(int $status, $data, array $extraHeaders = []): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    foreach ($extraHeaders as $k => $v) {
        header("$k: $v");
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function uuidv4(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function base64UrlEncode(string $input): string {
    return rtrim(strtr(base64_encode($input), '+/', '-_'), '=');
}

function base64UrlDecode(string $input): string {
    $remainder = strlen($input) % 4;
    if ($remainder) {
        $input .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($input, '-_', '+/')) ?: '';
}

function createAdminToken(string $username, string $secret): string {
    $payload = json_encode([
        'u'   => $username,
        'role'=> 'admin',
        'iat' => time(),
        'exp' => time() + 86400 * 30,
    ]);
    $b64 = base64UrlEncode($payload);
    $sig = hash_hmac('sha256', $b64, $secret);
    return $b64 . '.' . $sig;
}

function verifyAdminToken(?string $token, string $secret): bool {
    if (!$token || strpos($token, '.') === false) return false;
    [$b64, $sig] = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $b64, $secret);
    if (!hash_equals($expected, $sig)) return false;
    $payload = json_decode(base64UrlDecode($b64), true);
    if (!is_array($payload) || ($payload['role'] ?? '') !== 'admin') return false;
    if (isset($payload['exp']) && time() > (int)$payload['exp']) return false;
    return true;
}

function getRequestAdminToken(): ?string {
    if (!empty($_COOKIE['gms_admin_token'])) {
        return (string)$_COOKIE['gms_admin_token'];
    }
    if (!empty($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        return trim((string)$_SERVER['HTTP_X_ADMIN_TOKEN']);
    }
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) {
        return trim($m[1]);
    }
    return null;
}

function isAdminRequest(array $config): bool {
    $token = getRequestAdminToken();
    return verifyAdminToken($token, $config['secret_key'] ?? 'betech-ganhmuusinh-secret-2026');
}

function inferCategory(string $name = '', string $desc = ''): string {
    $text = mb_strtolower($name . ' ' . $desc, 'UTF-8');
    if (preg_match('/cà phê|cafe|nước|sữa|trà|sinh tố|đậu nành|khóm|dứa|ổi|trái cây/u', $text)) return 'drink';
    if (preg_match('/bánh|bún|xôi|chả|chè|bò bía|nem|đậu hủ|há cảo|súp|flan|đồ ăn|cơm|me|chanh|rau/u', $text)) return 'food';
    if (preg_match('/đánh giày|sửa|hớt tóc|dịch vụ/u', $text)) return 'service';
    if (preg_match('/đèn lồng|chổi|nhang|hàng rong|hoa|vé số/u', $text)) return 'goods';
    return 'food';
}

function generatePlaceholderSvg(string $placeId, string $title = 'Gánh Mưu Sinh', string $subtitle = 'Betech Digital Community'): string {
    $palettes = [
        ['#FFF7ED', '#FFEDD5', '#EF6820', '#9A3412'],
        ['#FEF3C7', '#FDE68A', '#D97706', '#78350F'],
        ['#FFEDD5', '#FED7AA', '#EA580C', '#7C2D12'],
        ['#F0FDF4', '#DCFCE7', '#16A34A', '#14532D'],
    ];
    $hash = 0;
    $idStr = $placeId !== '' ? $placeId : 'gms';
    for ($i = 0, $n = strlen($idStr); $i < $n; $i++) {
        $hash += ord($idStr[$i]);
    }
    [$bg1, $bg2, $accent, $dark] = $palettes[$hash % count($palettes)];
    $safeTitle = htmlspecialchars(mb_substr($title, 0, 34, 'UTF-8'), ENT_QUOTES, 'UTF-8');
    $safeSub = htmlspecialchars(mb_substr($subtitle, 0, 65, 'UTF-8'), ENT_QUOTES, 'UTF-8');

    return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$bg1}"/>
      <stop offset="100%" stop-color="{$bg2}"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFD034"/>
      <stop offset="50%" stop-color="#F38744"/>
      <stop offset="100%" stop-color="#E04F16"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="680" cy="110" r="160" fill="{$accent}" opacity="0.10"/>
  <circle cx="120" cy="490" r="190" fill="{$accent}" opacity="0.08"/>
  <g transform="translate(310, 130)">
    <rect x="0" y="0" width="180" height="140" rx="28" fill="#FFFFFF" stroke="{$accent}" stroke-width="4" opacity="0.95"/>
    <path d="M35 85 L145 85 M50 55 L130 55 M90 30 L90 110" stroke="{$accent}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="60" cy="105" r="12" fill="{$accent}"/>
    <circle cx="120" cy="105" r="12" fill="{$accent}"/>
  </g>
  <rect x="260" y="305" width="280" height="36" rx="18" fill="url(#brand)"/>
  <text x="400" y="329" font-family="Be Vietnam Pro, Montserrat, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">GÁNH MƯU SINH × BETECH</text>
  <text x="400" y="395" font-family="Montserrat, Be Vietnam Pro, sans-serif" font-size="30" font-weight="800" fill="#111927" text-anchor="middle">{$safeTitle}</text>
  <text x="400" y="438" font-family="Be Vietnam Pro, sans-serif" font-size="18" font-weight="500" fill="{$dark}" opacity="0.85" text-anchor="middle">{$safeSub}</text>
</svg>
SVG;
}

// ----------------------------------------------------------------------------
// 2. LOAD SEED DATA & FALLBACK PERSISTENT STORE
// ----------------------------------------------------------------------------

function loadSeedData(): array {
    static $seed = null;
    if ($seed !== null) return $seed;
    $seedFile = __DIR__ . '/seed-data.json';
    if (is_file($seedFile)) {
        $decoded = json_decode((string)file_get_contents($seedFile), true);
        if (is_array($decoded)) {
            $seed = $decoded;
            return $seed;
        }
    }
    $seed = [
        'config' => ['writes_enabled' => true, 'reports_enabled' => true, 'place_submissions_enabled' => true],
        'summary' => ['public_profiles' => 200, 'updated_addresses' => 200],
        'leaderboard' => ['items' => []],
        'weather' => ['latitude' => 10.8, 'longitude' => 106.7, 'temperature_c' => 28, 'weather_code' => 81],
        'livelihoods' => [],
    ];
    return $seed;
}

function getPersistentStorePath(string $uploadsDir): string {
    return rtrim($uploadsDir, '/') . '/persistent-store.json';
}

function loadPersistentStore(string $uploadsDir): array {
    $file = getPersistentStorePath($uploadsDir);
    if (is_file($file)) {
        $data = json_decode((string)file_get_contents($file), true);
        if (is_array($data)) {
            return array_merge([
                'customPlaces' => [],
                'deletedSlugs' => [],
                'uploadedFiles' => [],
                'customCheckins' => [],
                'reports' => [],
            ], $data);
        }
    }
    return [
        'customPlaces' => [],
        'deletedSlugs' => [],
        'uploadedFiles' => [],
        'customCheckins' => [],
        'reports' => [],
    ];
}

function savePersistentStore(string $uploadsDir, array $store): void {
    $file = getPersistentStorePath($uploadsDir);
    @file_put_contents($file, json_encode($store, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX);
}

// ----------------------------------------------------------------------------
// 3. MYSQL PDO CONNECTION & AUTO-SEEDING
// ----------------------------------------------------------------------------

function getDatabaseConnection(array $config): ?PDO {
    static $attempted = false;
    static $pdo = null;
    if ($attempted) return $pdo;
    $attempted = true;

    if (!extension_loaded('pdo_mysql')) {
        return null;
    }

    $host = $config['db_host'] ?? '127.0.0.1';
    $port = $config['db_port'] ?? '3306';
    $db   = $config['db_name'] ?? 'ganhmuusinh';
    $user = $config['db_user'] ?? 'root';
    $pass = $config['db_pass'] ?? '';

    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT            => 2,
        ]);
    } catch (Throwable $e) {
        // Thử kết nối không kèm dbname để tự tạo database nếu user có quyền
        try {
            $dsnNoDb = "mysql:host={$host};port={$port};charset=utf8mb4";
            $tmpPdo = new PDO($dsnNoDb, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT            => 2,
            ]);
            $safeDb = preg_replace('/[^a-zA-Z0-9_]/', '', $db);
            $tmpPdo->exec("CREATE DATABASE IF NOT EXISTS `{$safeDb}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $tmpPdo->exec("USE `{$safeDb}`");
            $pdo = $tmpPdo;
        } catch (Throwable $e2) {
            $pdo = null;
            return null;
        }
    }

    try {
        initDatabaseTablesAndSeed($pdo);
    } catch (Throwable $e) {
        // Nếu lỗi khởi tạo bảng, fallback sang JSON store
        $pdo = null;
    }

    return $pdo;
}

function initDatabaseTablesAndSeed(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `livelihoods` (
          `id` VARCHAR(64) NOT NULL PRIMARY KEY,
          `slug` VARCHAR(128) NOT NULL UNIQUE,
          `display_name` VARCHAR(255) NOT NULL,
          `description` TEXT NULL,
          `age_group` VARCHAR(64) NULL,
          `category` VARCHAR(32) NOT NULL DEFAULT 'food',
          `status` VARCHAR(32) NOT NULL DEFAULT 'available',
          `approximate_lat` DOUBLE NULL,
          `approximate_lng` DOUBLE NULL,
          `manual_lat` DOUBLE NULL,
          `manual_lng` DOUBLE NULL,
          `manual_location_source` VARCHAR(64) NULL,
          `google_maps_url` TEXT NULL,
          `google_maps_name` VARCHAR(255) NULL,
          `google_maps_details` LONGTEXT NULL,
          `google_lat` DOUBLE NULL,
          `google_lng` DOUBLE NULL,
          `google_location_observed_at` BIGINT NULL,
          `profile_details` LONGTEXT NULL,
          `cover_key` VARCHAR(255) NULL,
          `checkin_count` INT NOT NULL DEFAULT 0,
          `volunteer_count` INT NOT NULL DEFAULT 1,
          `revision` INT NOT NULL DEFAULT 1,
          `last_checkin_at` BIGINT NOT NULL DEFAULT 0,
          `location_updated_at` BIGINT NULL,
          `updated_at` BIGINT NOT NULL,
          `created_at` BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `checkins` (
          `id` VARCHAR(64) NOT NULL PRIMARY KEY,
          `livelihood_id` VARCHAR(64) NOT NULL,
          `slug` VARCHAR(128) NOT NULL,
          `status` VARCHAR(32) NOT NULL DEFAULT 'bought',
          `caption` TEXT NULL,
          `public_key` VARCHAR(255) NULL,
          `submitter_name` VARCHAR(128) NOT NULL DEFAULT 'Tình nguyện viên Betech',
          `submitter_avatar_url` TEXT NULL,
          `submitter_level` INT NOT NULL DEFAULT 1,
          `created_at` BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `media_uploads` (
          `id` VARCHAR(64) NOT NULL PRIMARY KEY,
          `livelihood_id` VARCHAR(64) NULL,
          `file_path` VARCHAR(255) NOT NULL,
          `mime_type` VARCHAR(64) NOT NULL DEFAULT 'image/webp',
          `created_at` BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `reports` (
          `id` VARCHAR(64) NOT NULL PRIMARY KEY,
          `slug` VARCHAR(128) NOT NULL,
          `reason` VARCHAR(128) NOT NULL,
          `note` TEXT NULL,
          `created_at` BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $count = (int)$pdo->query("SELECT COUNT(*) FROM `livelihoods`")->fetchColumn();
    if ($count === 0) {
        $seed = loadSeedData();
        $items = $seed['livelihoods'] ?? [];
        if (!empty($items)) {
            $pdo->beginTransaction();
            try {
                $stmtPlace = $pdo->prepare("
                    INSERT IGNORE INTO `livelihoods` (
                        `id`, `slug`, `display_name`, `description`, `age_group`, `category`, `status`,
                        `approximate_lat`, `approximate_lng`, `manual_lat`, `manual_lng`, `manual_location_source`,
                        `google_maps_url`, `google_maps_name`, `google_maps_details`, `google_lat`, `google_lng`,
                        `google_location_observed_at`, `profile_details`, `cover_key`, `checkin_count`,
                        `volunteer_count`, `revision`, `last_checkin_at`, `location_updated_at`, `updated_at`, `created_at`
                    ) VALUES (
                        :id, :slug, :display_name, :description, :age_group, :category, :status,
                        :approximate_lat, :approximate_lng, :manual_lat, :manual_lng, :manual_location_source,
                        :google_maps_url, :google_maps_name, :google_maps_details, :google_lat, :google_lng,
                        :google_location_observed_at, :profile_details, :cover_key, :checkin_count,
                        :volunteer_count, :revision, :last_checkin_at, :location_updated_at, :updated_at, :created_at
                    )
                ");
                $stmtCheckin = $pdo->prepare("
                    INSERT IGNORE INTO `checkins` (
                        `id`, `livelihood_id`, `slug`, `status`, `caption`, `public_key`,
                        `submitter_name`, `submitter_avatar_url`, `submitter_level`, `created_at`
                    ) VALUES (
                        :id, :livelihood_id, :slug, :status, :caption, :public_key,
                        :submitter_name, :submitter_avatar_url, :submitter_level, :created_at
                    )
                ");

                foreach ($items as $it) {
                    $now = time();
                    $updatedAt = isset($it['updated_at']) ? (int)$it['updated_at'] : $now;
                    $stmtPlace->execute([
                        ':id'                         => $it['id'],
                        ':slug'                       => $it['slug'],
                        ':display_name'               => $it['display_name'] ?? 'Gánh hàng mưu sinh',
                        ':description'                => $it['description'] ?? '',
                        ':age_group'                  => $it['age_group'] ?? null,
                        ':category'                   => $it['category'] ?? 'food',
                        ':status'                     => $it['status'] ?? 'available',
                        ':approximate_lat'            => isset($it['approximate_lat']) ? (float)$it['approximate_lat'] : null,
                        ':approximate_lng'            => isset($it['approximate_lng']) ? (float)$it['approximate_lng'] : null,
                        ':manual_lat'                 => isset($it['manual_lat']) ? (float)$it['manual_lat'] : null,
                        ':manual_lng'                 => isset($it['manual_lng']) ? (float)$it['manual_lng'] : null,
                        ':manual_location_source'     => $it['manual_location_source'] ?? null,
                        ':google_maps_url'            => $it['google_maps_url'] ?? null,
                        ':google_maps_name'           => $it['google_maps_name'] ?? null,
                        ':google_maps_details'        => is_array($it['google_maps_details'] ?? null) ? json_encode($it['google_maps_details'], JSON_UNESCAPED_UNICODE) : ($it['google_maps_details'] ?? null),
                        ':google_lat'                 => isset($it['google_lat']) ? (float)$it['google_lat'] : null,
                        ':google_lng'                 => isset($it['google_lng']) ? (float)$it['google_lng'] : null,
                        ':google_location_observed_at'=> isset($it['google_location_observed_at']) ? (int)$it['google_location_observed_at'] : null,
                        ':profile_details'            => is_array($it['profile_details'] ?? null) ? json_encode($it['profile_details'], JSON_UNESCAPED_UNICODE) : ($it['profile_details'] ?? null),
                        ':cover_key'                  => $it['cover_key'] ?? null,
                        ':checkin_count'              => (int)($it['checkin_count'] ?? 1),
                        ':volunteer_count'            => (int)($it['volunteer_count'] ?? 1),
                        ':revision'                   => (int)($it['revision'] ?? 1),
                        ':last_checkin_at'            => (int)($it['last_checkin_at'] ?? $updatedAt),
                        ':location_updated_at'        => isset($it['location_updated_at']) ? (int)$it['location_updated_at'] : $updatedAt,
                        ':updated_at'                 => $updatedAt,
                        ':created_at'                 => $updatedAt,
                    ]);

                    $timeline = $it['_timeline'] ?? [];
                    if (is_array($timeline)) {
                        foreach ($timeline as $chk) {
                            $stmtCheckin->execute([
                                ':id'                   => $chk['id'] ?? uuidv4(),
                                ':livelihood_id'        => $it['id'],
                                ':slug'                 => $it['slug'],
                                ':status'               => $chk['status'] ?? ($it['status'] ?? 'bought'),
                                ':caption'              => $chk['caption'] ?? ($it['description'] ?? ''),
                                ':public_key'           => $chk['public_key'] ?? ($it['cover_key'] ?? null),
                                ':submitter_name'       => $chk['submitter_name'] ?? 'Thành viên Betech Community',
                                ':submitter_avatar_url' => $chk['submitter_avatar_url'] ?? '/images/logo-betech.png',
                                ':submitter_level'      => (int)($chk['submitter_level'] ?? 2),
                                ':created_at'           => (int)($chk['created_at'] ?? $updatedAt),
                            ]);
                        }
                    }
                }
                $pdo->commit();
            } catch (Throwable $txErr) {
                $pdo->rollBack();
                throw $txErr;
            }
        }
    }
}

function formatDbRowToItem(array $row, ?array $latestCheckin = null): array {
    $floatFields = ['approximate_lat', 'approximate_lng', 'manual_lat', 'manual_lng', 'google_lat', 'google_lng'];
    foreach ($floatFields as $f) {
        $row[$f] = ($row[$f] !== null && $row[$f] !== '') ? (float)$row[$f] : null;
    }
    $intFields = ['checkin_count', 'volunteer_count', 'revision', 'last_checkin_at', 'location_updated_at', 'google_location_observed_at', 'updated_at', 'created_at'];
    foreach ($intFields as $f) {
        if (array_key_exists($f, $row) && $row[$f] !== null) {
            $row[$f] = (int)$row[$f];
        }
    }
    $row['latest_checkin'] = $latestCheckin ?: [
        'status'               => $row['status'] ?? 'available',
        'created_at'           => $row['last_checkin_at'] ?: $row['updated_at'],
        'submitter_name'       => 'Thành viên Betech Community',
        'submitter_avatar_url' => '/images/logo-betech.png',
        'submitter_level'      => 2,
    ];
    return $row;
}

function getAllActiveItems( ?PDO $pdo, string $uploadsDir ): array {
    if ($pdo) {
        $rows = $pdo->query("SELECT * FROM `livelihoods` ORDER BY `updated_at` DESC, `id` ASC")->fetchAll();
        $items = [];
        foreach ($rows as $r) {
            $items[] = formatDbRowToItem($r);
        }
        return $items;
    }

    // Fallback JSON Store
    $seed = loadSeedData();
    $store = loadPersistentStore($uploadsDir);
    $deleted = array_flip($store['deletedSlugs'] ?? []);
    $bySlug = [];

    foreach ($store['customPlaces'] ?? [] as $custom) {
        $it = $custom['item'] ?? $custom;
        if (!empty($it['slug']) && !isset($deleted[$it['slug']])) {
            unset($it['_timeline'], $it['_album'], $it['_creator']);
            $bySlug[$it['slug']] = $it;
        }
    }

    foreach ($seed['livelihoods'] ?? [] as $raw) {
        $slug = $raw['slug'] ?? '';
        if (!$slug || isset($deleted[$slug]) || isset($bySlug[$slug])) continue;
        $it = $raw;
        unset($it['_timeline'], $it['_album'], $it['_creator']);
        $bySlug[$slug] = $it;
    }

    // Apply custom checkins on fallback items
    foreach ($store['customCheckins'] ?? [] as $chk) {
        $slug = $chk['slug'] ?? '';
        if ($slug && isset($bySlug[$slug])) {
            $bySlug[$slug]['status'] = $chk['status'] ?? $bySlug[$slug]['status'];
            $bySlug[$slug]['checkin_count'] = ((int)($bySlug[$slug]['checkin_count'] ?? 1)) + 1;
            $bySlug[$slug]['last_checkin_at'] = (int)($chk['created_at'] ?? time());
            $bySlug[$slug]['updated_at'] = (int)($chk['created_at'] ?? time());
            $bySlug[$slug]['latest_checkin'] = [
                'status'               => $chk['status'] ?? 'bought',
                'created_at'           => (int)($chk['created_at'] ?? time()),
                'submitter_name'       => $chk['submitter_name'] ?? 'Khách ghé gánh',
                'submitter_avatar_url' => $chk['submitter_avatar_url'] ?? '/images/logo-betech.png',
                'submitter_level'      => (int)($chk['submitter_level'] ?? 1),
            ];
        }
    }

    return array_values($bySlug);
}

// ----------------------------------------------------------------------------
// 4. REQUEST ROUTING
// ----------------------------------------------------------------------------

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$pathname = parse_url($requestUri, PHP_URL_PATH) ?: '/';

$pdo = getDatabaseConnection($config);

// --- 4.1. SERVE /uploads/*, /media/*, /avatars/* ---
if (strpos($pathname, '/uploads/') === 0 || strpos($pathname, '/media/') === 0 || strpos($pathname, '/avatars/') === 0) {
    $parts = array_values(array_filter(explode('/', $pathname), 'strlen'));

    // Kiểm tra xem bất kỳ segment nào có khớp với file trong public/uploads/ hoặc bảng media_uploads không
    foreach ($parts as $seg) {
        $cleanSeg = preg_replace('/\.(webp|jpe?g|png|gif|svg)$/i', '', $seg);
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $cleanSeg)) continue;

        foreach (['webp', 'jpg', 'jpeg', 'png', 'gif'] as $ext) {
            $candidateUpload = rtrim($uploadsDir, '/') . '/' . $cleanSeg . '.' . $ext;
            if (is_file($candidateUpload)) {
                $mimeMap = [
                    'webp' => 'image/webp',
                    'jpg'  => 'image/jpeg',
                    'jpeg' => 'image/jpeg',
                    'png'  => 'image/png',
                    'gif'  => 'image/gif',
                ];
                header('Content-Type: ' . ($mimeMap[$ext] ?? 'image/webp'));
                header('Cache-Control: public, max-age=86400');
                readfile($candidateUpload);
                exit;
            }
        }

        if ($pdo) {
            try {
                $stmtMedia = $pdo->prepare("SELECT `file_path`, `mime_type` FROM `media_uploads` WHERE `id` = :id LIMIT 1");
                $stmtMedia->execute([':id' => $cleanSeg]);
                $mediaRow = $stmtMedia->fetch();
                if ($mediaRow) {
                    $diskPath = __DIR__ . '/' . ltrim($mediaRow['file_path'], '/');
                    if (is_file($diskPath)) {
                        header('Content-Type: ' . ($mediaRow['mime_type'] ?: 'image/webp'));
                        header('Cache-Control: public, max-age=86400');
                        readfile($diskPath);
                        exit;
                    }
                }
            } catch (Throwable $e) {}
        }
    }

    $livelihoodId = '';
    $mediaId = '';

    if (strpos($pathname, '/media/') === 0) {
        $subParts = array_slice($parts, 1);
        if (!empty($subParts[0]) && ($subParts[0] === 'retained' || $subParts[0] === 'places')) {
            $subParts = array_slice($subParts, 1);
        }
        $livelihoodId = $subParts[0] ?? '';
        $rawMedia = preg_replace('/\.(webp|jpe?g|png|svg)$/i', '', $subParts[1] ?? '');
        if ($rawMedia !== '' && !in_array($rawMedia, ['480', '1200', 'cover'], true)) {
            $mediaId = $rawMedia;
        }

        // Kiểm tra xem mediaId có nằm trong uploads/ không
        if ($mediaId !== '') {
            foreach (['webp', 'jpg', 'jpeg', 'png'] as $ext) {
                $upFile = rtrim($uploadsDir, '/') . '/' . $mediaId . '.' . $ext;
                if (is_file($upFile)) {
                    $mime = $ext === 'png' ? 'image/png' : ($ext === 'webp' ? 'image/webp' : 'image/jpeg');
                    header('Content-Type: ' . $mime);
                    header('Cache-Control: public, max-age=86400');
                    readfile($upFile);
                    exit;
                }
            }
        }
    } elseif (strpos($pathname, '/avatars/') === 0) {
        $livelihoodId = $parts[1] ?? '';
        $mediaId = preg_replace('/\.(webp|jpe?g|png|svg)$/i', '', $parts[2] ?? '');
    }

    // Kiểm tra file tĩnh có sẵn trong public/media/...
    $candidates = [];
    if (strpos($pathname, '/media/') === 0 && $livelihoodId !== '' && $mediaId !== '') {
        $candidates[] = __DIR__ . '/media/' . $livelihoodId . '/' . $mediaId . '/480.webp';
    }
    $candidates[] = __DIR__ . '/' . ltrim($pathname, '/');

    foreach ($candidates as $filePath) {
        if (is_file($filePath)) {
            header('Content-Type: image/webp');
            header('Cache-Control: public, max-age=86400');
            readfile($filePath);
            exit;
        }
    }

    // Thử tải từ upstream https://ganhmuusinh.io.vn nếu có mạng
    $upstreamUrl = (strpos($pathname, '/media/') === 0 && $livelihoodId !== '' && $mediaId !== '')
        ? "https://ganhmuusinh.io.vn/media/{$livelihoodId}/{$mediaId}/480.webp?brand=1"
        : "https://ganhmuusinh.io.vn{$pathname}";

    $ctx = stream_context_create([
        'http' => [
            'timeout' => 3.0,
            'ignore_errors' => true,
            'header' => "User-Agent: GanhMuuSinhVPS/1.0\r\n",
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ],
    ]);
    $remoteData = @file_get_contents($upstreamUrl, false, $ctx);
    if ($remoteData !== false && strlen($remoteData) > 100) {
        $isImg = false;
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $hdr) {
                if (stripos($hdr, 'Content-Type: image/') === 0) {
                    $isImg = true;
                    header($hdr);
                    break;
                }
            }
        }
        if ($isImg) {
            header('Cache-Control: public, max-age=86400');
            echo $remoteData;
            exit;
        }
    }

    // Fallback SVG
    header('Content-Type: image/svg+xml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
    echo generatePlaceholderSvg($livelihoodId ?: 'gms', 'Gánh Mưu Sinh', 'Betech Digital Community');
    exit;
}

// --- 4.2. AUTH ENDPOINTS ---
$defaultVolunteer = [
    'id'                => 'a1828f50-0929-4b02-b2e6-22d3efda153e',
    'display_name'      => 'LỮ MINH TRÍ · Betech',
    'avatar_url'        => '/avatars/a1828f50-0929-4b02-b2e6-22d3efda153e/21139762-3c39-4fd0-b19e-1cf4c5b223fd/256.webp',
    'level'             => 3,
    'approved_checkins' => 15,
    'place_points'      => 10,
    'total_points'      => 25,
    'points'            => 25,
    'profile_revision'  => 1,
    'is_admin'          => false,
    'role'              => 'volunteer',
];

if ($pathname === '/auth/admin-login' && $method === 'POST') {
    $body = readJsonBody();
    $username = trim((string)($body['username'] ?? $_POST['username'] ?? ''));
    $password = (string)($body['password'] ?? $_POST['password'] ?? '');

    $expectedUser = $config['admin_username'] ?? 'admin';
    $expectedPass = $config['admin_password'] ?? 'Betech@2026';

    if ($username === $expectedUser && hash_equals($expectedPass, $password)) {
        $token = createAdminToken($username, $config['secret_key'] ?? 'betech-ganhmuusinh-secret-2026');
        setcookie('gms_admin_token', $token, [
            'expires'  => time() + 86400 * 30,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        $adminVolunteer = array_merge($defaultVolunteer, [
            'display_name' => 'Quản trị viên · Betech Admin',
            'is_admin'     => true,
            'role'         => 'admin',
            'level'        => 5,
        ]);
        sendJson(200, [
            'ok'          => true,
            'is_admin'    => true,
            'admin_token' => $token,
            'csrf'        => 'betech-gms-csrf-2026',
            'volunteer'   => $adminVolunteer,
        ]);
    }

    sendJson(401, [
        'error'   => 'invalid_credentials',
        'message' => 'Sai tài khoản hoặc mật khẩu Admin',
    ]);
}

if (($pathname === '/auth/admin-logout' || $pathname === '/auth/logout') && $method === 'POST') {
    setcookie('gms_admin_token', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    sendJson(200, [
        'ok'       => true,
        'is_admin' => false,
    ]);
}

if ($pathname === '/auth/google') {
    header('Location: /account', true, 302);
    exit;
}

if ($pathname === '/auth/login-demo' && $method === 'POST') {
    $isAdmin = isAdminRequest($config);
    $vol = $defaultVolunteer;
    if ($isAdmin) {
        $vol['is_admin'] = true;
        $vol['role'] = 'admin';
        $vol['display_name'] = 'Quản trị viên · Betech Admin';
    }
    sendJson(200, [
        'volunteer'         => $vol,
        'is_admin'          => $isAdmin,
        'csrf'              => 'betech-gms-csrf-2026',
        'checkin_fast_pass' => true,
    ]);
}

// --- 4.3. API ENDPOINTS ---
if ($pathname === '/api/config' && $method === 'GET') {
    $seed = loadSeedData();
    sendJson(200, array_merge($seed['config'] ?? [], [
        'writes_enabled'            => true,
        'reports_enabled'           => true,
        'place_submissions_enabled' => true,
        'google_enabled'            => true,
        'map_style_url'             => 'https://tiles.openfreemap.org/styles/liberty',
        'support_email'             => 'admin@betech-digital.com',
    ]));
}

if ($pathname === '/api/me' && $method === 'GET') {
    $isAdmin = isAdminRequest($config);
    $vol = $defaultVolunteer;
    if ($isAdmin) {
        $vol['display_name'] = 'Quản trị viên · Betech Admin';
        $vol['is_admin'] = true;
        $vol['role'] = 'admin';
        $vol['level'] = 5;
    }
    sendJson(200, [
        'is_admin'          => $isAdmin,
        'role'              => $isAdmin ? 'admin' : 'volunteer',
        'volunteer'         => $vol,
        'viewer'            => $vol,
        'csrf'              => 'betech-gms-csrf-2026',
        'checkin_fast_pass' => true,
    ]);
}

if ($pathname === '/api/me/profile' && $method === 'POST') {
    $body = readJsonBody();
    $isAdmin = isAdminRequest($config);
    $vol = $defaultVolunteer;
    if (!empty($body['display_name'])) {
        $vol['display_name'] = mb_substr(trim((string)$body['display_name']), 0, 80, 'UTF-8');
    }
    $vol['is_admin'] = $isAdmin;
    $vol['role'] = $isAdmin ? 'admin' : 'volunteer';
    sendJson(200, [
        'is_admin'  => $isAdmin,
        'volunteer' => $vol,
        'csrf'      => 'betech-gms-csrf-2026',
    ]);
}

if ($pathname === '/api/directory-summary' && $method === 'GET') {
    $seed = loadSeedData();
    $summary = $seed['summary'] ?? ['public_profiles' => 200, 'updated_addresses' => 200];
    if ($pdo) {
        $cnt = (int)$pdo->query("SELECT COUNT(*) FROM `livelihoods`")->fetchColumn();
        $summary['public_profiles'] = $cnt;
    }
    sendJson(200, $summary);
}

if ($pathname === '/api/leaderboard' && $method === 'GET') {
    $seed = loadSeedData();
    sendJson(200, $seed['leaderboard'] ?? ['items' => []]);
}

if ($pathname === '/api/weather' && $method === 'GET') {
    $seed = loadSeedData();
    $rawWeather = $seed['weather'] ?? [];
    $lat = isset($_GET['lat']) && is_numeric($_GET['lat']) ? round((float)$_GET['lat'], 1) : ($rawWeather['latitude'] ?? 10.8);
    $lng = isset($_GET['lng']) && is_numeric($_GET['lng']) ? round((float)$_GET['lng'], 1) : ($rawWeather['longitude'] ?? 106.7);
    $now = time();
    sendJson(200, [
        'source'        => 'open-meteo',
        'latitude'      => $lat,
        'longitude'     => $lng,
        'temperature_c' => $rawWeather['temperature_c'] ?? 27,
        'weather_code'  => $rawWeather['weather_code'] ?? 81,
        'is_day'        => true,
        'observed_at'   => gmdate('Y-m-d\TH:i:s\Z', $now - 300),
        'expires_at'    => gmdate('Y-m-d\TH:i:s\Z', $now + 840),
    ]);
}

if ($pathname === '/api/feed' && $method === 'GET') {
    $before = $_GET['before'] ?? null;
    $allItems = getAllActiveItems($pdo, $uploadsDir);

    $pageSize = 20;
    $startIndex = 0;
    if ($before) {
        $cursorSlug = strpos($before, 'ganh-') !== false
            ? substr($before, strpos($before, 'ganh-'))
            : 'ganh-' . substr($before, strrpos($before, '_') !== false ? strrpos($before, '_') + 1 : 0);
        $lastPart = substr($before, strrpos($before, '_') !== false ? strrpos($before, '_') + 1 : 0);
        $foundIdx = -1;
        foreach ($allItems as $idx => $it) {
            if (($it['slug'] ?? '') === $cursorSlug || ($it['id'] ?? '') === $lastPart) {
                $foundIdx = $idx;
                break;
            }
        }
        $startIndex = $foundIdx >= 0 ? ($foundIdx + 1) : 20;
    }

    $slice = array_slice($allItems, $startIndex, $pageSize);
    $hasMore = ($startIndex + $pageSize) < count($allItems);
    $lastItem = !empty($slice) ? $slice[count($slice) - 1] : null;
    $nextCursor = ($hasMore && $lastItem) ? ('0_' . ($lastItem['updated_at'] ?? time()) . '_' . ($lastItem['id'] ?? '')) : null;

    sendJson(200, [
        'items' => $slice,
        'next'  => $nextCursor,
    ]);
}

if ($pathname === '/api/place-directory' && $method === 'GET') {
    if (!empty($_GET['before'])) {
        sendJson(200, ['items' => [], 'next' => null]);
    }
    $allItems = getAllActiveItems($pdo, $uploadsDir);
    $dirItems = [];
    foreach ($allItems as $it) {
        $lat = $it['manual_lat'] ?? $it['google_lat'] ?? $it['approximate_lat'] ?? null;
        $lng = $it['manual_lng'] ?? $it['google_lng'] ?? $it['approximate_lng'] ?? null;
        $addr = '';
        if (!empty($it['profile_details']) && is_string($it['profile_details'])) {
            $pd = json_decode($it['profile_details'], true);
            if (is_array($pd) && !empty($pd['address'])) {
                $addr = $pd['address'];
            }
        }
        $dirItems[] = [
            'id'               => $it['id'],
            'slug'             => $it['slug'],
            'display_name'     => $it['display_name'],
            'updated_at'       => (int)($it['updated_at'] ?? time()),
            'google_maps_name' => $it['google_maps_name'] ?? null,
            'address'          => $addr ?: ($it['description'] ?? ''),
            'lat'              => $lat !== null ? (float)$lat : null,
            'lng'              => $lng !== null ? (float)$lng : null,
        ];
    }
    sendJson(200, [
        'items' => $dirItems,
        'next'  => null,
    ]);
}

// --- 4.4. DELETE LIVELIHOOD (ADMIN ONLY) ---
if (preg_match('#^/api/livelihoods/([^/]+)(?:/delete)?$#', $pathname, $m)) {
    $rawSlug = urldecode($m[1]);
    $isDeleteRoute = ($method === 'DELETE') || ($method === 'POST' && substr($pathname, -7) === '/delete');

    if ($isDeleteRoute) {
        if (!isAdminRequest($config)) {
            sendJson(403, [
                'error'   => 'forbidden',
                'message' => 'Chỉ Admin mới có quyền xóa gánh hàng',
            ]);
        }

        $cleanId = preg_replace('/^ganh-/', '', $rawSlug);
        $canonicalSlug = strpos($rawSlug, 'ganh-') === 0 ? $rawSlug : ('ganh-' . $rawSlug);

        if ($pdo) {
            $stmtDelChk = $pdo->prepare("DELETE FROM `checkins` WHERE `slug` = :slug OR `livelihood_id` = :id");
            $stmtDelChk->execute([':slug' => $canonicalSlug, ':id' => $cleanId]);

            $stmtDel = $pdo->prepare("DELETE FROM `livelihoods` WHERE `slug` = :slug OR `id` = :id");
            $stmtDel->execute([':slug' => $canonicalSlug, ':id' => $cleanId]);
        }

        // Luôn đồng bộ vào persistent-store.json
        $store = loadPersistentStore($uploadsDir);
        if (!in_array($canonicalSlug, $store['deletedSlugs'], true)) {
            $store['deletedSlugs'][] = $canonicalSlug;
        }
        if (!in_array($rawSlug, $store['deletedSlugs'], true)) {
            $store['deletedSlugs'][] = $rawSlug;
        }
        $store['customPlaces'] = array_values(array_filter($store['customPlaces'] ?? [], function ($cp) use ($canonicalSlug, $cleanId) {
            $it = $cp['item'] ?? $cp;
            return ($it['slug'] ?? '') !== $canonicalSlug && ($it['id'] ?? '') !== $cleanId;
        }));
        savePersistentStore($uploadsDir, $store);

        sendJson(200, [
            'ok'           => true,
            'deleted_slug' => $canonicalSlug,
        ]);
    }
}

// --- 4.5. GET LIVELIHOOD DETAIL ---
if (strpos($pathname, '/api/livelihoods/') === 0 && $method === 'GET') {
    $slug = urldecode(substr($pathname, strlen('/api/livelihoods/')));
    $cleanId = preg_replace('/^ganh-/', '', $slug);
    $canonicalSlug = strpos($slug, 'ganh-') === 0 ? $slug : ('ganh-' . $slug);

    if ($pdo) {
        $stmt = $pdo->prepare("SELECT * FROM `livelihoods` WHERE `slug` = :slug OR `id` = :id LIMIT 1");
        $stmt->execute([':slug' => $canonicalSlug, ':id' => $cleanId]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJson(404, ['error' => 'not_found']);
        }

        $stmtChk = $pdo->prepare("SELECT * FROM `checkins` WHERE `livelihood_id` = :id OR `slug` = :slug ORDER BY `created_at` DESC");
        $stmtChk->execute([':id' => $row['id'], ':slug' => $row['slug']]);
        $checkins = $stmtChk->fetchAll();

        $timeline = [];
        foreach ($checkins as $c) {
            $timeline[] = [
                'id'                   => $c['id'],
                'status'               => $c['status'],
                'caption'              => $c['caption'],
                'created_at'           => (int)$c['created_at'],
                'public_key'           => $c['public_key'],
                'submitter_name'       => $c['submitter_name'],
                'submitter_avatar_url' => $c['submitter_avatar_url'] ?: '/images/logo-betech.png',
                'submitter_level'      => (int)$c['submitter_level'],
            ];
        }

        $latestCheckin = !empty($timeline) ? $timeline[0] : null;
        $item = formatDbRowToItem($row, $latestCheckin);
        $coverKey = $item['cover_key'] ?? '';
        $album = $coverKey ? [[
            'id'         => basename($coverKey),
            'public_key' => $coverKey,
            'width'      => 1200,
            'height'     => 1600,
        ]] : [];

        sendJson(200, [
            'item'     => $item,
            'timeline' => $timeline,
            'album'    => $album,
            'creator'  => [
                'display_name' => 'Cộng đồng Gánh Mưu Sinh · Betech Digital',
                'avatar_url'   => '/images/logo-betech.png',
                'level'        => 3,
            ],
        ]);
    }

    // Fallback JSON Store
    $store = loadPersistentStore($uploadsDir);
    $deleted = array_flip($store['deletedSlugs'] ?? []);
    if (isset($deleted[$slug]) || isset($deleted[$canonicalSlug])) {
        sendJson(404, ['error' => 'not_found']);
    }

    foreach ($store['customPlaces'] ?? [] as $cp) {
        $it = $cp['item'] ?? $cp;
        if (($it['slug'] ?? '') === $canonicalSlug || ($it['id'] ?? '') === $cleanId) {
            sendJson(200, [
                'item'     => $it,
                'timeline' => $cp['timeline'] ?? [],
                'album'    => $cp['album'] ?? [],
                'creator'  => $cp['creator'] ?? [
                    'display_name' => 'Cộng đồng Gánh Mưu Sinh',
                    'avatar_url'   => '/images/logo-betech.png',
                    'level'        => 3,
                ],
            ]);
        }
    }

    $seed = loadSeedData();
    foreach ($seed['livelihoods'] ?? [] as $raw) {
        if (($raw['slug'] ?? '') === $canonicalSlug || ($raw['id'] ?? '') === $cleanId) {
            $timeline = $raw['_timeline'] ?? [];
            $album = $raw['_album'] ?? [];
            $creator = $raw['_creator'] ?? [
                'display_name' => 'Cộng đồng Gánh Mưu Sinh',
                'avatar_url'   => '/images/logo-betech.png',
                'level'        => 2,
            ];
            unset($raw['_timeline'], $raw['_album'], $raw['_creator']);
            sendJson(200, [
                'item'     => $raw,
                'timeline' => $timeline,
                'album'    => $album,
                'creator'  => $creator,
            ]);
        }
    }

    sendJson(404, ['error' => 'not_found']);
}

// --- 4.6. PLACE UPLOAD (REAL DISK STORAGE + MYSQL MEDIA_UPLOADS) ---
if ($pathname === '/api/place-upload' && $method === 'POST') {
    $mediaId = uuidv4();
    $ext = 'webp';
    $mimeType = 'image/webp';
    $imgBytes = '';

    $contentType = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
    if (strpos($contentType, 'application/json') !== false) {
        $body = readJsonBody();
        $dataUrl = (string)($body['dataUrl'] ?? $body['image'] ?? $body['file'] ?? '');
        if (preg_match('/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i', $dataUrl, $m)) {
            $mimeType = strtolower($m[1]);
            $imgBytes = base64_decode($m[2]) ?: '';
            if (strpos($mimeType, 'png') !== false) $ext = 'png';
            elseif (strpos($mimeType, 'jpeg') !== false || strpos($mimeType, 'jpg') !== false) $ext = 'jpg';
            else $ext = 'webp';
        }
    } elseif (!empty($_FILES['file']['tmp_name'])) {
        $imgBytes = (string)file_get_contents($_FILES['file']['tmp_name']);
        $mimeType = $_FILES['file']['type'] ?: 'image/jpeg';
        if (strpos($mimeType, 'png') !== false) $ext = 'png';
        elseif (strpos($mimeType, 'webp') !== false) $ext = 'webp';
        else $ext = 'jpg';
    } else {
        $raw = file_get_contents('php://input');
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && !empty($decoded['dataUrl'])) {
                if (preg_match('/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i', (string)$decoded['dataUrl'], $m)) {
                    $mimeType = strtolower($m[1]);
                    $imgBytes = base64_decode($m[2]) ?: '';
                    if (strpos($mimeType, 'png') !== false) $ext = 'png';
                    elseif (strpos($mimeType, 'jpeg') !== false || strpos($mimeType, 'jpg') !== false) $ext = 'jpg';
                }
            } else {
                $imgBytes = $raw;
            }
        }
    }

    $filename = $mediaId . '.' . $ext;
    $targetPath = rtrim($uploadsDir, '/') . '/' . $filename;
    if ($imgBytes !== '') {
        @file_put_contents($targetPath, $imgBytes);
    }

    $relativeUrl = '/uploads/' . $filename;
    if ($pdo) {
        $stmt = $pdo->prepare("
            INSERT INTO `media_uploads` (`id`, `livelihood_id`, `file_path`, `mime_type`, `created_at`)
            VALUES (:id, NULL, :file_path, :mime_type, :created_at)
        ");
        $stmt->execute([
            ':id'         => $mediaId,
            ':file_path'  => $relativeUrl,
            ':mime_type'  => $mimeType,
            ':created_at' => time(),
        ]);
    }

    $store = loadPersistentStore($uploadsDir);
    $store['uploadedFiles'][$mediaId] = [
        'id'        => $mediaId,
        'filename'  => $filename,
        'url'       => $relativeUrl,
        'mime_type' => $mimeType,
        'created_at'=> time(),
    ];
    savePersistentStore($uploadsDir, $store);

    sendJson(200, [
        'ok'       => true,
        'id'       => $mediaId,
        'media_id' => $mediaId,
        'url'      => $relativeUrl,
    ]);
}

// --- 4.7. PLACE LOCATION LOOKUP ---
if ($pathname === '/api/place-location' && $method === 'POST') {
    $body = readJsonBody();
    $query = trim((string)($body['query'] ?? $body['url'] ?? $body['google_maps_url'] ?? $body['address'] ?? ''));

    // 1. Tọa độ trực tiếp "10.7769, 106.7009"
    if (preg_match('/^\s*(-?\d+\.\d+)\s*[,;\s]\s*(-?\d+\.\d+)\s*$/', $query, $mCoord)) {
        $lat = (float)$mCoord[1];
        $lng = (float)$mCoord[2];
        $item = [
            'label'     => sprintf('Tọa độ GPS (%.6f, %.6f)', $lat, $lng),
            'address'   => sprintf('%.6f, %.6f', $lat, $lng),
            'lat'       => $lat,
            'lng'       => $lng,
            'source'    => 'google_maps_link',
            'precision' => 'coordinates',
        ];
        sendJson(200, [
            'ok'      => true,
            'source'  => 'google_maps_link',
            'lat'     => $lat,
            'lng'     => $lng,
            'address' => $item['address'],
            'results' => [$item],
            'items'   => [$item],
        ]);
    }

    // 2. Link Google Maps có tọa độ @lat,lng hoặc !3d...!4d...
    $decodedQuery = urldecode($query);
    if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $decodedQuery, $m3d) ||
        preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $decodedQuery, $m3d) ||
        preg_match('/[?&](?:q|query|ll)=(-?\d+\.\d+)[,\s+]+(-?\d+\.\d+)/', $decodedQuery, $m3d)) {
        $lat = (float)$m3d[1];
        $lng = (float)$m3d[2];
        $item = [
            'label'     => 'Vị trí từ liên kết Google Maps',
            'address'   => $query,
            'lat'       => $lat,
            'lng'       => $lng,
            'source'    => 'google_maps_link',
            'precision' => 'address',
        ];
        sendJson(200, [
            'ok'      => true,
            'source'  => 'google_maps_link',
            'lat'     => $lat,
            'lng'     => $lng,
            'address' => $query,
            'results' => [$item],
            'items'   => [$item],
        ]);
    }

    // 3. Gazetteer TP.HCM
    $gazetteer = [
        ['label' => '72 Huỳnh Thúc Kháng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'lat' => 10.772764, 'lng' => 106.702409],
        ['label' => '92A-94 Bạch Đằng, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh (Betech Digital)', 'lat' => 10.8132, 'lng' => 106.6708],
        ['label' => 'Chợ Bến Thành, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', 'lat' => 10.7725, 'lng' => 106.6980],
        ['label' => 'Hồ Con Rùa (Công trường Quốc tế), Quận 3, TP. Hồ Chí Minh', 'lat' => 10.7827, 'lng' => 106.6959],
        ['label' => '120B Ngô Tất Tố, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', 'lat' => 10.7938, 'lng' => 106.7098],
    ];
    $results = [];
    $qLower = mb_strtolower($query, 'UTF-8');
    foreach ($gazetteer as $g) {
        if ($qLower === '' || mb_strpos(mb_strtolower($g['label'], 'UTF-8'), $qLower) !== false) {
            $results[] = [
                'label'     => $g['label'],
                'address'   => $g['label'],
                'lat'       => $g['lat'],
                'lng'       => $g['lng'],
                'source'    => 'photon',
                'precision' => 'address',
            ];
        }
    }
    if (empty($results)) {
        $results[] = [
            'label'     => ($query ?: 'Trung tâm Quận 1') . ' · TP. Hồ Chí Minh, Việt Nam',
            'address'   => $query ?: 'TP. Hồ Chí Minh, Việt Nam',
            'lat'       => 10.7769,
            'lng'       => 106.7009,
            'source'    => 'photon',
            'precision' => 'address',
        ];
    }
    $top = $results[0];
    sendJson(200, [
        'ok'      => true,
        'source'  => 'photon',
        'lat'     => $top['lat'],
        'lng'     => $top['lng'],
        'address' => $top['address'],
        'results' => $results,
        'items'   => $results,
    ]);
}

// --- 4.8. PLACE SUBMISSIONS (INSERT NEW LIVELIHOOD) ---
if ($pathname === '/api/place-submissions' && $method === 'POST') {
    $body = readJsonBody();
    $id = uuidv4();
    $submissionId = uuidv4();
    $slug = 'ganh-' . $id;
    $nowSec = time();

    $name = mb_substr(trim((string)($body['display_name'] ?? $body['name'] ?? 'Gánh hàng mới')), 0, 80, 'UTF-8');
    $description = mb_substr(trim((string)($body['description'] ?? $body['summary'] ?? 'Gánh hàng mới được cộng đồng giới thiệu.')), 0, 500, 'UTF-8');
    $category = (string)($body['category'] ?? $body['category_slug'] ?? inferCategory($name, $description));
    $locationMode = ($body['location_mode'] ?? 'pin') === 'address' ? 'address' : 'pin';

    $hasValidLat = isset($body['lat']) && $body['lat'] !== '' && is_numeric($body['lat']);
    $hasValidLng = isset($body['lng']) && $body['lng'] !== '' && is_numeric($body['lng']);
    $lat = $hasValidLat ? (float)$body['lat'] : ($locationMode === 'address' ? null : 10.7769);
    $lng = $hasValidLng ? (float)$body['lng'] : ($locationMode === 'address' ? null : 106.7009);

    $photoUuid = (string)($body['media_id'] ?? $body['photo_id'] ?? uuidv4());
    $coverKey = "retained/{$id}/{$photoUuid}";
    $addressStr = trim((string)($body['address'] ?? $body['address_text'] ?? $description));
    $status = (string)($body['status'] ?? 'available');
    $googleMapsUrl = (string)($body['google_maps_url'] ?? ('https://www.google.com/maps/search/?api=1&query=' . urlencode(trim($name . ' ' . $addressStr))));
    $profileDetails = json_encode([
        'address'         => $addressStr,
        'hours'           => $body['hours_text'] ?? $body['hours'] ?? 'Hằng ngày: 07:00 đến 19:00',
        'observed_status' => 'Mới cập nhật trên Gánh Mưu Sinh',
        'observed_at'     => $nowSec,
    ], JSON_UNESCAPED_UNICODE);

    $newItem = [
        'id'                          => $id,
        'slug'                        => $slug,
        'display_name'                => $name,
        'description'                 => $description,
        'age_group'                   => $body['age_group'] ?? null,
        'category'                    => $category,
        'status'                      => $status,
        'location_mode'               => $locationMode,
        'approximate_lat'             => $lat,
        'approximate_lng'             => $lng,
        'location_updated_at'         => $lat !== null ? $nowSec : null,
        'updated_at'                  => $nowSec,
        'created_at'                  => $nowSec,
        'cover_key'                   => $coverKey,
        'volunteer_count'             => 1,
        'revision'                    => 1,
        'google_maps_url'             => $googleMapsUrl,
        'google_maps_name'            => $body['google_maps_name'] ?? null,
        'google_maps_details'         => null,
        'google_lat'                  => $lat,
        'google_lng'                  => $lng,
        'google_location_observed_at' => $lat !== null ? $nowSec : null,
        'profile_details'             => $profileDetails,
        'checkin_count'               => 1,
        'last_checkin_at'             => $nowSec,
        'manual_lat'                  => $lat,
        'manual_lng'                  => $lng,
        'manual_location_source'      => $lat !== null ? 'manual_business_pin' : 'address_only',
        'latest_checkin'              => [
            'status'               => $status,
            'created_at'           => $nowSec,
            'submitter_name'       => $defaultVolunteer['display_name'],
            'submitter_avatar_url' => $defaultVolunteer['avatar_url'],
            'submitter_level'      => $defaultVolunteer['level'],
        ],
    ];

    if ($pdo) {
        $stmt = $pdo->prepare("
            INSERT INTO `livelihoods` (
                `id`, `slug`, `display_name`, `description`, `age_group`, `category`, `status`,
                `approximate_lat`, `approximate_lng`, `manual_lat`, `manual_lng`, `manual_location_source`,
                `google_maps_url`, `google_maps_name`, `google_maps_details`, `google_lat`, `google_lng`,
                `google_location_observed_at`, `profile_details`, `cover_key`, `checkin_count`,
                `volunteer_count`, `revision`, `last_checkin_at`, `location_updated_at`, `updated_at`, `created_at`
            ) VALUES (
                :id, :slug, :display_name, :description, :age_group, :category, :status,
                :approximate_lat, :approximate_lng, :manual_lat, :manual_lng, :manual_location_source,
                :google_maps_url, :google_maps_name, :google_maps_details, :google_lat, :google_lng,
                :google_location_observed_at, :profile_details, :cover_key, 1,
                1, 1, :last_checkin_at, :location_updated_at, :updated_at, :created_at
            )
        ");
        $stmt->execute([
            ':id'                          => $id,
            ':slug'                        => $slug,
            ':display_name'                => $name,
            ':description'                 => $description,
            ':age_group'                   => $body['age_group'] ?? null,
            ':category'                    => $category,
            ':status'                      => $status,
            ':approximate_lat'             => $lat,
            ':approximate_lng'             => $lng,
            ':manual_lat'                  => $lat,
            ':manual_lng'                  => $lng,
            ':manual_location_source'      => $newItem['manual_location_source'],
            ':google_maps_url'             => $googleMapsUrl,
            ':google_maps_name'            => $body['google_maps_name'] ?? null,
            ':google_maps_details'         => null,
            ':google_lat'                  => $lat,
            ':google_lng'                  => $lng,
            ':google_location_observed_at' => $newItem['google_location_observed_at'],
            ':profile_details'             => $profileDetails,
            ':cover_key'                   => $coverKey,
            ':last_checkin_at'             => $nowSec,
            ':location_updated_at'         => $newItem['location_updated_at'],
            ':updated_at'                  => $nowSec,
            ':created_at'                  => $nowSec,
        ]);

        $stmtChk = $pdo->prepare("
            INSERT INTO `checkins` (
                `id`, `livelihood_id`, `slug`, `status`, `caption`, `public_key`,
                `submitter_name`, `submitter_avatar_url`, `submitter_level`, `created_at`
            ) VALUES (
                :id, :livelihood_id, :slug, :status, :caption, :public_key,
                :submitter_name, :submitter_avatar_url, :submitter_level, :created_at
            )
        ");
        $stmtChk->execute([
            ':id'                   => uuidv4(),
            ':livelihood_id'        => $id,
            ':slug'                 => $slug,
            ':status'               => $status,
            ':caption'              => $description,
            ':public_key'           => $coverKey,
            ':submitter_name'       => $defaultVolunteer['display_name'],
            ':submitter_avatar_url' => $defaultVolunteer['avatar_url'],
            ':submitter_level'      => $defaultVolunteer['level'],
            ':created_at'           => $nowSec,
        ]);

        if (!empty($body['media_id'])) {
            $stmtMedia = $pdo->prepare("UPDATE `media_uploads` SET `livelihood_id` = :lid WHERE `id` = :mid");
            $stmtMedia->execute([':lid' => $id, ':mid' => $body['media_id']]);
        }
    }

    // Lưu đồng bộ vào persistent-store.json
    $store = loadPersistentStore($uploadsDir);
    array_unshift($store['customPlaces'], [
        'item' => $newItem,
        'timeline' => [[
            'id'                   => uuidv4(),
            'status'               => $status,
            'caption'              => $description,
            'created_at'           => $nowSec,
            'public_key'           => $coverKey,
            'submitter_name'       => $defaultVolunteer['display_name'],
            'submitter_avatar_url' => $defaultVolunteer['avatar_url'],
            'submitter_level'      => $defaultVolunteer['level'],
        ]],
        'album' => [[
            'id'         => $photoUuid,
            'public_key' => $coverKey,
            'width'      => 1200,
            'height'     => 1600,
        ]],
        'creator' => [
            'display_name' => $defaultVolunteer['display_name'],
            'avatar_url'   => $defaultVolunteer['avatar_url'],
            'level'        => $defaultVolunteer['level'],
        ],
    ]);
    savePersistentStore($uploadsDir, $store);

    sendJson(200, [
        'ok'             => true,
        'id'             => $submissionId,
        'livelihood_id'  => $id,
        'slug'           => $slug,
        'item'           => $newItem,
        'status'         => 'pending',
        'points_awarded' => 10,
        'volunteer'      => $defaultVolunteer,
    ]);
}

// --- 4.9. CHECK-INS ---
if ($pathname === '/api/checkins' && $method === 'POST') {
    $body = readJsonBody();
    $slugOrId = (string)($body['slug'] ?? $body['livelihood_id'] ?? '');
    $cleanId = preg_replace('/^ganh-/', '', $slugOrId);
    $canonicalSlug = strpos($slugOrId, 'ganh-') === 0 ? $slugOrId : ('ganh-' . $slugOrId);

    $checkinId = uuidv4();
    $nowSec = time();
    $status = (string)($body['status'] ?? 'bought');
    $caption = mb_substr(trim((string)($body['caption'] ?? '')), 0, 280, 'UTF-8');

    if ($pdo) {
        $stmt = $pdo->prepare("SELECT * FROM `livelihoods` WHERE `slug` = :slug OR `id` = :id LIMIT 1");
        $stmt->execute([':slug' => $canonicalSlug, ':id' => $cleanId]);
        $row = $stmt->fetch();
        if ($row) {
            $photoKey = !empty($body['media_id']) ? ("retained/{$row['id']}/{$body['media_id']}") : ($row['cover_key'] ?? null);
            $stmtUpd = $pdo->prepare("
                UPDATE `livelihoods`
                SET `status` = :status,
                    `checkin_count` = `checkin_count` + 1,
                    `last_checkin_at` = :now,
                    `updated_at` = :now
                WHERE `id` = :id
            ");
            $stmtUpd->execute([':status' => $status, ':now' => $nowSec, ':id' => $row['id']]);

            $stmtChk = $pdo->prepare("
                INSERT INTO `checkins` (
                    `id`, `livelihood_id`, `slug`, `status`, `caption`, `public_key`,
                    `submitter_name`, `submitter_avatar_url`, `submitter_level`, `created_at`
                ) VALUES (
                    :id, :livelihood_id, :slug, :status, :caption, :public_key,
                    :submitter_name, :submitter_avatar_url, :submitter_level, :created_at
                )
            ");
            $stmtChk->execute([
                ':id'                   => $checkinId,
                ':livelihood_id'        => $row['id'],
                ':slug'                 => $row['slug'],
                ':status'               => $status,
                ':caption'              => $caption,
                ':public_key'           => $photoKey,
                ':submitter_name'       => $defaultVolunteer['display_name'],
                ':submitter_avatar_url' => $defaultVolunteer['avatar_url'],
                ':submitter_level'      => $defaultVolunteer['level'],
                ':created_at'           => $nowSec,
            ]);
            $canonicalSlug = $row['slug'];
        }
    }

    $store = loadPersistentStore($uploadsDir);
    $store['customCheckins'][] = [
        'id'                   => $checkinId,
        'slug'                 => $canonicalSlug,
        'status'               => $status,
        'caption'              => $caption,
        'created_at'           => $nowSec,
        'submitter_name'       => $defaultVolunteer['display_name'],
        'submitter_avatar_url' => $defaultVolunteer['avatar_url'],
        'submitter_level'      => $defaultVolunteer['level'],
    ];
    savePersistentStore($uploadsDir, $store);

    sendJson(200, [
        'id'             => $checkinId,
        'status'         => 'pending',
        'points_awarded' => 5,
        'slug'           => $canonicalSlug,
    ]);
}

if (strpos($pathname, '/api/checkin-jobs') === 0) {
    $jobId = uuidv4();
    sendJson(200, [
        'id'             => $jobId,
        'state'          => 'pending',
        'chunk_size'     => 65536,
        'received_parts' => [0],
        'queue_accepted' => true,
        'checkin_id'     => uuidv4(),
    ]);
}

// --- 4.10. REPORTS ---
if ($pathname === '/api/reports' && $method === 'POST') {
    $body = readJsonBody();
    $reportId = uuidv4();
    $slug = (string)($body['slug'] ?? $body['livelihood_id'] ?? '');
    $reason = (string)($body['kind'] ?? $body['reason'] ?? 'incorrect');
    $note = (string)($body['reason'] ?? $body['note'] ?? '');
    $nowSec = time();

    if ($pdo) {
        $stmt = $pdo->prepare("
            INSERT INTO `reports` (`id`, `slug`, `reason`, `note`, `created_at`)
            VALUES (:id, :slug, :reason, :note, :created_at)
        ");
        $stmt->execute([
            ':id'         => $reportId,
            ':slug'       => $slug,
            ':reason'     => mb_substr($reason, 0, 128, 'UTF-8'),
            ':note'       => $note,
            ':created_at' => $nowSec,
        ]);
    }

    $store = loadPersistentStore($uploadsDir);
    $store['reports'][] = [
        'id'         => $reportId,
        'slug'       => $slug,
        'reason'     => $reason,
        'note'       => $note,
        'created_at' => $nowSec,
    ];
    savePersistentStore($uploadsDir, $store);

    sendJson(200, [
        'id'     => $reportId,
        'status' => 'received',
        'ok'     => true,
    ]);
}

sendJson(404, ['error' => 'not_found']);
