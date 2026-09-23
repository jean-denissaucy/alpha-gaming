-- Execute this in phpMyAdmin after selecting the exact Plesk database.
-- Adds an optional press/community rating (out of 20) to catalogue games.
-- NULL = no rating yet. Safe for an existing installation.
ALTER TABLE `games`
  ADD COLUMN `note` DECIMAL(3,1) NULL DEFAULT NULL AFTER `image`;
