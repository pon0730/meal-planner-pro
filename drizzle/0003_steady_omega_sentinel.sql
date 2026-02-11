CREATE TABLE `leftover_ingredients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ingredientName` varchar(200) NOT NULL,
	`amount` varchar(50) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`category` varchar(100) NOT NULL,
	`weekNumber` int NOT NULL,
	`year` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `leftover_ingredients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skipped_meals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weeklyMenuId` int NOT NULL,
	`menuItemId` int NOT NULL,
	`recipeId` int NOT NULL,
	`mealType` enum('breakfast','lunch','dinner') NOT NULL,
	`dayOfWeek` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skipped_meals_id` PRIMARY KEY(`id`)
);
