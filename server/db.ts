import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  familyMembers, 
  InsertFamilyMember,
  FamilyMember,
  nutritionGoals,
  InsertNutritionGoal,
  NutritionGoal,
  mealPatterns,
  InsertMealPattern,
  MealPattern,
  recipes,
  Recipe,
  InsertRecipe,
  weeklyMenus,
  InsertWeeklyMenu,
  WeeklyMenu,
  menuItems,
  InsertMenuItem,
  MenuItem,
  shoppingLists,
  InsertShoppingList,
  ShoppingList,
  shoppingListItems,
  InsertShoppingListItem,
  ShoppingListItem
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Family Members
export async function getFamilyMembers(userId: number): Promise<FamilyMember[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(familyMembers).where(eq(familyMembers.userId, userId));
}

export async function createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result: any = await db.insert(familyMembers).values(member);
  const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
  if (isNaN(insertId) || insertId === 0) {
    throw new Error(`Failed to get insert ID`);
  }
  const [created] = await db.select().from(familyMembers).where(eq(familyMembers.id, insertId));
  if (!created) {
    throw new Error('Failed to retrieve created family member');
  }
  return created;
}

export async function updateFamilyMember(id: number, member: Partial<InsertFamilyMember>): Promise<FamilyMember> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(familyMembers).set(member).where(eq(familyMembers.id, id));
  const [updated] = await db.select().from(familyMembers).where(eq(familyMembers.id, id));
  return updated!;
}

export async function deleteFamilyMember(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(familyMembers).where(eq(familyMembers.id, id));
}

// Nutrition Goals
export async function getNutritionGoal(userId: number): Promise<NutritionGoal | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [goal] = await db.select().from(nutritionGoals).where(eq(nutritionGoals.userId, userId));
  return goal;
}

export async function upsertNutritionGoal(goal: InsertNutritionGoal): Promise<NutritionGoal> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(nutritionGoals).values(goal).onDuplicateKeyUpdate({
    set: {
      dailyCalories: goal.dailyCalories,
      proteinGrams: goal.proteinGrams,
      fatGrams: goal.fatGrams,
      carbsGrams: goal.carbsGrams,
    }
  });
  
  const [updated] = await db.select().from(nutritionGoals).where(eq(nutritionGoals.userId, goal.userId));
  return updated!;
}

// Meal Patterns
export async function getMealPatterns(userId: number): Promise<MealPattern[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(mealPatterns).where(eq(mealPatterns.userId, userId));
}

export async function upsertMealPattern(pattern: InsertMealPattern): Promise<MealPattern> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if pattern exists
  const [existing] = await db.select().from(mealPatterns)
    .where(and(
      eq(mealPatterns.userId, pattern.userId),
      eq(mealPatterns.dayOfWeek, pattern.dayOfWeek)
    ));
  
  if (existing) {
    await db.update(mealPatterns)
      .set({
        breakfast: pattern.breakfast,
        lunch: pattern.lunch,
        dinner: pattern.dinner,
      })
      .where(eq(mealPatterns.id, existing.id));
    
    const [updated] = await db.select().from(mealPatterns).where(eq(mealPatterns.id, existing.id));
    return updated!;
  } else {
    const result: any = await db.insert(mealPatterns).values(pattern);
    const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
    if (isNaN(insertId) || insertId === 0) {
      throw new Error('Failed to get insert ID');
    }
    const [created] = await db.select().from(mealPatterns).where(eq(mealPatterns.id, insertId));
    if (!created) {
      throw new Error('Failed to retrieve created meal pattern');
    }
    return created;
  }
}

// Recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recipes);
}

export async function getRecipesByMealType(mealType: 'breakfast' | 'lunch' | 'dinner'): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recipes).where(eq(recipes.mealType, mealType));
}

export async function getRecipeById(id: number): Promise<Recipe | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
  return recipe;
}

// Weekly Menus
export async function getLatestWeeklyMenu(userId: number): Promise<WeeklyMenu | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [menu] = await db.select().from(weeklyMenus)
    .where(eq(weeklyMenus.userId, userId))
    .orderBy(desc(weeklyMenus.createdAt))
    .limit(1);
  return menu;
}

export async function createWeeklyMenu(menu: InsertWeeklyMenu): Promise<WeeklyMenu> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result: any = await db.insert(weeklyMenus).values(menu);
  const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
  if (isNaN(insertId) || insertId === 0) {
    throw new Error('Failed to get insert ID');
  }
  const [created] = await db.select().from(weeklyMenus).where(eq(weeklyMenus.id, insertId));
  if (!created) {
    throw new Error('Failed to retrieve created weekly menu');
  }
  return created;
}

export async function getWeeklyMenuById(id: number): Promise<WeeklyMenu | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [menu] = await db.select().from(weeklyMenus).where(eq(weeklyMenus.id, id));
  return menu;
}

