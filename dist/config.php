<?php
/**
 * Cấu hình Backend PHP + MySQL cho Gánh Mưu Sinh × Betech Digital
 * Có thể ghi đè thông qua biến môi trường trên VPS hoặc sửa trực tiếp tại đây.
 */

return [
    // Cấu hình kết nối MySQL / MariaDB
    'db_host' => getenv('DB_HOST') ?: '127.0.0.1',
    'db_port' => getenv('DB_PORT') ?: '3306',
    'db_name' => getenv('DB_NAME') ?: 'ganhmuusinh',
    'db_user' => getenv('DB_USER') ?: 'root',
    'db_pass' => getenv('DB_PASS') !== false ? getenv('DB_PASS') : '',

    // Cấu hình tài khoản Quản trị viên (Admin)
    'admin_username' => getenv('ADMIN_USERNAME') ?: 'admin',
    'admin_password' => getenv('ADMIN_PASSWORD') ?: 'Betech@2026',
    'secret_key'     => getenv('APP_SECRET') ?: 'betech-ganhmuusinh-secret-2026',

    // Đường dẫn thư mục lưu ảnh upload thực tế
    'uploads_dir'    => __DIR__ . '/uploads',
];
