CREATE DATABASE IF NOT EXISTS `SecureNote`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_uca1400_ai_ci;

USE `SecureNote`;

CREATE TABLE `notes` (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`uid` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NULL DEFAULT current_timestamp(),
	`updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`),
	KEY `idx_notes_uid` (`uid`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_uca1400_ai_ci;