export async function getWeeklyMenuByDate(userId: number, weekStartDate: Date): Promise<WeeklyMenu | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [menu] = await db.select().from(weeklyMenus)
    .where(and(eq(weeklyMenus.userId, userId), eq(weeklyMenus.weekStartDate, weekStartDate)));
  return menu;
}

// Menu Items
export async function getMenuItems(weeklyMenuId: number): Promise<MenuItem[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(menuItems).where(eq(menuItems.weeklyMenuId, weeklyMenuId));
}

export async function createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result: any = await db.insert(menuItems).values(item);
  const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
  if (isNaN(insertId) || insertId === 0) {
    throw new Error('Failed to get insert ID');
  }
  const [created] = await db.select().from(menuItems).where(eq(menuItems.id, insertId));
  if (!created) {
    throw new Error('Failed to retrieve created menu item');
  }
  return created;
}

export async function updateMenuItem(id: number, recipeId: number): Promise<MenuItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(menuItems).set({ recipeId }).where(eq(menuItems.id, id));
  const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  return updated!;
}

export async function deleteMenuItemsByWeeklyMenuId(weeklyMenuId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(menuItems).where(eq(menuItems.weeklyMenuId, weeklyMenuId));
}

// Shopping Lists
export async function getShoppingListByMenuId(weeklyMenuId: number): Promise<ShoppingList | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [list] = await db.select().from(shoppingLists).where(eq(shoppingLists.weeklyMenuId, weeklyMenuId));
  return list;
}

export async function createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result: any = await db.insert(shoppingLists).values(list);
  const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
  if (isNaN(insertId) || insertId === 0) {
    throw new Error('Failed to get insert ID');
  }
  const [created] = await db.select().from(shoppingLists).where(eq(shoppingLists.id, insertId));
  if (!created) {
    throw new Error('Failed to retrieve created shopping list');
  }
  return created;
}

export async function updateShoppingListFrequency(id: number, frequency: 'weekly' | 'twice_weekly' | 'three_times_weekly'): Promise<ShoppingList> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(shoppingLists).set({ shoppingFrequency: frequency }).where(eq(shoppingLists.id, id));
  const [updated] = await db.select().from(shoppingLists).where(eq(shoppingLists.id, id));
  return updated!;
}

// Shopping List Items
export async function getShoppingListItems(shoppingListId: number): Promise<ShoppingListItem[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(shoppingListItems).where(eq(shoppingListItems.shoppingListId, shoppingListId));
}

export async function createShoppingListItem(item: InsertShoppingListItem): Promise<ShoppingListItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result: any = await db.insert(shoppingListItems).values(item);
  const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
  if (isNaN(insertId) || insertId === 0) {
    throw new Error('Failed to get insert ID');
  }
  const [created] = await db.select().from(shoppingListItems).where(eq(shoppingListItems.id, insertId));
  if (!created) {
    throw new Error('Failed to retrieve created shopping list item');
  }
  return created;
}

export async function toggleShoppingListItemChecked(id: number, checked: boolean): Promise<ShoppingListItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(shoppingListItems).set({ checked }).where(eq(shoppingListItems.id, id));
  const [updated] = await db.select().from(shoppingListItems).where(eq(shoppingListItems.id, id));
  return updated!;
}

export async function deleteShoppingListItems(shoppingListId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(shoppingListItems).where(eq(shoppingListItems.shoppingListId, shoppingListId));
}

// Recipe pattern queries
export async function getRecipesByPattern(pattern: 'balanced' | 'quick' | 'healthy' | 'kids' | 'elderly'): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return db.select().from(recipes).where(eq(recipes.pattern, pattern));
}

export async function getRandomRecipesByPattern(pattern: 'balanced' | 'quick' | 'healthy' | 'kids' | 'elderly', limit: number = 7): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const allRecipes = await db.select().from(recipes).where(eq(recipes.pattern, pattern));
  
  // Shuffle and return limited recipes
  const shuffled = allRecipes.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

export async function createRecipe(recipe: InsertRecipe): Promise<Recipe> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const result: any = await db.insert(recipes).values(recipe);
  const insertId = result[0]?.insertId ? Number(result[0].insertId) : NaN;
  if (isNaN(insertId) || insertId === 0) {
    throw new Error('Failed to get insert ID');
  }
  
  const [created] = await db.select().from(recipes).where(eq(recipes.id, insertId));
  if (!created) {
    throw new Error('Failed to retrieve created recipe');
  }
  return created;
}

export async function createRecipes(recipesToCreate: InsertRecipe[]): Promise<Recipe[]> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const createdRecipes: Recipe[] = [];
  for (const recipe of recipesToCreate) {
    const created = await createRecipe(recipe);
    createdRecipes.push(created);
  }
  return createdRecipes;
}
