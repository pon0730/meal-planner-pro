import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Family members table - stores information about each family member
 */
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  age: int("age"),
  allergies: json("allergies").$type<string[]>(),
  dislikes: json("dislikes").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

/**
 * Nutrition goals table - stores daily nutrition targets for the family
 */
export const nutritionGoals = mysqlTable("nutrition_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  dailyCalories: int("dailyCalories").notNull().default(2000),
  proteinGrams: int("proteinGrams").notNull().default(60),
  fatGrams: int("fatGrams").notNull().default(60),
  carbsGrams: int("carbsGrams").notNull().default(250),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NutritionGoal = typeof nutritionGoals.$inferSelect;
export type InsertNutritionGoal = typeof nutritionGoals.$inferInsert;

/**
 * Meal patterns table - stores which meals to prepare on which days
 */
export const mealPatterns = mysqlTable("meal_patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dayOfWeek: mysqlEnum("dayOfWeek", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).notNull(),
  breakfast: boolean("breakfast").notNull().default(true),
  lunch: boolean("lunch").notNull().default(true),
  dinner: boolean("dinner").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MealPattern = typeof mealPatterns.$inferSelect;
export type InsertMealPattern = typeof mealPatterns.$inferInsert;

/**
 * Recipes table - stores recipe information
 */
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  servings: int("servings").notNull().default(2),
  prepTimeMinutes: int("prepTimeMinutes").notNull(),
  cookTimeMinutes: int("cookTimeMinutes").notNull(),
  calories: int("calories").notNull(),
  protein: int("protein").notNull(),
  fat: int("fat").notNull(),
  carbs: int("carbs").notNull(),
  ingredients: json("ingredients").$type<Array<{name: string, amount: string, unit: string, category: string}>>().notNull(),
  instructions: json("instructions").$type<string[]>().notNull(),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner"]).notNull(),
  pattern: mysqlEnum("pattern", ["balanced", "quick", "healthy", "kids", "elderly"]).notNull().default("balanced"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

/**
 * Weekly menus table - stores generated weekly meal plans
 */
export const weeklyMenus = mysqlTable("weekly_menus", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekStartDate: timestamp("weekStartDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyMenu = typeof weeklyMenus.$inferSelect;
export type InsertWeeklyMenu = typeof weeklyMenus.$inferInsert;

/**
 * Menu items table - stores individual meals in a weekly menu
 */
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  weeklyMenuId: int("weeklyMenuId").notNull(),
  recipeId: int("recipeId").notNull(),
  dayOfWeek: mysqlEnum("dayOfWeek", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).notNull(),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Shopping lists table - stores shopping lists generated from weekly menus
 */
export const shoppingLists = mysqlTable("shopping_lists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weeklyMenuId: int("weeklyMenuId").notNull(),
  shoppingFrequency: mysqlEnum("shoppingFrequency", ["weekly", "twice_weekly", "three_times_weekly"]).notNull().default("weekly"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = typeof shoppingLists.$inferInsert;

/**
 * Shopping list items table - stores individual items in a shopping list
 */
export const shoppingListItems = mysqlTable("shopping_list_items", {
  id: int("id").autoincrement().primaryKey(),
  shoppingListId: int("shoppingListId").notNull(),
  ingredientName: varchar("ingredientName", { length: 200 }).notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tripNumber: int("tripNumber").notNull().default(1),
  checked: boolean("checked").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = typeof shoppingListItems.$inferInsert;


/**
 * Shopping list item recipes mapping - tracks which recipes use each ingredient
 */
export const shoppingListItemRecipes = mysqlTable("shopping_list_item_recipes", {
  id: int("id").autoincrement().primaryKey(),
  shoppingListItemId: int("shoppingListItemId").notNull(),
  recipeId: int("recipeId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShoppingListItemRecipe = typeof shoppingListItemRecipes.$inferSelect;
export type InsertShoppingListItemRecipe = typeof shoppingListItemRecipes.$inferInsert;

/**
 * Ingredient inventory table - tracks purchased ingredients and their shelf life
 */
export const ingredientInventory = mysqlTable("ingredient_inventory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ingredientName: varchar("ingredientName", { length: 200 }).notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  shelfLifeDays: int("shelfLifeDays").notNull().default(7),
  purchaseDate: timestamp("purchaseDate").notNull(),
  expiryDate: timestamp("expiryDate").notNull(),
  usedAmount: varchar("usedAmount", { length: 50 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IngredientInventory = typeof ingredientInventory.$inferSelect;
export type InsertIngredientInventory = typeof ingredientInventory.$inferInsert;

/**
 * Ingredient shelf life reference table - stores default shelf life for common ingredients
 */
export const ingredientShelfLife = mysqlTable("ingredient_shelf_life", {
  id: int("id").autoincrement().primaryKey(),
  ingredientName: varchar("ingredientName", { length: 200 }).notNull().unique(),
  category: varchar("category", { length: 100 }).notNull(),
  shelfLifeDays: int("shelfLifeDays").notNull(),
  storageMethod: varchar("storageMethod", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IngredientShelfLife = typeof ingredientShelfLife.$inferSelect;
export type InsertIngredientShelfLife = typeof ingredientShelfLife.$inferInsert;
