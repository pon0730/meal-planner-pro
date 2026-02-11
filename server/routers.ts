import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { RECIPE_PATTERNS } from "./patterns";
import { generateTrendRecipes } from "./llmRecipeGenerator";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Family Members
  family: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFamilyMembers(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        age: z.number().optional(),
        allergies: z.array(z.string()).optional(),
        dislikes: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createFamilyMember({
          userId: ctx.user.id,
          name: input.name,
          age: input.age,
          allergies: input.allergies || null,
          dislikes: input.dislikes || null,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        age: z.number().optional(),
        allergies: z.array(z.string()).optional(),
        dislikes: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.age !== undefined) updateData.age = input.age;
        if (input.allergies !== undefined) updateData.allergies = input.allergies;
        if (input.dislikes !== undefined) updateData.dislikes = input.dislikes;
        
        return await db.updateFamilyMember(input.id, updateData);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteFamilyMember(input.id);
        return { success: true };
      }),
  }),

  // Nutrition Goals
  nutrition: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNutritionGoal(ctx.user.id);
    }),
    
    upsert: protectedProcedure
      .input(z.object({
        dailyCalories: z.number(),
        proteinGrams: z.number(),
        fatGrams: z.number(),
        carbsGrams: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.upsertNutritionGoal({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Meal Patterns
  mealPatterns: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMealPatterns(ctx.user.id);
    }),
    
    upsert: protectedProcedure
      .input(z.object({
        dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        breakfast: z.boolean(),
        lunch: z.boolean(),
        dinner: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.upsertMealPattern({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Recipes
  recipes: router({
    list: publicProcedure.query(async () => {
      return await db.getAllRecipes();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getRecipeById(input.id);
      }),
    
    getByMealType: publicProcedure
      .input(z.object({ mealType: z.enum(['breakfast', 'lunch', 'dinner']) }))
      .query(async ({ input }) => {
        return await db.getRecipesByMealType(input.mealType);
      }),    
    generateTrendRecipes: protectedProcedure
      .input(z.object({
        count: z.number().min(1).max(20).optional().default(10),
        pattern: z.enum(['balanced', 'quick', 'healthy', 'kids', 'elderly']).optional().default('balanced'),
      }))
      .mutation(async ({ input }) => {
        try {
          const generatedRecipes = await generateTrendRecipes(input.count, input.pattern);
          const savedRecipes = await db.createRecipes(
            generatedRecipes.map(recipe => ({
              name: recipe.name,
              description: recipe.description,
              servings: recipe.servings,
              prepTimeMinutes: recipe.prepTimeMinutes,
              cookTimeMinutes: recipe.cookTimeMinutes,
              calories: recipe.calories,
              protein: recipe.protein,
              fat: recipe.fat,
              carbs: recipe.carbs,
              ingredients: recipe.ingredients,
              instructions: recipe.instructions,
              mealType: recipe.mealType,
              pattern: recipe.pattern,
              imageUrl: recipe.imageUrl || null,
            }))
          );
          return { success: true, count: savedRecipes.length, recipes: savedRecipes };
        } catch (error) {
          console.error('Error generating trend recipes:', error);
          throw new Error('レシピ生成に失敗しました');
        }
      }),
  }),

  // Weekly Menus
  menu: router({
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      const menu = await db.getLatestWeeklyMenu(ctx.user.id);
      if (!menu) return null;
      
      const items = await db.getMenuItems(menu.id);
      const itemsWithRecipes = await Promise.all(
        items.map(async (item) => {
          const recipe = await db.getRecipeById(item.recipeId);
          return { ...item, recipe };
        })
      );
      
      return { ...menu, items: itemsWithRecipes };
    }),
    
    generate: protectedProcedure
      .input(z.object({ pattern: z.enum(['balanced', 'quick', 'healthy', 'kids', 'elderly']).optional() }))
      .mutation(async ({ ctx, input }) => {
      const mealPatterns = await db.getMealPatterns(ctx.user.id);
      const familyMembers = await db.getFamilyMembers(ctx.user.id);
      
      // デフォルトのパターンを作成（すべての曜日で3食）
      const defaultPatterns = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
      ].map(day => ({
        dayOfWeek: day as any,
        breakfast: true,
        lunch: true,
        dinner: true,
      }));
      
      const patterns = mealPatterns.length > 0 ? mealPatterns : defaultPatterns;
      
      // 家族のアレルギー情報を収集
      const allergies = familyMembers.flatMap(m => (m.allergies as string[]) || []);
      
      // 週の開始日を取得
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);
      
      // 週間メニューを作成
      const menu = await db.createWeeklyMenu({
        userId: ctx.user.id,
        weekStartDate: weekStart,
      });
      
      // 前週の余った食材を取得
      const previousWeekStart = new Date(weekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousWeekMenu = await db.getWeeklyMenuByDate(ctx.user.id, previousWeekStart);
      const leftoverIngredients = new Set<string>();
      
      if (previousWeekMenu) {
        // 前週で使用された食材を取得
        const previousMenuItems = await db.getMenuItems(previousWeekMenu.id);
        for (const item of previousMenuItems) {
          const recipe = await db.getRecipeById(item.recipeId);
          if (recipe && recipe.ingredients) {
            const ingredients = recipe.ingredients as Array<{name: string}>;
            ingredients.forEach(ing => leftoverIngredients.add(ing.name));
          }
        }
      }
      
      // 選択されたパターンのレシピを取得
      const selectedPattern = input?.pattern || 'balanced';
      const allPatternRecipes = await db.getRecipesByPattern(selectedPattern);
      
      // 各曜日の各食事に対してレシピを割り当て
      const usedRecipeIds = new Set<number>();
      
      for (const pattern of patterns) {
        const mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = [];
        if (pattern.breakfast) mealTypes.push('breakfast');
        if (pattern.lunch) mealTypes.push('lunch');
        if (pattern.dinner) mealTypes.push('dinner');
        
        for (const mealType of mealTypes) {
          // パターン内でmealTypeに合致するレシピを取得
          const patternRecipes = allPatternRecipes.filter(r => r.mealType === mealType);
          const recipes = patternRecipes.length > 0 ? patternRecipes : await db.getRecipesByMealType(mealType);
          
          // アレルギー対応：材料にアレルギー物質が含まれていないレシピを選択
          const safeRecipes = recipes.filter(recipe => {
            const ingredients = recipe.ingredients as Array<{name: string, amount: string, unit: string, category: string}>;
            return !ingredients.some(ing => 
              allergies.some(allergy => ing.name.includes(allergy))
            );
          });
          
          const availableRecipes = safeRecipes.length > 0 ? safeRecipes : recipes;
          
          // 未使用のレシピを優先的に選択
          const unusedRecipes = availableRecipes.filter(r => !usedRecipeIds.has(r.id));
          const candidateRecipes = unusedRecipes.length > 0 ? unusedRecipes : availableRecipes;
          
          if (candidateRecipes.length > 0) {
            const randomRecipe = candidateRecipes[Math.floor(Math.random() * candidateRecipes.length)];
            usedRecipeIds.add(randomRecipe.id);
            await db.createMenuItem({
              weeklyMenuId: menu.id,
              recipeId: randomRecipe.id,
              dayOfWeek: pattern.dayOfWeek as any,
              mealType,
            });
          }
        }
      }
      
      // 生成されたメニューを返す
      const items = await db.getMenuItems(menu.id);
      const itemsWithRecipes = await Promise.all(
        items.map(async (item) => {
          const recipe = await db.getRecipeById(item.recipeId);
          return { ...item, recipe };
        })
      );
      
      return { ...menu, items: itemsWithRecipes };
    }),
    
    replaceItem: protectedProcedure
      .input(z.object({
        menuItemId: z.number(),
        newRecipeId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateMenuItem(input.menuItemId, input.newRecipeId);
      }),
  }),

  // Shopping Lists
  shopping: router({
    getByMenuId: protectedProcedure
      .input(z.object({ weeklyMenuId: z.number() }))
      .query(async ({ input }) => {
        const list = await db.getShoppingListByMenuId(input.weeklyMenuId);
        if (!list) return null;
        
        const items = await db.getShoppingListItems(list.id);
        return { ...list, items };
      }),
    
    generate: protectedProcedure
      .input(z.object({
        weeklyMenuId: z.number(),
        shoppingFrequency: z.enum(['weekly', 'twice_weekly', 'three_times_weekly']).default('weekly'),
      }))
      .mutation(async ({ ctx, input }) => {
        const menu = await db.getWeeklyMenuById(input.weeklyMenuId);
        if (!menu) throw new Error('Menu not found');
        
        const menuItems = await db.getMenuItems(input.weeklyMenuId);
        const familyMembers = await db.getFamilyMembers(ctx.user.id);
        const familySize = familyMembers.length || 2;
        
        // 既存の買い物リストを削除
        const existingList = await db.getShoppingListByMenuId(input.weeklyMenuId);
        if (existingList) {
          await db.deleteShoppingListItems(existingList.id);
        }
        
        // 新しい買い物リストを作成
        const shoppingList = existingList || await db.createShoppingList({
          userId: ctx.user.id,
          weeklyMenuId: input.weeklyMenuId,
          shoppingFrequency: input.shoppingFrequency,
        });
        
        // 食材を集計
        const ingredientMap = new Map<string, {
          name: string;
          totalAmount: number;
          unit: string;
          category: string;
        }>();
        
        for (const item of menuItems) {
          const recipe = await db.getRecipeById(item.recipeId);
          if (!recipe) continue;
          
          const ingredients = recipe.ingredients as Array<{name: string, amount: string, unit: string, category: string}>;
          const servingRatio = familySize / recipe.servings;
          
          for (const ing of ingredients) {
            const key = `${ing.name}-${ing.unit}`;
            const amount = parseFloat(ing.amount) || 0;
            const scaledAmount = amount * servingRatio;
            
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              existing.totalAmount += scaledAmount;
            } else {
              ingredientMap.set(key, {
                name: ing.name,
                totalAmount: scaledAmount,
                unit: ing.unit,
                category: ing.category,
              });
            }
          }
        }
        
        // 買い物頻度に基づいて食材を分割
        const perishableCategories = ['野菜', '果物', '魚類', '肉類'];
        const tripsCount = input.shoppingFrequency === 'weekly' ? 1 
                         : input.shoppingFrequency === 'twice_weekly' ? 2 
                         : 3;
        
        for (const [, ing] of Array.from(ingredientMap.entries())) {
          const isPerishable = perishableCategories.includes(ing.category);
          const tripNumber = isPerishable && tripsCount > 1 
            ? Math.ceil(Math.random() * tripsCount) 
            : 1;
          
          await db.createShoppingListItem({
            shoppingListId: shoppingList.id,
            ingredientName: ing.name,
            amount: ing.totalAmount.toFixed(1),
            unit: ing.unit,
            category: ing.category,
            tripNumber,
            checked: false,
          });
        }
        
        const items = await db.getShoppingListItems(shoppingList.id);
        return { ...shoppingList, items };
      }),
    
    toggleItem: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        checked: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        return await db.toggleShoppingListItemChecked(input.itemId, input.checked);
      }),
    
    updateFrequency: protectedProcedure
      .input(z.object({
        shoppingListId: z.number(),
        frequency: z.enum(['weekly', 'twice_weekly', 'three_times_weekly']),
      }))
      .mutation(async ({ input }) => {
        return await db.updateShoppingListFrequency(input.shoppingListId, input.frequency);
      }),
  }),

  patterns: router({
    list: publicProcedure.query(async () => {
      return RECIPE_PATTERNS;
    }),
    getByPattern: publicProcedure
      .input(z.object({ pattern: z.enum(['balanced', 'quick', 'healthy', 'kids', 'elderly']) }))
      .query(async ({ input }) => {
        return await db.getRecipesByPattern(input.pattern);
      }),
  }),
});

export type AppRouter = typeof appRouter;
