-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : lun. 31 août 2026 à 10:52
-- Version du serveur : 5.5.68-MariaDB
-- Version de PHP : 7.4.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `jean-denis-saucy_alpha-gaming`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Action'),
(2, 'Aventure'),
(3, 'RPG'),
(4, 'Strategie'),
(5, 'sport'),
(6, 'course'),
(7, 'shooter'),
(8, 'Plateforme'),
(9, 'Puzzle'),
(10, 'Horreur'),
(11, 'Indie'),
(12, 'Action'),
(13, 'Aventure'),
(14, 'RPG'),
(15, 'Strategie'),
(16, 'Sport'),
(17, 'Course'),
(18, 'Shooter'),
(19, 'Plateforme'),
(20, 'Puzzle'),
(21, 'Horreur'),
(22, 'Indie');

-- --------------------------------------------------------

--
-- Structure de la table `games`
--

CREATE TABLE `games` (
  `id` int(10) UNSIGNED NOT NULL,
  `titre_jeu` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lien` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_external` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `categorie_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `games`
--

INSERT INTO `games` (`id`, `titre_jeu`, `lien`, `is_external`, `created_at`, `categorie_id`) VALUES
(1, 'DOOM: Dark Ages', 'https://bethesda.net/en/game/doom', 1, '2026-08-27 12:21:16', 1),
(2, 'Devil May Cry 5', 'https://www.devilmaycry.com/5/us/', 1, '2026-08-27 12:21:16', 1),
(3, 'Ninja Gaiden 4', 'https://teamninja-studio.com/', 1, '2026-08-27 12:21:16', 1),
(4, 'Stellar Blade', 'https://www.playstation.com/games/stellar-blade/', 1, '2026-08-27 12:21:16', 1),
(5, 'God of War Ragnarök', 'https://www.playstation.com/games/god-of-war-ragnarok/', 1, '2026-08-27 12:21:16', 1),
(6, 'Bayonetta 3', 'https://www.nintendo.com/us/store/products/bayonetta-3-switch/', 1, '2026-08-27 12:21:16', 1),
(7, 'Sekiro: Shadows Die Twice', 'https://www.sekirothegame.com/', 1, '2026-08-27 12:21:16', 1),
(8, 'Ghost of Tsushima Director\'s Cut', 'https://www.playstation.com/games/ghost-of-tsushima/', 1, '2026-08-27 12:21:16', 1),
(9, 'Hi-Fi Rush', 'https://hifi-rush.com/', 1, '2026-08-27 12:21:16', 1),
(10, 'Returnal', 'https://www.playstation.com/games/returnal/', 1, '2026-08-27 12:21:16', 1),
(11, 'The Legend of Zelda: Echoes of Wisdom', 'https://www.nintendo.com/', 1, '2026-08-27 12:21:16', 2),
(12, 'Astro Bot', 'https://www.playstation.com/games/astro-bot/', 1, '2026-08-27 12:21:16', 2),
(13, 'Uncharted 4', 'https://www.playstation.com/games/uncharted-4-a-thiefs-end/', 1, '2026-08-27 12:21:16', 2),
(14, 'Indiana Jones and the Great Circle', 'https://indianajones.bethesda.net/', 1, '2026-08-27 12:21:16', 2),
(15, 'The Last of Us Part II Remastered', 'https://www.playstation.com/games/the-last-of-us-part-ii-remastered/', 1, '2026-08-27 12:21:16', 2),
(16, 'A Plague Tale: Requiem', 'https://www.asobostudio.com/games/a-plague-tale-requiem', 1, '2026-08-27 12:21:16', 2),
(17, 'Tchia', 'https://www.tchia.com/', 1, '2026-08-27 12:21:16', 2),
(18, 'Kena: Bridge of Spirits', 'https://www.kenagame.com/', 1, '2026-08-27 12:21:16', 2),
(19, 'Prince of Persia: The Lost Crown', 'https://www.ubisoft.com/game/prince-of-persia/the-lost-crown', 1, '2026-08-27 12:21:16', 2),
(20, 'Life is Strange: Double Exposure', 'https://www.square-enix-games.com/en_US/games/life-is-strange-double-exposure', 1, '2026-08-27 12:21:16', 2),
(21, 'Baldur\'s Gate 3', 'https://baldursgate3.game/', 1, '2026-08-27 12:21:16', 3),
(22, 'Final Fantasy VII Rebirth', 'https://www.playstation.com/games/final-fantasy-vii-rebirth/', 1, '2026-08-27 12:21:16', 3),
(23, 'Dragon\'s Dogma 2', 'https://www.dragons-dogma.com/', 1, '2026-08-27 12:21:16', 3),
(24, 'Metaphor: ReFantazio', 'https://metaphor.atlus.com/', 1, '2026-08-27 12:21:16', 3),
(25, 'Elden Ring: Shadow of the Erdtree', 'https://www.elden-ring.com/', 1, '2026-08-27 12:21:16', 3),
(26, 'Persona 5 Royal', 'https://www.playstation.com/games/persona-5-royal/', 1, '2026-08-27 12:21:16', 3),
(27, 'Cyberpunk 2077', 'https://www.cyberpunk.net/', 1, '2026-08-27 12:21:16', 3),
(28, 'Starfield', 'https://www.bethesda.net/en/game/starfield', 1, '2026-08-27 12:21:16', 3),
(29, 'Dragon Age: The Veilguard', 'https://www.dragonage.com/', 1, '2026-08-27 12:21:16', 3),
(30, 'Xenoblade Chronicles 3', 'https://www.nintendo.com/games/xenoblade-chronicles-3/', 1, '2026-08-27 12:21:16', 3),
(31, 'Civilization VII', 'https://www.civilization.com/', 1, '2026-08-27 12:21:16', 4),
(32, 'Total War: Warhammer III', 'https://www.totalwar.com/', 1, '2026-08-27 12:21:16', 4),
(33, 'StarCraft II', 'https://starcraft2.com/', 1, '2026-08-27 12:21:16', 4),
(34, 'Fire Emblem: Three Houses', 'https://www.nintendo.com/games/fire-emblem-three-houses/', 1, '2026-08-27 12:21:16', 4),
(35, 'XCOM 3', 'https://www.2k.com/xcom/', 1, '2026-08-27 12:21:16', 4),
(36, 'They Are Billions', 'https://www.they-are-billions.com/', 1, '2026-08-27 12:21:16', 4),
(37, 'Dota 2', 'https://www.dota2.com/', 1, '2026-08-27 12:21:16', 4),
(38, 'Heroes of the Storm', 'https://heroesofthestorm.com/', 1, '2026-08-27 12:21:16', 4),
(39, 'Manor Lords', 'https://www.manorlords.com/', 1, '2026-08-27 12:21:16', 4),
(40, 'Crusader Kings III', 'https://www.crusaderkings.com/', 1, '2026-08-27 12:21:16', 4),
(41, 'EA SPORTS FC 26', 'https://www.ea.com/games/ea-sports-fc', 1, '2026-08-27 12:21:16', 5),
(42, 'NBA 2K25', 'https://www.nba2k.com/', 1, '2026-08-27 12:21:16', 5),
(43, 'F1 26', 'https://www.ea.com/games/f1', 1, '2026-08-27 12:21:16', 5),
(44, 'Madden NFL 25', 'https://www.ea.com/games/madden', 1, '2026-08-27 12:21:16', 5),
(45, 'PES 2025', 'https://www.pesworld.com/', 1, '2026-08-27 12:21:16', 5),
(46, 'MLB The Show 25', 'https://theshow.com/', 1, '2026-08-27 12:21:16', 5),
(47, 'UFC 5', 'https://www.ea.com/games/ufc', 1, '2026-08-27 12:21:16', 5),
(48, 'WWE 2K25', 'https://www.wwe2k.com/', 1, '2026-08-27 12:21:16', 5),
(49, 'Riders Republic', 'https://riders-republic.ubisoft.com/', 1, '2026-08-27 12:21:16', 5),
(50, 'Steep', 'https://www.ubisoft.com/en-US/game/steep/', 1, '2026-08-27 12:21:16', 5),
(51, 'Forza Motorsport 8', 'https://forzamotorsport.net/', 1, '2026-08-27 12:21:16', 6),
(52, 'Gran Turismo 7', 'https://www.playstation.com/games/gran-turismo-7/', 1, '2026-08-27 12:21:16', 6),
(53, 'Need for Speed Unbound', 'https://www.ea.com/games/need-for-speed', 1, '2026-08-27 12:21:16', 6),
(54, 'Mario Kart 8 Deluxe', 'https://www.nintendo.com/games/mario-kart-8-deluxe/', 1, '2026-08-27 12:21:16', 6),
(55, 'Crash Team Racing Nitro-Fueled', 'https://www.playstation.com/games/crash-team-racing-nitro-fueled/', 1, '2026-08-27 12:21:16', 6),
(56, 'Sonic Racing', 'https://www.sonicthehedgehog.com/', 1, '2026-08-27 12:21:16', 6),
(57, 'Ridge Racer Unbounded', 'https://ridgeracer.game/', 1, '2026-08-27 12:21:16', 6),
(58, 'Assetto Corsa Competizione', 'https://www.assettocorsa.net/', 1, '2026-08-27 12:21:16', 6),
(59, 'Project Cars 3', 'https://www.projectcarsgame.com/', 1, '2026-08-27 12:21:16', 6),
(60, 'Wangan Midnight Maximum Tune', 'https://wangan.sega.com/', 1, '2026-08-27 12:21:16', 6),
(61, 'Call of Duty: Black Ops 6', 'https://www.callofduty.com/', 1, '2026-08-27 12:21:16', 7),
(62, 'Counter-Strike 2', 'https://www.counter-strike.net/', 1, '2026-08-27 12:21:16', 7),
(63, 'VALORANT', 'https://playvalorant.com/', 1, '2026-08-27 12:21:16', 7),
(64, 'Destiny 2', 'https://www.bungie.net/en/Destiny', 1, '2026-08-27 12:21:16', 7),
(65, 'Rainbow Six Siege', 'https://www.ubisoft.com/en-us/game/rainbow-six/siege', 1, '2026-08-27 12:21:16', 7),
(66, 'Overwatch 2', 'https://overwatch.blizzard.com/', 1, '2026-08-27 12:21:16', 7),
(67, 'Apex Legends', 'https://www.ea.com/games/apex-legends', 1, '2026-08-27 12:21:16', 7),
(68, 'Helldivers 2', 'https://www.playstation.com/games/helldivers-2/', 1, '2026-08-27 12:21:16', 7),
(69, 'Team Fortress 2', 'https://www.teamfortress.com/', 1, '2026-08-27 12:21:16', 7),
(70, 'Warzone', 'https://www.callofduty.com/warzone', 1, '2026-08-27 12:21:16', 7),
(71, 'Astro\'s Playroom', 'https://www.playstation.com/games/astros-playroom/', 1, '2026-08-27 12:21:16', 8),
(72, 'Super Mario Bros. Wonder', 'https://www.nintendo.com/games/super-mario-bros-wonder/', 1, '2026-08-27 12:21:16', 8),
(73, 'Donkey Kong Country Returns', 'https://www.nintendo.com/games/donkey-kong-country-returns/', 1, '2026-08-27 12:21:16', 8),
(74, 'Rayman Legends', 'https://www.ubisoft.com/en-us/game/rayman-legends', 1, '2026-08-27 12:21:16', 8),
(75, 'Kirby and the Forgotten Land', 'https://www.nintendo.com/games/kirby-and-the-forgotten-land/', 1, '2026-08-27 12:21:16', 8),
(76, 'Sonic Frontiers', 'https://www.sonicthehedgehog.com/', 1, '2026-08-27 12:21:16', 8),
(77, 'Celeste', 'https://www.celestegame.com/', 1, '2026-08-27 12:21:16', 8),
(78, 'Dead Cells', 'https://dead-cells.com/', 1, '2026-08-27 12:21:16', 8),
(79, 'Hollow Knight', 'https://www.hollowknight.com/', 1, '2026-08-27 12:21:16', 8),
(80, 'Ori and the Blind Forest', 'https://www.orithegame.com/', 1, '2026-08-27 12:21:16', 8),
(81, 'Portal 2', 'https://www.valvesoftware.com/en/games/portal2/', 1, '2026-08-27 12:21:16', 9),
(82, 'The Witness', 'https://the-witness.com/', 1, '2026-08-27 12:21:16', 9),
(83, 'Tetris Effect', 'https://www.tetriseffect.game/', 1, '2026-08-27 12:21:16', 9),
(84, 'Baba Is You', 'https://hempuli.itch.io/baba-is-you', 1, '2026-08-27 12:21:16', 9),
(85, 'Unpacking', 'https://unpackinggame.com/', 1, '2026-08-27 12:21:16', 9),
(86, 'A Short Hike', 'https://adamgryu.itch.io/a-short-hike', 1, '2026-08-27 12:21:16', 9),
(87, 'Return of the Obra Dinn', 'https://www.diegeticgames.com/', 1, '2026-08-27 12:21:16', 9),
(88, 'The Swapper', 'https://theswapper.com/', 1, '2026-08-27 12:21:16', 9),
(89, 'Outer Wilds', 'https://www.outerwilds.com/', 1, '2026-08-27 12:21:16', 9),
(90, 'Deus Ex Machina', 'https://deusexmachina.game/', 1, '2026-08-27 12:21:16', 9),
(91, 'Resident Evil 9', 'https://www.residentevil.com/', 1, '2026-08-27 12:21:16', 10),
(92, 'Dead Space Remake', 'https://www.ea.com/games/dead-space', 1, '2026-08-27 12:21:16', 10),
(93, 'Alan Wake 2', 'https://www.alanwake.com/', 1, '2026-08-27 12:21:16', 10),
(94, 'Evil Within 2', 'https://www.theevilwithin.com/', 1, '2026-08-27 12:21:16', 10),
(95, 'Outlast 3', 'https://www.outlastgame.com/', 1, '2026-08-27 12:21:16', 10),
(96, 'Amnesia: The Bunker', 'https://www.amnesiathebunker.com/', 1, '2026-08-27 12:21:16', 10),
(97, 'Five Nights at Freddy\'s', 'https://www.fivenightsatfreddys.com/', 1, '2026-08-27 12:21:16', 10),
(98, 'Layers of Fear', 'https://layersoffear.com/', 1, '2026-08-27 12:21:16', 10),
(99, 'Phasmophobia', 'https://www.phasmophobiagame.com/', 1, '2026-08-27 12:21:16', 10),
(100, 'The Callisto Protocol', 'https://www.callistoprotocol.com/', 1, '2026-08-27 12:21:16', 10),
(101, 'Stardew Valley', 'https://www.stardewvalley.net/', 1, '2026-08-27 12:21:16', 11),
(102, 'Hollow Knight: Silksong', 'https://www.hollowknight.com/silksong/', 1, '2026-08-27 12:21:16', 11),
(103, 'Hades', 'https://www.supergiantgames.com/games/hades/', 1, '2026-08-27 12:21:16', 11),
(104, 'Stray', 'https://www.playstation.com/games/stray/', 1, '2026-08-27 12:21:16', 11),
(105, 'Coffee Talk', 'https://coffeetal.k.com/', 1, '2026-08-27 12:21:16', 11),
(106, 'Gris', 'https://nomada.studio/gris/', 1, '2026-08-27 12:21:16', 11),
(107, 'Inside', 'https://www.playinside.com/', 1, '2026-08-27 12:21:16', 11),
(108, 'Limbo', 'https://www.playlimbo.com/', 1, '2026-08-27 12:21:16', 11),
(109, 'Night in the Woods', 'https://nightinthewoods.com/', 1, '2026-08-27 12:21:16', 11),
(110, 'Undertale', 'https://undertale.com/', 1, '2026-08-27 12:21:16', 11);

-- --------------------------------------------------------

--
-- Structure de la table `live_esport`
--

CREATE TABLE `live_esport` (
  `id` int(10) UNSIGNED NOT NULL,
  `league` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `match_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kickoff_time` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `href` varchar(155) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RSS',
  `published_at` datetime DEFAULT NULL,
  `is_external` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `live_esport`
--

INSERT INTO `live_esport` (`id`, `league`, `match_title`, `kickoff_time`, `href`, `source`, `published_at`, `is_external`, `created_at`) VALUES
(1, 'League of Legends', 'Karmine Corp vs G2', '19:00', 'https://lolesports.com/', 'LoL Esports', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(2, 'VALORANT', 'Fnatic vs Heretics', '21:30', 'https://valorantesports.com/', 'VLR', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(3, 'Rocket League', 'Vitality vs BDS', '23:00', 'https://esports.rocketleague.com/', 'RL Esports', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(4, 'CS2', 'NAVI vs FaZe', '20:00', 'https://www.hltv.org/', 'HLTV', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(5, 'Call of Duty', 'OpTic Texas vs Toronto Ultra', '22:00', 'https://callofdutyleague.com/', 'CDL', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(6, 'Overwatch', 'Team Falcons vs Crazy Raccoon', '18:30', 'https://esports.overwatch.com/', 'OWCS', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(7, 'Apex Legends', 'TSM vs Alliance', '20:45', 'https://www.ea.com/games/apex-legends/compete', 'ALGS', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(8, 'PUBG', 'Gen.G vs Soniqs', '21:15', 'https://pubgesports.com/', 'PUBG Esports', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(9, 'Rainbow Six', 'BDS vs W7M', '19:45', 'https://www.ubisoft.com/esports/rainbow-six/siege', 'R6 Esports', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31'),
(10, 'Dota 2', 'Team Spirit vs Gaimin Gladiators', '23:30', 'https://www.dota2.com/esports', 'Dota 2', '2026-08-25 09:44:31', 1, '2026-08-25 07:44:31');

-- --------------------------------------------------------

--
-- Structure de la table `news`
--

CREATE TABLE `news` (
  `id` int(10) UNSIGNED NOT NULL,
  `source` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extrait` text COLLATE utf8mb4_unicode_ci,
  `url` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categorie` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Gaming',
  `reading_time` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2 min',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `news`
--

INSERT INTO `news` (`id`, `source`, `titre`, `extrait`, `url`, `categorie`, `reading_time`, `published_at`, `created_at`) VALUES
(1, 'Alpha Gaming', 'Silksong refait surface: 18 minutes de gameplay diffusees', 'Team Cherry montre enfin un build solide avec de nouveaux biomes, des boss plus agressifs et un systeme de crafting repense.', 'https://www.alpha-gaming.com/silksong-gameplay', 'Inde', '6 min', '2026-08-25 09:44:31', '2026-08-25 07:44:31'),
(2, 'Alpha Gaming', 'GTA VI: Rockstar confirme une bande-annonce orientee mode online', 'Le studio tease des activites de crew en monde ouvert et une economie dynamique plus ambitieuse que sur GTA Online.', 'https://www.alpha-gaming.com/gta-vi-online', 'AAA', '4 min', '2026-08-25 09:44:31', '2026-08-25 07:44:31'),
(3, 'Alpha Gaming', 'Le prochain Zelda miserait sur un monde maritime semi-procedural', 'Selon plusieurs insiders, Nintendo experimenterait une navigation plus libre et des iles evolutives a chaque session.', 'https://www.alpha-gaming.com/zelda-rumeur-maritime', 'Nintendo', '5 min', '2026-08-25 09:44:31', '2026-08-25 07:44:31');

-- --------------------------------------------------------

--
-- Structure de la table `tests_rapides`
--

CREATE TABLE `tests_rapides` (
  `id` int(10) UNSIGNED NOT NULL,
  `titre_jeu` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(3,1) NOT NULL,
  `plateformes` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verdict` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lien` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_external` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `tests_rapides`
--

INSERT INTO `tests_rapides` (`id`, `titre_jeu`, `score`, `plateformes`, `verdict`, `lien`, `is_external`, `created_at`) VALUES
(1, 'DOOM: Dark Ages', '9.2', 'PC / Xbox', 'Brutal, fluide, ultra lisible.', 'https://bethesda.net/en/game/doom', 1, '2026-08-25 07:43:02'),
(2, 'Clair Obscur: Expedition 33', '8.8', 'PC / PS5', 'Direction artistique magistrale.', 'https://www.expedition33.com/', 1, '2026-08-25 07:43:02'),
(3, 'F1 26', '8.1', 'PC / PS5 / Xbox', 'Carriere plus profonde et nerveuse.', 'https://www.ea.com/games/f1', 1, '2026-08-25 07:43:02'),
(4, 'Metaphor: ReFantazio', '9.0', 'PC / PS5 / Xbox', 'Un JRPG dense avec une direction artistique marquante.', 'https://metaphor.atlus.com/', 1, '2026-08-25 07:43:02'),
(5, 'Monster Hunter Wilds', '8.9', 'PC / PS5 / Xbox', 'Des chasses plus spectaculaires et un monde plus vivant.', 'https://www.monsterhunter.com/wilds/', 1, '2026-08-25 07:43:02'),
(6, 'EA SPORTS FC 26', '8.0', 'PC / PS5 / Xbox', 'Gameplay plus propre, progression mode carriere amelioree.', 'https://www.ea.com/games/ea-sports-fc', 1, '2026-08-25 07:43:02'),
(7, 'Helldivers 2', '8.7', 'PC / PS5', 'Coop explosive et sensation de guerre totale reussie.', 'https://www.playstation.com/games/helldivers-2/', 1, '2026-08-25 07:43:02'),
(8, 'Hades II', '9.1', 'PC', 'Roguelike ultra solide, ecriture et rythme exemplaires.', 'https://www.supergiantgames.com/games/hades-ii/', 1, '2026-08-25 07:43:02');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `firstname`, `lastname`, `created_at`) VALUES
(1, 'jd@gmail.com', '$2b$10$J3ij4l1Yz2qonWrKiC6BxeNuv35AAOJhCIXsFUQ5Rfko2vRetZD.S', 'jean-denis', 'saucy', '2026-08-25 07:56:11'),
(2, 'jeandsaucy@gamail.com', '$2b$10$ETJ4txTrkHOtvoZ6SpKDC.b9/4F8ok9YI5Y353WorKLYZDBWnX2bK', 'jean', 'saucy', '2026-08-25 14:00:56');

