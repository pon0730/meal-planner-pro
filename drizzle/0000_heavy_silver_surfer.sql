CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`age` int,
	`allergies` json,
	`dislikes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dayOfWeek` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
	`breakfast` boolean NOT NULL DEFAULT true,
	`lunch` boolean NOT NULL DEFAULT true,
	`dinner` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`weeklyMenuId` int NOT NULL,
	`recipeId` int NOT NULL,
	`dayOfWeek` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
	`mealType` enum('breakfast','lunch','dinner') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrition_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dailyCalories` int NOT NULL DEFAULT 2000,
	`proteinGrams` int NOT NULL DEFAULT 60,
	`fatGrams` int NOT NULL DEFAULT 60,
	`carbsGrams` int NOT NULL DEFAULT 250,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nutrition_goals_id` PRIMARY KEY(`id`),
	CONSTRAINT `nutrition_goals_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`servings` int NOT NULL DEFAULT 2,
	`prepTimeMinutes` int NOT NULL,
	`cookTimeMinutes` int NOT NULL,
	`calories` int NOT NULL,
	`protein` int NOT NULL,
	`fat` int NOT NULL,
	`carbs` int NOT NULL,
	`ingredients` json NOT NULL,
	`instructions` json NOT NULL,
	`mealType` enum('breakfast','lunch','dinner') NOT NULL,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopping_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shoppingListId` int NOT NULL,
	`ingredientName` varchar(200) NOT NULL,
	`amount` varchar(50) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`category` varchar(100) NOT NULL,
	`tripNumber` int NOT NULL DEFAULT 1,
	`checked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopping_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopping_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyMenuId` int NOT NULL,
	`shoppingFrequency` enum('weekly','twice_weekly','three_times_weekly') NOT NULL DEFAULT 'weekly',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopping_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `weekly_menus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStartDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_menus_id` PRIMARY KEY(`id`)
);
