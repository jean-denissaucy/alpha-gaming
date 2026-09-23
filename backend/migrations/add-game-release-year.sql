-- Execute this in phpMyAdmin after selecting the exact Plesk database.
-- Adds the release year (e.g. 2025, 2026, 2027) to catalogue games.
-- NULL = unknown. Safe for an existing installation.
ALTER TABLE `games`
  ADD COLUMN `release_year` SMALLINT NULL DEFAULT NULL AFTER `note`;
