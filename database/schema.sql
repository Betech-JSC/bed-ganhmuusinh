-- ============================================================================
-- GÁNH MƯU SINH × BETECH DIGITAL - MYSQL / MARIADB SCHEMA
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- 1. Bảng gánh hàng mưu sinh (livelihoods)
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
  `created_at` BIGINT NOT NULL,
  INDEX `idx_livelihoods_updated_at` (`updated_at` DESC),
  INDEX `idx_livelihoods_category` (`category`),
  INDEX `idx_livelihoods_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng lịch sử ghé thăm / cập nhật tình hình (checkins)
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
  `created_at` BIGINT NOT NULL,
  INDEX `idx_checkins_livelihood_id` (`livelihood_id`),
  INDEX `idx_checkins_slug` (`slug`),
  INDEX `idx_checkins_created_at` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng lưu trữ file ảnh tải lên (media_uploads)
CREATE TABLE IF NOT EXISTS `media_uploads` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `livelihood_id` VARCHAR(64) NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(64) NOT NULL DEFAULT 'image/webp',
  `created_at` BIGINT NOT NULL,
  INDEX `idx_media_livelihood_id` (`livelihood_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng báo cáo sai sót / góp ý hồ sơ (reports)
CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `slug` VARCHAR(128) NOT NULL,
  `reason` VARCHAR(128) NOT NULL,
  `note` TEXT NULL,
  `created_at` BIGINT NOT NULL,
  INDEX `idx_reports_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
