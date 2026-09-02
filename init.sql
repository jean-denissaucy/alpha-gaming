CREATE DATABASE IF NOT EXISTS `jean-denis-saucy_alpha-gaming` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `jean-denis-saucy_alpha-gaming`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `user_favorite_games`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `notes_gaming`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `live_esport`;
DROP TABLE IF EXISTS `games`;
DROP TABLE IF EXISTS `categories`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `categories` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`id`,`name`) VALUES
(1,'Action'),(2,'Aventure'),(3,'RPG'),(4,'Strategie'),(5,'Sport'),(6,'Course'),(7,'Shooter'),(8,'Plateforme'),(9,'Puzzle'),(10,'Horreur'),(11,'Indie');

CREATE TABLE `games` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre_jeu` varchar(150) NOT NULL,
  `lien` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `is_external` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `categorie_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_games_titre` (`titre_jeu`), KEY `idx_games_categorie_id` (`categorie_id`),
  CONSTRAINT `fk_games_categories` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `news` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `source` varchar(120) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `extrait` text,
  `url` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `categorie` varchar(80) NOT NULL DEFAULT 'Gaming',
  `reading_time` varchar(20) NOT NULL DEFAULT '2 min',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_news_url` (`url`), KEY `idx_news_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notes_gaming` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `source` varchar(120) NOT NULL,
  `titre_jeu` varchar(191) NOT NULL,
  `extrait` text,
  `url` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `score` decimal(3,1) DEFAULT NULL,
  `plateformes` varchar(150) DEFAULT NULL,
  `verdict` varchar(255) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_notes_gaming_url` (`url`), KEY `idx_notes_gaming_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `live_esport` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `source` varchar(120) NOT NULL,
  `game` varchar(80) DEFAULT NULL,
  `league` varchar(120) NOT NULL,
  `match_title` varchar(191) NOT NULL,
  `team_one` varchar(120) DEFAULT NULL,
  `team_two` varchar(120) DEFAULT NULL,
  `kickoff_time` datetime DEFAULT NULL,
  `href` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'upcoming',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_live_esport_href` (`href`), KEY `idx_live_esport_kickoff` (`kickoff_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_favorite_games` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int UNSIGNED NOT NULL,
  `game_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `uq_user_favorite_games` (`user_id`,`game_id`),
  CONSTRAINT `fk_user_favorite_games_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_favorite_games_game` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
