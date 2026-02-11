import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import * as db from './db';

describe('menu.saveSkippedMeals', () => {
  let testUserId: number;
  let testWeeklyMenuId: number;
  let testMenuItemIds: number[];

  beforeAll(async () => {
    // テストユーザーを作成
    await db.upsertUser({
      openId: 'test-skipped-meals-user',
      name: 'Test User',
      email: 'test@example.com',
    });
    const user = await db.getUserByOpenId('test-skipped-meals-user');
    if (!user) throw new Error('Test user not found');
    testUserId = user.id;

    // テスト用の献立を作成
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const menu = await db.createWeeklyMenu({
      userId: testUserId,
      weekStartDate: weekStart,
    });
    testWeeklyMenuId = menu.id;

    // テスト用のレシピを作成
    const recipes = await db.createRecipes([
      {
        name: 'テストレシピ1',
        description: 'テスト用のレシピ',
        servings: 2,
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        calories: 500,
        protein: 20,
        fat: 15,
        carbs: 60,
        ingredients: [
          { name: '鶏肉', amount: '200', unit: 'g', category: '肉類' },
          { name: 'にんじん', amount: '1', unit: '本', category: '野菜' },
        ],
        instructions: ['手順1', '手順2'],
        mealType: 'dinner',
        pattern: 'balanced',
      },
      {
        name: 'テストレシピ2',
        description: 'テスト用のレシピ2',
        servings: 2,
        prepTimeMinutes: 15,
        cookTimeMinutes: 25,
        calories: 600,
        protein: 25,
        fat: 20,
        carbs: 70,
        ingredients: [
          { name: '豚肉', amount: '150', unit: 'g', category: '肉類' },
          { name: 'キャベツ', amount: '1/4', unit: '個', category: '野菜' },
        ],
        instructions: ['手順1', '手順2'],
        mealType: 'lunch',
        pattern: 'balanced',
      },
    ]);

    // テスト用のメニューアイテムを作成
    const menuItems = await Promise.all([
      db.createMenuItem({
        weeklyMenuId: testWeeklyMenuId,
        recipeId: recipes[0].id,
        dayOfWeek: 'monday',
        mealType: 'dinner',
      }),
      db.createMenuItem({
        weeklyMenuId: testWeeklyMenuId,
        recipeId: recipes[1].id,
        dayOfWeek: 'tuesday',
        mealType: 'lunch',
      }),
    ]);

    testMenuItemIds = menuItems.map(item => item.id);
  });

  it('should save skipped meals and return leftover ingredients', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-skipped-meals-user', name: 'Test User', email: 'test@example.com', role: 'user' },
    });

    const result = await caller.menu.saveSkippedMeals({
      weeklyMenuId: testWeeklyMenuId,
      menuItemIds: [testMenuItemIds[0]],
    });

    expect(result.success).toBe(true);
    expect(result.skippedCount).toBe(1);
    expect(result.leftoverIngredients).toBeDefined();
    expect(result.leftoverIngredients.length).toBeGreaterThan(0);
    expect(result.leftoverIngredients[0]).toHaveProperty('name');
    expect(result.leftoverIngredients[0]).toHaveProperty('amount');
  });

  it('should handle multiple skipped meals', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-skipped-meals-user', name: 'Test User', email: 'test@example.com', role: 'user' },
    });

    const result = await caller.menu.saveSkippedMeals({
      weeklyMenuId: testWeeklyMenuId,
      menuItemIds: testMenuItemIds,
    });

    expect(result.success).toBe(true);
    expect(result.skippedCount).toBe(2);
    expect(result.leftoverIngredients.length).toBeGreaterThan(0);
  });

  it('should return empty leftover ingredients for empty input', async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: 'test-skipped-meals-user', name: 'Test User', email: 'test@example.com', role: 'user' },
    });

    const result = await caller.menu.saveSkippedMeals({
      weeklyMenuId: testWeeklyMenuId,
      menuItemIds: [],
    });

    expect(result.success).toBe(true);
    expect(result.skippedCount).toBe(0);
    expect(result.leftoverIngredients.length).toBe(0);
  });
});
