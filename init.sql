-- Initialisation MySQL pour Alpha Gaming
-- Usage: mysql -u root < init.sql

CREATE DATABASE IF NOT EXISTS `starter_kit`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `alpha-gaming`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Base par defaut du backend: DB_NAME=alpha-gaming
USE `alpha-gaming`;

-- Suppression complete des anciennes tables de favoris pour eviter les doublons ou les donnees obsoletes
DROP TABLE IF EXISTS user_favorite_games;
DROP TABLE IF EXISTS favorite_games;
DROP TABLE IF EXISTS favoris_jeux;
DROP TABLE IF EXISTS favoris;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(150) NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorite_games (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  categorie VARCHAR(100) NOT NULL,
  titre_jeu VARCHAR(150) NOT NULL,
  lien VARCHAR(150) NULL,
  is_external TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorite_games_categorie_titre (categorie, titre_jeu),
  KEY idx_favorite_games_categorie (categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_favorite_games (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  game_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_favorite_games (user_id, game_id),
  KEY idx_user_favorite_games_user (user_id),
  KEY idx_user_favorite_games_game (game_id),
  CONSTRAINT fk_user_favorite_games_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_favorite_games_game
    FOREIGN KEY (game_id)
    REFERENCES favorite_games(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tests_rapides (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titre_jeu VARCHAR(150) NOT NULL,
  score DECIMAL(3,1) NOT NULL,
  plateformes VARCHAR(150) NOT NULL,
  verdict VARCHAR(150) NOT NULL,
  lien VARCHAR(150) NULL,
  is_external TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tests_rapides_titre_jeu (titre_jeu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_esport (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  league VARCHAR(120) NOT NULL,
  match_title VARCHAR(150) NOT NULL,
  kickoff_time VARCHAR(12) NOT NULL,
  href VARCHAR(150) NOT NULL,
  source VARCHAR(120) NOT NULL DEFAULT 'RSS',
  published_at DATETIME NULL,
  is_external TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_live_esport_href (href),
  KEY idx_live_esport_league (league),
  KEY idx_live_esport_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration de compatibilite pour les anciennes bases (schema live_esport)
SET @db_name = DATABASE();

-- Migrate: competition → league
SELECT COUNT(*) INTO @has_competition
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'competition';
SET @sql = IF(@has_competition > 0,
  'ALTER TABLE live_esport CHANGE competition league VARCHAR(120) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Migrate: affiche → match_title
SELECT COUNT(*) INTO @has_affiche
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'affiche';
SET @sql = IF(@has_affiche > 0,
  'ALTER TABLE live_esport CHANGE affiche match_title VARCHAR(255) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Migrate: heure_debut → kickoff_time
SELECT COUNT(*) INTO @has_heure_debut
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'heure_debut';
SET @sql = IF(@has_heure_debut > 0,
  'ALTER TABLE live_esport CHANGE heure_debut kickoff_time VARCHAR(12) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Migrate: lien → href
SELECT COUNT(*) INTO @has_lien
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'lien';
SET @sql = IF(@has_lien > 0,
  'ALTER TABLE live_esport CHANGE lien href VARCHAR(500) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add: source column (if missing)
SELECT COUNT(*) INTO @has_source
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'source';
SET @sql = IF(@has_source = 0,
  'ALTER TABLE live_esport ADD COLUMN source VARCHAR(120) NOT NULL DEFAULT ''RSS'' AFTER href',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add: published_at column (if missing)
SELECT COUNT(*) INTO @has_published_at
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'published_at';
SET @sql = IF(@has_published_at = 0,
  'ALTER TABLE live_esport ADD COLUMN published_at DATETIME NULL AFTER source',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Backfill missing hrefs with placeholder URLs
UPDATE live_esport
SET href = CONCAT('https://example.com/live-esport/', id)
WHERE href IS NULL OR href = '';

-- Enforce NOT NULL on critical columns post-migration
ALTER TABLE live_esport
  MODIFY COLUMN league VARCHAR(120) NOT NULL,
  MODIFY COLUMN match_title VARCHAR(255) NOT NULL,
  MODIFY COLUMN kickoff_time VARCHAR(12) NOT NULL,
  MODIFY COLUMN href VARCHAR(155) NOT NULL,
  MODIFY COLUMN source VARCHAR(120) NOT NULL DEFAULT 'RSS';

-- Remove old unique constraint if it exists
SELECT COUNT(*) INTO @has_old_unique
FROM information_schema.statistics
WHERE table_schema = @db_name AND table_name = 'live_esport' AND index_name = 'uq_live_esport_competition_affiche';
SET @sql = IF(@has_old_unique > 0,
  'ALTER TABLE live_esport DROP INDEX uq_live_esport_competition_affiche',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Remove duplicate records (keep oldest)
DELETE t1
FROM live_esport t1
JOIN live_esport t2 ON t1.href = t2.href AND t1.id > t2.id;

-- Ensure proper unique index on href
SELECT COUNT(*) INTO @has_uq_href
FROM information_schema.statistics
WHERE table_schema = @db_name AND table_name = 'live_esport' AND index_name = 'uq_live_esport_href';
SET @sql = IF(@has_uq_href = 0,
  'ALTER TABLE live_esport ADD UNIQUE KEY uq_live_esport_href (href)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure indexes for querying
SELECT COUNT(*) INTO @has_idx_league
FROM information_schema.statistics
WHERE table_schema = @db_name AND table_name = 'live_esport' AND index_name = 'idx_live_esport_league';
SET @sql = IF(@has_idx_league = 0,
  'ALTER TABLE live_esport ADD KEY idx_live_esport_league (league)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @has_idx_published_at
FROM information_schema.statistics
WHERE table_schema = @db_name AND table_name = 'live_esport' AND index_name = 'idx_live_esport_published_at';
SET @sql = IF(@has_idx_published_at = 0,
  'ALTER TABLE live_esport ADD KEY idx_live_esport_published_at (published_at)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  source VARCHAR(120) NOT NULL,
  titre VARCHAR(255) NOT NULL,
  extrait TEXT NULL,
  url VARCHAR(150) NOT NULL,
  categorie VARCHAR(80) NOT NULL DEFAULT 'Gaming',
  reading_time VARCHAR(20) NOT NULL DEFAULT '2 min',
  published_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_news_url (url),
  KEY idx_news_published_at (published_at),
  KEY idx_news_categorie (categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed tests rapides
INSERT INTO tests_rapides (titre_jeu, score, plateformes, verdict, lien, is_external)
VALUES
  ('DOOM: Dark Ages', 9.2, 'PC / Xbox', 'Brutal, fluide, ultra lisible.', 'https://bethesda.net/en/game/doom', 1),
  ('Clair Obscur: Expedition 33', 8.8, 'PC / PS5', 'Direction artistique magistrale.', 'https://www.expedition33.com/', 1),
  ('F1 26', 8.1, 'PC / PS5 / Xbox', 'Carriere plus profonde et nerveuse.', 'https://www.ea.com/games/f1', 1),
  ('Metaphor: ReFantazio', 9.0, 'PC / PS5 / Xbox', 'Un JRPG dense avec une direction artistique marquante.', 'https://metaphor.atlus.com/', 1),
  ('Monster Hunter Wilds', 8.9, 'PC / PS5 / Xbox', 'Des chasses plus spectaculaires et un monde plus vivant.', 'https://www.monsterhunter.com/wilds/', 1),
  ('EA SPORTS FC 26', 8.0, 'PC / PS5 / Xbox', 'Gameplay plus propre, progression mode carriere amelioree.', 'https://www.ea.com/games/ea-sports-fc', 1),
  ('Helldivers 2', 8.7, 'PC / PS5', 'Coop explosive et sensation de guerre totale reussie.', 'https://www.playstation.com/games/helldivers-2/', 1),
  ('Hades II', 9.1, 'PC', 'Roguelike ultra solide, ecriture et rythme exemplaires.', 'https://www.supergiantgames.com/games/hades-ii/', 1)
ON DUPLICATE KEY UPDATE
  score = VALUES(score),
  plateformes = VALUES(plateformes),
  verdict = VALUES(verdict),
  lien = VALUES(lien),
  is_external = VALUES(is_external);

-- Seed live esport (fallback local)
INSERT INTO live_esport (league, match_title, kickoff_time, href, source, published_at, is_external)
VALUES
  ('League of Legends', 'Karmine Corp vs G2', '19:00', 'https://lolesports.com/', 'LoL Esports', NOW(), 1),
  ('VALORANT', 'Fnatic vs Heretics', '21:30', 'https://valorantesports.com/', 'VLR', NOW(), 1),
  ('Rocket League', 'Vitality vs BDS', '23:00', 'https://esports.rocketleague.com/', 'RL Esports', NOW(), 1),
  ('CS2', 'NAVI vs FaZe', '20:00', 'https://www.hltv.org/', 'HLTV', NOW(), 1),
  ('Call of Duty', 'OpTic Texas vs Toronto Ultra', '22:00', 'https://callofdutyleague.com/', 'CDL', NOW(), 1),
  ('Overwatch', 'Team Falcons vs Crazy Raccoon', '18:30', 'https://esports.overwatch.com/', 'OWCS', NOW(), 1),
  ('Apex Legends', 'TSM vs Alliance', '20:45', 'https://www.ea.com/games/apex-legends/compete', 'ALGS', NOW(), 1),
  ('PUBG', 'Gen.G vs Soniqs', '21:15', 'https://pubgesports.com/', 'PUBG Esports', NOW(), 1),
  ('Rainbow Six', 'BDS vs W7M', '19:45', 'https://www.ubisoft.com/esports/rainbow-six/siege', 'R6 Esports', NOW(), 1),
  ('Dota 2', 'Team Spirit vs Gaimin Gladiators', '23:30', 'https://www.dota2.com/esports', 'Dota 2', NOW(), 1)
ON DUPLICATE KEY UPDATE
  league = VALUES(league),
  match_title = VALUES(match_title),
  kickoff_time = VALUES(kickoff_time),
  source = VALUES(source),
  published_at = VALUES(published_at),
  is_external = VALUES(is_external);

-- Seed news (fallback local)
INSERT INTO news (source, titre, extrait, url, categorie, reading_time, published_at)
VALUES
  (
    'Alpha Gaming',
    'Silksong refait surface: 18 minutes de gameplay diffusees',
    'Team Cherry montre enfin un build solide avec de nouveaux biomes, des boss plus agressifs et un systeme de crafting repense.',
    'https://www.alpha-gaming.com/silksong-gameplay',
    'Inde',
    '6 min',
    NOW()
  ),
  (
    'Alpha Gaming',
    'GTA VI: Rockstar confirme une bande-annonce orientee mode online',
    'Le studio tease des activites de crew en monde ouvert et une economie dynamique plus ambitieuse que sur GTA Online.',
    'https://www.alpha-gaming.com/gta-vi-online',
    'AAA',
    '4 min',
    NOW()
  ),
  (
    'Alpha Gaming',
    'Le prochain Zelda miserait sur un monde maritime semi-procedural',
    'Selon plusieurs insiders, Nintendo experimenterait une navigation plus libre et des iles evolutives a chaque session.',
    'https://www.alpha-gaming.com/zelda-rumeur-maritime',
    'Nintendo',
    '5 min',
    NOW()
  )
ON DUPLICATE KEY UPDATE
  source = VALUES(source),
  titre = VALUES(titre),
  extrait = VALUES(extrait),
  categorie = VALUES(categorie),
  reading_time = VALUES(reading_time),
  published_at = VALUES(published_at);

-- Seed jeux disponibles par categorie (utilises dans l'onglet Favoris)
INSERT INTO favorite_games (categorie, titre_jeu, lien, is_external)
VALUES
  ('Action', 'DOOM: Dark Ages', 'https://bethesda.net/en/game/doom', 1),
  ('Action', 'Devil May Cry 5', 'https://www.devilmaycry.com/5/us/', 1),
  ('Action', 'Ninja Gaiden 4', 'https://teamninja-studio.com/', 1),
  ('Action', 'Stellar Blade', 'https://www.playstation.com/games/stellar-blade/', 1),
  ('Action', 'God of War Ragnarök', 'https://www.playstation.com/games/god-of-war-ragnarok/', 1),
  ('Action', 'Bayonetta 3', 'https://www.nintendo.com/us/store/products/bayonetta-3-switch/', 1),
  ('Action', 'Sekiro: Shadows Die Twice', 'https://www.sekirothegame.com/', 1),
  ('Action', 'Ghost of Tsushima Director''s Cut', 'https://www.playstation.com/games/ghost-of-tsushima/', 1),
  ('Action', 'Hi-Fi Rush', 'https://hifi-rush.com/', 1),
  ('Action', 'Returnal', 'https://www.playstation.com/games/returnal/', 1),

  ('Aventure', 'The Legend of Zelda: Echoes of Wisdom', 'https://www.nintendo.com/', 1),
  ('Aventure', 'Astro Bot', 'https://www.playstation.com/games/astro-bot/', 1),
  ('Aventure', 'Uncharted 4', 'https://www.playstation.com/games/uncharted-4-a-thiefs-end/', 1),
  ('Aventure', 'Indiana Jones and the Great Circle', 'https://indianajones.bethesda.net/', 1),
  ('Aventure', 'The Last of Us Part II Remastered', 'https://www.playstation.com/games/the-last-of-us-part-ii-remastered/', 1),
  ('Aventure', 'A Plague Tale: Requiem', 'https://www.asobostudio.com/games/a-plague-tale-requiem', 1),
  ('Aventure', 'Tchia', 'https://www.tchia.com/', 1),
  ('Aventure', 'Kena: Bridge of Spirits', 'https://www.kenagame.com/', 1),
  ('Aventure', 'Prince of Persia: The Lost Crown', 'https://www.ubisoft.com/game/prince-of-persia/the-lost-crown', 1),
  ('Aventure', 'Life is Strange: Double Exposure', 'https://www.square-enix-games.com/en_US/games/life-is-strange-double-exposure', 1),

  ('RPG', 'Baldur''s Gate 3', 'https://baldursgate3.game/', 1),
  ('RPG', 'Final Fantasy VII Rebirth', 'https://www.playstation.com/games/final-fantasy-vii-rebirth/', 1),
  ('RPG', 'Dragon''s Dogma 2', 'https://www.dragons-dogma.com/', 1),
  ('RPG', 'Metaphor: ReFantazio', 'https://metaphor.atlus.com/', 1),
  ('RPG', 'Elden Ring: Shadow of the Erdtree', 'https://www.elden-ring.com/', 1),
  ('RPG', 'Persona 5 Royal', 'https://www.playstation.com/games/persona-5-royal/', 1),
  ('RPG', 'Cyberpunk 2077', 'https://www.cyberpunk.net/', 1),
  ('RPG', 'Starfield', 'https://www.bethesda.net/en/game/starfield', 1),
  ('RPG', 'Dragon Age: The Veilguard', 'https://www.dragonage.com/', 1),
  ('RPG', 'Xenoblade Chronicles 3', 'https://www.nintendo.com/games/xenoblade-chronicles-3/', 1),

  ('Strategie', 'Civilization VII', 'https://www.civilization.com/', 1),
  ('Strategie', 'Total War: Warhammer III', 'https://www.totalwar.com/', 1),
  ('Strategie', 'StarCraft II', 'https://starcraft2.com/', 1),
  ('Strategie', 'Fire Emblem: Three Houses', 'https://www.nintendo.com/games/fire-emblem-three-houses/', 1),
  ('Strategie', 'XCOM 3', 'https://www.2k.com/xcom/', 1),
  ('Strategie', 'They Are Billions', 'https://www.they-are-billions.com/', 1),
  ('Strategie', 'Dota 2', 'https://www.dota2.com/', 1),
  ('Strategie', 'Heroes of the Storm', 'https://heroesofthestorm.com/', 1),
  ('Strategie', 'Manor Lords', 'https://www.manorlords.com/', 1),
  ('Strategie', 'Crusader Kings III', 'https://www.crusaderkings.com/', 1),

  ('Sport', 'EA SPORTS FC 26', 'https://www.ea.com/games/ea-sports-fc', 1),
  ('Sport', 'NBA 2K25', 'https://www.nba2k.com/', 1),
  ('Sport', 'F1 26', 'https://www.ea.com/games/f1', 1),
  ('Sport', 'Madden NFL 25', 'https://www.ea.com/games/madden', 1),
  ('Sport', 'PES 2025', 'https://www.pesworld.com/', 1),
  ('Sport', 'MLB The Show 25', 'https://theshow.com/', 1),
  ('Sport', 'UFC 5', 'https://www.ea.com/games/ufc', 1),
  ('Sport', 'WWE 2K25', 'https://www.wwe2k.com/', 1),
  ('Sport', 'Riders Republic', 'https://riders-republic.ubisoft.com/', 1),
  ('Sport', 'Steep', 'https://www.ubisoft.com/en-US/game/steep/', 1),

  ('Course', 'Forza Motorsport 8', 'https://forzamotorsport.net/', 1),
  ('Course', 'Gran Turismo 7', 'https://www.playstation.com/games/gran-turismo-7/', 1),
  ('Course', 'Need for Speed Unbound', 'https://www.ea.com/games/need-for-speed', 1),
  ('Course', 'Mario Kart 8 Deluxe', 'https://www.nintendo.com/games/mario-kart-8-deluxe/', 1),
  ('Course', 'Crash Team Racing Nitro-Fueled', 'https://www.playstation.com/games/crash-team-racing-nitro-fueled/', 1),
  ('Course', 'Sonic Racing', 'https://www.sonicthehedgehog.com/', 1),
  ('Course', 'Ridge Racer Unbounded', 'https://ridgeracer.game/', 1),
  ('Course', 'Assetto Corsa Competizione', 'https://www.assettocorsa.net/', 1),
  ('Course', 'Project Cars 3', 'https://www.projectcarsgame.com/', 1),
  ('Course', 'Wangan Midnight Maximum Tune', 'https://wangan.sega.com/', 1),

  ('Shooter', 'Call of Duty: Black Ops 6', 'https://www.callofduty.com/', 1),
  ('Shooter', 'Counter-Strike 2', 'https://www.counter-strike.net/', 1),
  ('Shooter', 'VALORANT', 'https://playvalorant.com/', 1),
  ('Shooter', 'Destiny 2', 'https://www.bungie.net/en/Destiny', 1),
  ('Shooter', 'Rainbow Six Siege', 'https://www.ubisoft.com/en-us/game/rainbow-six/siege', 1),
  ('Shooter', 'Overwatch 2', 'https://overwatch.blizzard.com/', 1),
  ('Shooter', 'Apex Legends', 'https://www.ea.com/games/apex-legends', 1),
  ('Shooter', 'Helldivers 2', 'https://www.playstation.com/games/helldivers-2/', 1),
  ('Shooter', 'Team Fortress 2', 'https://www.teamfortress.com/', 1),
  ('Shooter', 'Warzone', 'https://www.callofduty.com/warzone', 1),

  ('Plateforme', 'Astro''s Playroom', 'https://www.playstation.com/games/astros-playroom/', 1),
  ('Plateforme', 'Super Mario Bros. Wonder', 'https://www.nintendo.com/games/super-mario-bros-wonder/', 1),
  ('Plateforme', 'Donkey Kong Country Returns', 'https://www.nintendo.com/games/donkey-kong-country-returns/', 1),
  ('Plateforme', 'Rayman Legends', 'https://www.ubisoft.com/en-us/game/rayman-legends', 1),
  ('Plateforme', 'Kirby and the Forgotten Land', 'https://www.nintendo.com/games/kirby-and-the-forgotten-land/', 1),
  ('Plateforme', 'Sonic Frontiers', 'https://www.sonicthehedgehog.com/', 1),
  ('Plateforme', 'Celeste', 'https://www.celestegame.com/', 1),
  ('Plateforme', 'Dead Cells', 'https://dead-cells.com/', 1),
  ('Plateforme', 'Hollow Knight', 'https://www.hollowknight.com/', 1),
  ('Plateforme', 'Ori and the Blind Forest', 'https://www.orithegame.com/', 1),

  ('Puzzle', 'Portal 2', 'https://www.valvesoftware.com/en/games/portal2/', 1),
  ('Puzzle', 'The Witness', 'https://the-witness.com/', 1),
  ('Puzzle', 'Tetris Effect', 'https://www.tetriseffect.game/', 1),
  ('Puzzle', 'Baba Is You', 'https://hempuli.itch.io/baba-is-you', 1),
  ('Puzzle', 'Unpacking', 'https://unpackinggame.com/', 1),
  ('Puzzle', 'A Short Hike', 'https://adamgryu.itch.io/a-short-hike', 1),
  ('Puzzle', 'Return of the Obra Dinn', 'https://www.diegeticgames.com/', 1),
  ('Puzzle', 'The Swapper', 'https://theswapper.com/', 1),
  ('Puzzle', 'Outer Wilds', 'https://www.outerwilds.com/', 1),
  ('Puzzle', 'Deus Ex Machina', 'https://deusexmachina.game/', 1),

  ('Horreur', 'Resident Evil 9', 'https://www.residentevil.com/', 1),
  ('Horreur', 'Dead Space Remake', 'https://www.ea.com/games/dead-space', 1),
  ('Horreur', 'Alan Wake 2', 'https://www.alanwake.com/', 1),
  ('Horreur', 'Evil Within 2', 'https://www.theevilwithin.com/', 1),
  ('Horreur', 'Outlast 3', 'https://www.outlastgame.com/', 1),
  ('Horreur', 'Amnesia: The Bunker', 'https://www.amnesiathebunker.com/', 1),
  ('Horreur', 'Five Nights at Freddy''s', 'https://www.fivenightsatfreddys.com/', 1),
  ('Horreur', 'Layers of Fear', 'https://layersoffear.com/', 1),
  ('Horreur', 'Phasmophobia', 'https://www.phasmophobiagame.com/', 1),
  ('Horreur', 'The Callisto Protocol', 'https://www.callistoprotocol.com/', 1),

  ('Indie', 'Stardew Valley', 'https://www.stardewvalley.net/', 1),
  ('Indie', 'Hollow Knight: Silksong', 'https://www.hollowknight.com/silksong/', 1),
  ('Indie', 'Hades', 'https://www.supergiantgames.com/games/hades/', 1),
  ('Indie', 'Stray', 'https://www.playstation.com/games/stray/', 1),
  ('Indie', 'Coffee Talk', 'https://coffeetal.k.com/', 1),
  ('Indie', 'Gris', 'https://nomada.studio/gris/', 1),
  ('Indie', 'Inside', 'https://www.playinside.com/', 1),
  ('Indie', 'Limbo', 'https://www.playlimbo.com/', 1),
  ('Indie', 'Night in the Woods', 'https://nightinthewoods.com/', 1),
  ('Indie', 'Undertale', 'https://undertale.com/', 1)

ON DUPLICATE KEY UPDATE
  lien = VALUES(lien),
  is_external = VALUES(is_external);