-- --------------------------------------------------------

--
-- Structure de la table `user_favorite_games`
--

CREATE TABLE `user_favorite_games` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `game_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_games_titre` (`titre_jeu`),
  ADD KEY `idx_games_categories` (`categorie_id`);

--
-- Index pour la table `live_esport`
--
ALTER TABLE `live_esport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_live_esport_href` (`href`),
  ADD KEY `idx_live_esport_league` (`league`),
  ADD KEY `idx_live_esport_published_at` (`published_at`);

--
-- Index pour la table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_news_url` (`url`),
  ADD KEY `idx_news_published_at` (`published_at`),
  ADD KEY `idx_news_categorie` (`categorie`);

--
-- Index pour la table `tests_rapides`
--
ALTER TABLE `tests_rapides`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tests_rapides_titre_jeu` (`titre_jeu`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- Index pour la table `user_favorite_games`
--
ALTER TABLE `user_favorite_games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_favorite_games` (`user_id`,`game_id`),
  ADD KEY `idx_user_favorite_games_user` (`user_id`),
  ADD KEY `idx_user_favorite_games_game` (`game_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT pour la table `live_esport`
--
ALTER TABLE `live_esport`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `tests_rapides`
--
ALTER TABLE `tests_rapides`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `user_favorite_games`
--
ALTER TABLE `user_favorite_games`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `fk_games_categories` FOREIGN KEY (`categorie_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `user_favorite_games`
--
ALTER TABLE `user_favorite_games`
  ADD CONSTRAINT `fk_user_favorite_games_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_favorite_games_games` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
