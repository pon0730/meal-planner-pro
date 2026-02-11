import { invokeLLM } from "./_core/llm";

export interface GeneratedRecipe {
  name: string;
  description: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
    category: string;
  }>;
  instructions: string[];
  mealType: "breakfast" | "lunch" | "dinner";
  pattern: "balanced" | "quick" | "healthy" | "kids" | "elderly";
  imageUrl?: string;
}

export async function generateTrendRecipes(
  count: number = 10,
  pattern: "balanced" | "quick" | "healthy" | "kids" | "elderly" = "balanced"
): Promise<GeneratedRecipe[]> {
  const patternDescriptions: Record<string, string> = {
    balanced: "バランスの取れた栄養価の高い日本の家庭料理",
    quick: "調理時間が15分以内の時短メニュー",
    healthy: "低カロリーで高タンパク質の健康志向メニュー",
    kids: "子どもが好む食べやすく栄養価の高いメニュー",
    elderly: "柔らかく消化しやすい高齢者向けメニュー",
  };

  const systemPrompt = `あなたは日本の料理研究家です。ユーザーのリクエストに基づいて、トレンドメニューのレシピを生成します。
必ずJSON形式で以下の構造で返してください：

{
  "recipes": [
    {
      "name": "レシピ名",
      "description": "短い説明",
      "servings": 2,
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 15,
      "calories": 300,
      "protein": 20,
      "fat": 10,
      "carbs": 30,
      "ingredients": [
        {
          "name": "食材名",
          "amount": "100",
          "unit": "g",
          "category": "野菜"
        }
      ],
      "instructions": ["手順1", "手順2"],
      "mealType": "lunch",
      "pattern": "${pattern}"
    }
  ]
}

注意事項：
- 各レシピは実際に調理可能で、材料と手順が明確であること
- 栄養情報は現実的な値を設定すること
- 食材カテゴリは「野菜」「肉」「魚」「穀物」「乳製品」「調味料」などで分類
- 手順は3～8ステップで、具体的で実行可能であること
- 日本の家庭で一般的に入手可能な食材を使用すること`;

  const userPrompt = `${patternDescriptions[pattern]}のレシピを${count}個生成してください。
多様なメニューを生成し、朝食・昼食・夕食をバランスよく含めてください。
最新のトレンドを反映した、人気のあるメニューを優先してください。`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe_generation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recipes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    servings: { type: "number" },
                    prepTimeMinutes: { type: "number" },
                    cookTimeMinutes: { type: "number" },
                    calories: { type: "number" },
                    protein: { type: "number" },
                    fat: { type: "number" },
                    carbs: { type: "number" },
                    ingredients: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          amount: { type: "string" },
                          unit: { type: "string" },
                          category: { type: "string" },
                        },
                        required: ["name", "amount", "unit", "category"],
                      },
                    },
                    instructions: {
                      type: "array",
                      items: { type: "string" },
                    },
                    mealType: { type: "string", enum: ["breakfast", "lunch", "dinner"] },
                    pattern: { type: "string", enum: ["balanced", "quick", "healthy", "kids", "elderly"] },
                  },
                  required: [
                    "name",
                    "description",
                    "servings",
                    "prepTimeMinutes",
                    "cookTimeMinutes",
                    "calories",
                    "protein",
                    "fat",
                    "carbs",
                    "ingredients",
                    "instructions",
                    "mealType",
                    "pattern",
                  ],
                },
              },
            },
            required: ["recipes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM response is empty");
    }

    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed.recipes as GeneratedRecipe[];
  } catch (error) {
    console.error("Error generating recipes with LLM:", error);
    throw error;
  }
}

export async function generateRecipesForAllPatterns(): Promise<GeneratedRecipe[]> {
  const patterns: Array<"balanced" | "quick" | "healthy" | "kids" | "elderly"> = [
    "balanced",
    "quick",
    "healthy",
    "kids",
    "elderly",
  ];

  const allRecipes: GeneratedRecipe[] = [];

  for (const pattern of patterns) {
    try {
      const recipes = await generateTrendRecipes(5, pattern);
      allRecipes.push(...recipes);
    } catch (error) {
      console.error(`Error generating recipes for pattern ${pattern}:`, error);
    }
  }

  return allRecipes;
}
