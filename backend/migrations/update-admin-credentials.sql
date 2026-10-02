-- Execute this migration on the existing Alpha Gaming database.
-- The password is stored as a bcrypt hash, never in plain text.
START TRANSACTION;

UPDATE `users`
SET
  `email` = 'jeandsaucy@gmail.com',
  `password` = '$2b$10$OLoo2pqJ0KgSiTF37RZwyOJ6C6QhSduKvN9b074RLsuEpASPv.ylq',
  `role` = 'admin'
WHERE `email` = 'jd@gmail.com';

COMMIT;