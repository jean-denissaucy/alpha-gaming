-- Initialisation MySQL pour Alpha Gaming
-- Usage: mysql -u root < init.sql

CREATE DATABASE IF NOT EXISTS `starter_kit`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `alpha-gaming`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Base par defaut du backend (config/db.js): DB_NAME=starter_kit
-- Si vous utilisez DB_NAME=alpha-gaming dans votre .env, remplacez la ligne USE ci-dessous.
USE `alpha-gaming`;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favoris (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  categorie VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favoris_user_categorie (user_id, categorie),
  CONSTRAINT fk_favoris_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favoris_jeux (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  categorie VARCHAR(100) NOT NULL,
  titre_jeu VARCHAR(150) NOT NULL,
  lien VARCHAR(255) NULL,
  is_external TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favoris_jeux_categorie_titre (categorie, titre_jeu),
  KEY idx_favoris_jeux_categorie (categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tests_rapides (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titre_jeu VARCHAR(150) NOT NULL,
  score DECIMAL(3,1) NOT NULL,
  plateformes VARCHAR(150) NOT NULL,
  verdict VARCHAR(255) NOT NULL,
  lien VARCHAR(255) NULL,
  is_external TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tests_rapides_titre_jeu (titre_jeu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_esport (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  league VARCHAR(120) NOT NULL,
  match_title VARCHAR(255) NOT NULL,
  kickoff_time VARCHAR(12) NOT NULL,
  href VARCHAR(500) NOT NULL,
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

SELECT COUNT(*) INTO @has_competition
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'competition';
SET @sql = IF(@has_competition > 0,
  'ALTER TABLE live_esport CHANGE competition league VARCHAR(120) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @has_affiche
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'affiche';
SET @sql = IF(@has_affiche > 0,
  'ALTER TABLE live_esport CHANGE affiche match_title VARCHAR(255) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @has_heure_debut
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'heure_debut';
SET @sql = IF(@has_heure_debut > 0,
  'ALTER TABLE live_esport CHANGE heure_debut kickoff_time VARCHAR(12) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @has_lien
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'lien';
SET @sql = IF(@has_lien > 0,
  'ALTER TABLE live_esport CHANGE lien href VARCHAR(500) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @has_source
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'source';
SET @sql = IF(@has_source = 0,
  'ALTER TABLE live_esport ADD COLUMN source VARCHAR(120) NOT NULL DEFAULT ''RSS'' AFTER href',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @has_published_at
FROM information_schema.columns
WHERE table_schema = @db_name AND table_name = 'live_esport' AND column_name = 'published_at';
SET @sql = IF(@has_published_at = 0,
  'ALTER TABLE live_esport ADD COLUMN published_at DATETIME NULL AFTER source',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE live_esport
SET href = CONCAT('https://example.com/live-esport/', id)
WHERE href IS NULL OR href = '';

ALTER TABLE live_esport
  MODIFY COLUMN league VARCHAR(120) NOT NULL,
  MODIFY COLUMN match_title VARCHAR(255) NOT NULL,
  MODIFY COLUMN kickoff_time VARCHAR(12) NOT NULL,
  MODIFY COLUMN href VARCHAR(500) NOT NULL,
  MODIFY COLUMN source VARCHAR(120) NOT NULL DEFAULT 'RSS';

SELECT COUNT(*) INTO @has_old_unique
FROM information_schema.statistics
WHERE table_schema = @db_name AND table_name = 'live_esport' AND index_name = 'uq_live_esport_competition_affiche';
SET @sql = IF(@has_old_unique > 0,
  'ALTER TABLE live_esport DROP INDEX uq_live_esport_competition_affiche',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DELETE t1
FROM live_esport t1
JOIN live_esport t2 ON t1.href = t2.href AND t1.id > t2.id;

SELECT COUNT(*) INTO @has_uq_href
FROM information_schema.statistics
WHERE table_schema = @db_name AND table_name = 'live_esport' AND index_name = 'uq_live_esport_href';
SET @sql = IF(@has_uq_href = 0,
  'ALTER TABLE live_esport ADD UNIQUE KEY uq_live_esport_href (href)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

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
  url VARCHAR(500) NOT NULL,
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
  ('Prince of Persia: The Lost Crown', 8.6, 'PC / PS5 / Xbox / Switch', 'Metroidvania nerveux, excellent level design.', 'https://www.ubisoft.com/game/prince-of-persia/the-lost-crown', 1),
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
INSERT INTO favoris_jeux (categorie, titre_jeu, lien, is_external)
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

  ('RPG', 'Metaphor: ReFantazio', 'https://metaphor.atlus.com/', 1),
  ('RPG', 'Final Fantasy VII Rebirth', 'https://ffvii.square-enix-games.com/', 1),
  ('RPG', 'Baldur''s Gate 3', 'https://baldursgate3.game/', 1),
  ('RPG', 'Dragon''s Dogma 2', 'https://www.dragonsdogma.com/2/en-us/', 1),
  ('RPG', 'Elden Ring', 'https://en.bandainamcoent.eu/elden-ring/elden-ring', 1),
  ('RPG', 'Persona 5 Royal', 'https://asia.sega.com/p5r/en/', 1),
  ('RPG', 'Dragon Quest XI S', 'https://www.dragonquest.jp/dq11s/', 1),
  ('RPG', 'Xenoblade Chronicles 3', 'https://www.nintendo.com/us/store/products/xenoblade-chronicles-3-switch/', 1),
  ('RPG', 'Tales of Arise', 'https://www.bandainamcoent.com/games/tales-of-arise', 1),
  ('RPG', 'Final Fantasy XVI', 'https://www.finalfantasyxvi.com/', 1),

  ('FPS', 'Counter-Strike 2', 'https://www.counter-strike.net/cs2', 1),
  ('FPS', 'Call of Duty: Black Ops 6', 'https://www.callofduty.com/', 1),
  ('FPS', 'THE FINALS', 'https://www.reachthefinals.com/', 1),
  ('FPS', 'Battlefield 6', 'https://www.ea.com/games/battlefield', 1),
  ('FPS', 'Halo Infinite', 'https://www.halowaypoint.com/halo-infinite', 1),
  ('FPS', 'Overwatch 2', 'https://overwatch.blizzard.com/', 1),
  ('FPS', 'Titanfall 2', 'https://www.ea.com/games/titanfall/titanfall-2', 1),
  ('FPS', 'Destiny 2', 'https://www.bungie.net/7/en/Destiny', 1),
  ('FPS', 'Rainbow Six Siege', 'https://www.ubisoft.com/game/rainbow-six/siege', 1),
  ('FPS', 'DOOM Eternal', 'https://bethesda.net/en/game/doom-eternal', 1),

  ('Battle Royale', 'Fortnite', 'https://www.fortnite.com/', 1),
  ('Battle Royale', 'Apex Legends', 'https://www.ea.com/games/apex-legends', 1),
  ('Battle Royale', 'PUBG: Battlegrounds', 'https://pubg.com/', 1),
  ('Battle Royale', 'Warzone', 'https://www.callofduty.com/warzone', 1),
  ('Battle Royale', 'Fall Guys', 'https://www.fallguys.com/', 1),
  ('Battle Royale', 'NARAKA: BLADEPOINT', 'https://www.narakathegame.com/', 1),
  ('Battle Royale', 'Bloodhunt', 'https://bloodhunt.com/', 1),
  ('Battle Royale', 'Super People', 'https://superpeople.com/', 1),
  ('Battle Royale', 'Realm Royale Reforged', 'https://www.realmroyale.com/', 1),
  ('Battle Royale', 'H1Z1', 'https://www.h1z1.com/', 1),

  ('Sport', 'EA SPORTS FC 26', 'https://www.ea.com/games/ea-sports-fc', 1),
  ('Sport', 'NBA 2K26', 'https://nba.2k.com/', 1),
  ('Sport', 'F1 26', 'https://www.ea.com/games/f1', 1),
  ('Sport', 'UFC 5', 'https://www.ea.com/games/ufc/ufc-5', 1),
  ('Sport', 'Madden NFL 26', 'https://www.ea.com/games/madden-nfl/madden-nfl-26', 1),
  ('Sport', 'NHL 25', 'https://www.ea.com/games/nhl/nhl-25', 1),
  ('Sport', 'MLB The Show 25', 'https://www.theshow.com/', 1),
  ('Sport', 'TopSpin 2K25', 'https://topspin.2k.com/', 1),
  ('Sport', 'WWE 2K25', 'https://wwe.2k.com/', 1),
  ('Sport', 'eFootball 2025', 'https://www.konami.com/efootball/en/', 1),

  ('Course', 'Forza Horizon 5', 'https://forza.net/horizon', 1),
  ('Course', 'Gran Turismo 7', 'https://www.gran-turismo.com/', 1),
  ('Course', 'Need for Speed Unbound', 'https://www.ea.com/games/need-for-speed/need-for-speed-unbound', 1),
  ('Course', 'The Crew Motorfest', 'https://www.ubisoft.com/game/the-crew/motorfest', 1),
  ('Course', 'F1 25', 'https://www.ea.com/games/f1/f1-25', 1),
  ('Course', 'Wreckfest', 'https://wreckfest.thqnordic.com/', 1),
  ('Course', 'Assetto Corsa Competizione', 'https://assettocorsa.gg/competizione/', 1),
  ('Course', 'Hot Wheels Unleashed 2', 'https://hotwheelsunleashed.com/', 1),
  ('Course', 'MotoGP 24', 'https://www.motogp.com/', 1),
  ('Course', 'Burnout Paradise Remastered', 'https://www.ea.com/games/burnout/burnout-paradise-remastered', 1),

  ('Simulation', 'Microsoft Flight Simulator', 'https://www.flightsimulator.com/', 1),
  ('Simulation', 'Euro Truck Simulator 2', 'https://eurotrucksimulator2.com/', 1),
  ('Simulation', 'The Sims 4', 'https://www.ea.com/games/the-sims/the-sims-4', 1),
  ('Simulation', 'Cities: Skylines II', 'https://www.paradoxinteractive.com/games/cities-skylines-ii/about', 1),
  ('Simulation', 'Farming Simulator 25', 'https://www.farming-simulator.com/', 1),
  ('Simulation', 'House Flipper 2', 'https://houseflipper2.com/', 1),
  ('Simulation', 'Train Sim World 5', 'https://www.trainsimworld.com/', 1),
  ('Simulation', 'Planet Coaster 2', 'https://www.planetcoaster.com/', 1),
  ('Simulation', 'Car Mechanic Simulator 2021', 'https://www.carmechanicsimulator.com/', 1),
  ('Simulation', 'Prison Architect 2', 'https://www.paradoxinteractive.com/games/prison-architect-2/about', 1),

  ('Strategie', 'Age of Empires IV', 'https://www.ageofempires.com/games/age-of-empires-iv/', 1),
  ('Strategie', 'StarCraft II', 'https://starcraft2.com/', 1),
  ('Strategie', 'Civilization VI', 'https://civilization.2k.com/civ-vi/', 1),
  ('Strategie', 'Total War: Warhammer III', 'https://www.totalwar.com/games/warhammer-iii/', 1),
  ('Strategie', 'Company of Heroes 3', 'https://www.companyofheroes.com/', 1),
  ('Strategie', 'Crusader Kings III', 'https://www.crusaderkings.com/', 1),
  ('Strategie', 'Anno 1800', 'https://www.anno-union.com/en/anno-1800/', 1),
  ('Strategie', 'XCOM 2', 'https://www.xcom.com/', 1),
  ('Strategie', 'Frostpunk 2', 'https://www.frostpunk2.com/', 1),
  ('Strategie', 'Northgard', 'https://northgard.com/', 1),

  ('Inde', 'Hades II', 'https://www.supergiantgames.com/games/hades-ii/', 1),
  ('Inde', 'Hollow Knight', 'https://www.hollowknight.com/', 1),
  ('Inde', 'Dead Cells', 'https://dead-cells.com/', 1),
  ('Inde', 'Slay the Spire', 'https://www.megacrit.com/', 1),
  ('Inde', 'Balatro', 'https://www.playbalatro.com/', 1),
  ('Inde', 'Celeste', 'https://www.celestegame.com/', 1),
  ('Inde', 'Ori and the Will of the Wisps', 'https://www.orithegame.com/', 1),
  ('Inde', 'Vampire Survivors', 'https://www.vampiresurvivors.com/', 1),
  ('Inde', 'Cult of the Lamb', 'https://www.cultofthelamb.com/', 1),
  ('Inde', 'Tunic', 'https://tunicgame.com/', 1),

  ('MMO', 'World of Warcraft', 'https://worldofwarcraft.blizzard.com/', 1),
  ('MMO', 'Final Fantasy XIV', 'https://na.finalfantasyxiv.com/', 1),
  ('MMO', 'Guild Wars 2', 'https://www.guildwars2.com/', 1),
  ('MMO', 'The Elder Scrolls Online', 'https://www.elderscrollsonline.com/', 1),
  ('MMO', 'New World', 'https://www.newworld.com/', 1),
  ('MMO', 'Black Desert Online', 'https://www.naeu.playblackdesert.com/', 1),
  ('MMO', 'Lost Ark', 'https://www.playlostark.com/', 1),
  ('MMO', 'RuneScape', 'https://www.runescape.com/', 1),
  ('MMO', 'EVE Online', 'https://www.eveonline.com/', 1),
  ('MMO', 'Throne and Liberty', 'https://www.playthroneandliberty.com/', 1),

  ('Horreur', 'Resident Evil 4', 'https://www.residentevil.com/re4/en-us/', 1),
  ('Horreur', 'Alan Wake 2', 'https://www.alanwake.com/', 1),
  ('Horreur', 'Dead Space', 'https://www.ea.com/games/dead-space', 1),
  ('Horreur', 'The Outlast Trials', 'https://redbarrelsgames.com/games/the-outlast-trials/', 1),
  ('Horreur', 'Silent Hill 2', 'https://www.silenthill.com/', 1),
  ('Horreur', 'Resident Evil Village', 'https://www.residentevil.com/village/', 1),
  ('Horreur', 'Amnesia: The Bunker', 'https://www.amnesiathegame.com/', 1),
  ('Horreur', 'Layers of Fear', 'https://www.layersoffear.com/', 1),
  ('Horreur', 'The Casting of Frank Stone', 'https://thecastingoffrankstone.com/', 1),
  ('Horreur', 'Until Dawn', 'https://www.playstation.com/games/until-dawn/', 1)
ON DUPLICATE KEY UPDATE
  lien = VALUES(lien),
  is_external = VALUES(is_external);


-- Seed categories favorites (ajoute des categories pour le premier utilisateur existant)
INSERT INTO favoris (user_id, categorie)
SELECT u.id, c.categorie
FROM (SELECT id FROM users ORDER BY id LIMIT 1) AS u
JOIN (
  SELECT 'Action' AS categorie
  UNION ALL SELECT 'Aventure'
  UNION ALL SELECT 'RPG'
  UNION ALL SELECT 'FPS'
  UNION ALL SELECT 'Battle Royale'
  UNION ALL SELECT 'Sport'
  UNION ALL SELECT 'Course'
  UNION ALL SELECT 'Simulation'
  UNION ALL SELECT 'Strategie'
  UNION ALL SELECT 'Inde'
  UNION ALL SELECT 'MMO'
  UNION ALL SELECT 'Horreur'
) AS c
ON 1 = 1
ON DUPLICATE KEY UPDATE categorie = VALUES(categorie);
