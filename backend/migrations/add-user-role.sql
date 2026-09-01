-- Execute this in phpMyAdmin after selecting the exact Plesk database.
-- Safe for an existing installation: it does not delete users or tables.
ALTER TABLE `users`
  ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER `lastname`;

-- Replace this email with the account that must administer the site.
UPDATE `users`
SET `role` = 'admin'
WHERE `email` = 'jd@gmail.com';
