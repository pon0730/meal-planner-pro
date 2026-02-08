import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Recipe Patterns", () => {
  it("should list all recipe patterns", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const patterns = await caller.patterns.list();

    expect(patterns).toBeDefined();
    expect(patterns).toHaveLength(5);
    expect(patterns[0]).toHaveProperty("id");
    expect(patterns[0]).toHaveProperty("name");
    expect(patterns[0]).toHaveProperty("description");
  });
});

describe("Menu Generation", () => {
  it.skip("should generate a weekly menu", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const menu = await caller.menu.generate();

    expect(menu).toBeDefined();
    expect(menu.items).toBeDefined();
    expect(Array.isArray(menu.items)).toBe(true);
    expect(menu.userId).toBe(1);
  });

  it.skip("should retrieve the latest menu", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Generate a menu first
    await caller.menu.generate();

    const latestMenu = await caller.menu.getLatest();

    expect(latestMenu).toBeDefined();
    if (latestMenu) {
      expect(latestMenu.userId).toBe(1);
      expect(latestMenu.items).toBeDefined();
    }
  });
});

describe("Family Management", () => {
  it("should create a family member", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const member = await caller.family.create({
      name: "Test Member",
      age: 30,
      allergies: ["卵"],
      dislikes: ["セロリ"],
    });

    expect(member).toBeDefined();
    expect(member.name).toBe("Test Member");
    expect(member.age).toBe(30);
    expect(member.userId).toBe(1);
  });

  it("should list family members", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const members = await caller.family.list();

    expect(Array.isArray(members)).toBe(true);
  });
});

describe("Nutrition Goals", () => {
  it("should upsert nutrition goals", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const goal = await caller.nutrition.upsert({
      dailyCalories: 2000,
      proteinGrams: 60,
      fatGrams: 60,
      carbsGrams: 250,
    });

    expect(goal).toBeDefined();
    expect(goal.dailyCalories).toBe(2000);
    expect(goal.proteinGrams).toBe(60);
    expect(goal.userId).toBe(1);
  });

  it("should retrieve nutrition goals", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Upsert first
    await caller.nutrition.upsert({
      dailyCalories: 2000,
      proteinGrams: 60,
      fatGrams: 60,
      carbsGrams: 250,
    });

    const goal = await caller.nutrition.get();

    expect(goal).toBeDefined();
    if (goal) {
      expect(goal.dailyCalories).toBe(2000);
    }
  });
});

describe("Shopping List", () => {
  it.skip("should generate a shopping list from menu", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Generate menu first
    const menu = await caller.menu.generate();

    // Generate shopping list
    const shoppingList = await caller.shopping.generate({
      weeklyMenuId: menu.id,
      shoppingFrequency: "weekly",
    });

    expect(shoppingList).toBeDefined();
    expect(shoppingList.items).toBeDefined();
    expect(Array.isArray(shoppingList.items)).toBe(true);
    expect(shoppingList.items.length).toBeGreaterThan(0);
  });

  it.skip("should toggle shopping list item checked status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Generate menu and shopping list
    const menu = await caller.menu.generate();
    const shoppingList = await caller.shopping.generate({
      weeklyMenuId: menu.id,
      shoppingFrequency: "weekly",
    });

    const firstItem = shoppingList.items[0];
    if (firstItem) {
      const toggledItem = await caller.shopping.toggleItem({
        itemId: firstItem.id,
        checked: true,
      });

      expect(toggledItem.checked).toBe(true);
    }
  });
});
