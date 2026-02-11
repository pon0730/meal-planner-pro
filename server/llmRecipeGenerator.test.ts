import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTrendRecipes, GeneratedRecipe } from './llmRecipeGenerator';

// Mock the invokeLLM function
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from './_core/llm';

describe('LLM Recipe Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate recipes with correct structure', async () => {
    const mockRecipes: GeneratedRecipe[] = [
      {
        name: 'テスト料理1',
        description: 'テスト用の料理',
        servings: 2,
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        calories: 300,
        protein: 20,
        fat: 10,
        carbs: 30,
        ingredients: [
          {
            name: 'トマト',
            amount: '100',
            unit: 'g',
            category: '野菜',
          },
        ],
        instructions: ['手順1', '手順2'],
        mealType: 'lunch',
        pattern: 'balanced',
      },
    ];

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ recipes: mockRecipes }),
          },
        },
      ],
    };

    vi.mocked(invokeLLM).mockResolvedValueOnce(mockResponse as any);

    const result = await generateTrendRecipes(1, 'balanced');

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('ingredients');
    expect(result[0]).toHaveProperty('instructions');
    expect(result[0].mealType).toBe('lunch');
    expect(result[0].pattern).toBe('balanced');
  });

  it('should handle different patterns', async () => {
    const patterns = ['balanced', 'quick', 'healthy', 'kids', 'elderly'] as const;

    for (const pattern of patterns) {
      const mockRecipes: GeneratedRecipe[] = [
        {
          name: `${pattern}料理`,
          description: `${pattern}パターンの料理`,
          servings: 2,
          prepTimeMinutes: 10,
          cookTimeMinutes: 15,
          calories: 300,
          protein: 20,
          fat: 10,
          carbs: 30,
          ingredients: [],
          instructions: [],
          mealType: 'lunch',
          pattern: pattern,
        },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ recipes: mockRecipes }),
            },
          },
        ],
      };

      vi.mocked(invokeLLM).mockResolvedValueOnce(mockResponse as any);

      const result = await generateTrendRecipes(1, pattern);

      expect(result[0].pattern).toBe(pattern);
    }
  });

  it('should generate multiple recipes', async () => {
    const mockRecipes: GeneratedRecipe[] = Array.from({ length: 5 }, (_, i) => ({
      name: `料理${i + 1}`,
      description: `テスト料理${i + 1}`,
      servings: 2,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      calories: 300,
      protein: 20,
      fat: 10,
      carbs: 30,
      ingredients: [],
      instructions: [],
      mealType: 'lunch',
      pattern: 'balanced',
    }));

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ recipes: mockRecipes }),
          },
        },
      ],
    };

    vi.mocked(invokeLLM).mockResolvedValueOnce(mockResponse as any);

    const result = await generateTrendRecipes(5, 'balanced');

    expect(result).toHaveLength(5);
    result.forEach((recipe, index) => {
      expect(recipe.name).toBe(`料理${index + 1}`);
    });
  });

  it('should throw error on empty LLM response', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: undefined,
          },
        },
      ],
    };

    vi.mocked(invokeLLM).mockResolvedValueOnce(mockResponse as any);

    await expect(generateTrendRecipes(1, 'balanced')).rejects.toThrow('LLM response is empty');
  });

  it('should validate recipe structure', async () => {
    const mockRecipes: GeneratedRecipe[] = [
      {
        name: 'テスト料理',
        description: 'テスト',
        servings: 2,
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        calories: 300,
        protein: 20,
        fat: 10,
        carbs: 30,
        ingredients: [
          {
            name: '食材1',
            amount: '100',
            unit: 'g',
            category: '野菜',
          },
        ],
        instructions: ['手順1', '手順2', '手順3'],
        mealType: 'dinner',
        pattern: 'healthy',
      },
    ];

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({ recipes: mockRecipes }),
          },
        },
      ],
    };

    vi.mocked(invokeLLM).mockResolvedValueOnce(mockResponse as any);

    const result = await generateTrendRecipes(1, 'healthy');

    expect(result[0].name).toBeTruthy();
    expect(result[0].ingredients).toBeInstanceOf(Array);
    expect(result[0].ingredients.length).toBeGreaterThan(0);
    expect(result[0].instructions).toBeInstanceOf(Array);
    expect(result[0].instructions.length).toBeGreaterThan(0);
    expect(['breakfast', 'lunch', 'dinner']).toContain(result[0].mealType);
    expect(['balanced', 'quick', 'healthy', 'kids', 'elderly']).toContain(result[0].pattern);
  });
});
