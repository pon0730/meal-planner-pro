import mysql from 'mysql2/promise';
import 'dotenv/config';

const recipes = [
  // 朝食レシピ
  {
    name: '和風納豆トースト',
    description: '納豆とチーズの組み合わせが美味しい和風トースト',
    servings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    calories: 320,
    protein: 15,
    fat: 12,
    carbs: 38,
    mealType: 'breakfast',
    ingredients: [
      { name: '食パン', amount: '2', unit: '枚', category: 'パン類' },
      { name: '納豆', amount: '1', unit: 'パック', category: '大豆製品' },
      { name: 'スライスチーズ', amount: '2', unit: '枚', category: '乳製品' },
      { name: '青ネギ', amount: '適量', unit: '', category: '野菜' }
    ],
    instructions: [
      '納豆をよく混ぜる',
      '食パンに納豆を塗る',
      'チーズをのせる',
      'トースターで3-4分焼く',
      '青ネギを散らして完成'
    ]
  },
  {
    name: 'オートミール粥',
    description: '栄養満点で消化に良いオートミール粥',
    servings: 2,
    prepTimeMinutes: 3,
    cookTimeMinutes: 7,
    calories: 280,
    protein: 10,
    fat: 8,
    carbs: 42,
    mealType: 'breakfast',
    ingredients: [
      { name: 'オートミール', amount: '80', unit: 'g', category: '穀物' },
      { name: '牛乳', amount: '400', unit: 'ml', category: '乳製品' },
      { name: 'バナナ', amount: '1', unit: '本', category: '果物' },
      { name: 'はちみつ', amount: '大さじ1', unit: '', category: '調味料' }
    ],
    instructions: [
      '鍋に牛乳とオートミールを入れる',
      '中火で5分煮る',
      'バナナをスライスする',
      '器に盛り、バナナとはちみつをトッピング'
    ]
  },
  {
    name: '卵とほうれん草のスクランブル',
    description: 'タンパク質と鉄分が豊富な朝食',
    servings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 5,
    calories: 240,
    protein: 18,
    fat: 16,
    carbs: 6,
    mealType: 'breakfast',
    ingredients: [
      { name: '卵', amount: '4', unit: '個', category: '卵' },
      { name: 'ほうれん草', amount: '100', unit: 'g', category: '野菜' },
      { name: 'バター', amount: '10', unit: 'g', category: '乳製品' },
      { name: '塩', amount: '少々', unit: '', category: '調味料' },
      { name: 'こしょう', amount: '少々', unit: '', category: '調味料' }
    ],
    instructions: [
      'ほうれん草を洗って一口大に切る',
      'フライパンでバターを溶かす',
      'ほうれん草を炒める',
      '溶き卵を加えて混ぜながら加熱',
      '塩こしょうで味を調える'
    ]
  },

  // 昼食レシピ
  {
    name: '鶏むね肉のグリルサラダ',
    description: '高タンパク低脂質のヘルシーサラダ',
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    calories: 380,
    protein: 35,
    fat: 18,
    carbs: 22,
    mealType: 'lunch',
    ingredients: [
      { name: '鶏むね肉', amount: '300', unit: 'g', category: '肉類' },
      { name: 'レタス', amount: '1/2', unit: '個', category: '野菜' },
      { name: 'トマト', amount: '2', unit: '個', category: '野菜' },
      { name: 'きゅうり', amount: '1', unit: '本', category: '野菜' },
      { name: 'オリーブオイル', amount: '大さじ2', unit: '', category: '調味料' },
      { name: 'レモン汁', amount: '大さじ1', unit: '', category: '調味料' },
      { name: '塩', amount: '適量', unit: '', category: '調味料' }
    ],
    instructions: [
      '鶏むね肉に塩をふる',
      'フライパンで両面を焼く',
      '野菜を洗って切る',
      '鶏肉をスライスする',
      'サラダボウルに盛り付け',
      'オリーブオイルとレモン汁をかける'
    ]
  },
  {
    name: '豚肉と野菜の炒め物',
    description: 'ボリューム満点の栄養バランス定食',
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    calories: 420,
    protein: 28,
    fat: 22,
    carbs: 28,
    mealType: 'lunch',
    ingredients: [
      { name: '豚こま切れ肉', amount: '250', unit: 'g', category: '肉類' },
      { name: 'キャベツ', amount: '1/4', unit: '個', category: '野菜' },
      { name: 'にんじん', amount: '1', unit: '本', category: '野菜' },
      { name: 'ピーマン', amount: '2', unit: '個', category: '野菜' },
      { name: '醤油', amount: '大さじ2', unit: '', category: '調味料' },
      { name: 'みりん', amount: '大さじ1', unit: '', category: '調味料' },
      { name: 'ごま油', amount: '大さじ1', unit: '', category: '調味料' }
    ],
    instructions: [
      '野菜を食べやすい大きさに切る',
      'フライパンでごま油を熱する',
      '豚肉を炒める',
      '野菜を加えて炒める',
      '醤油とみりんで味付け'
    ]
  },
  {
    name: 'サバの味噌煮',
    description: 'オメガ3脂肪酸が豊富な健康的な魚料理',
    servings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 20,
    calories: 360,
    protein: 30,
    fat: 20,
    carbs: 15,
    mealType: 'lunch',
    ingredients: [
      { name: 'サバ', amount: '2', unit: '切れ', category: '魚類' },
      { name: '味噌', amount: '大さじ3', unit: '', category: '調味料' },
      { name: '砂糖', amount: '大さじ2', unit: '', category: '調味料' },
      { name: '酒', amount: '大さじ2', unit: '', category: '調味料' },
      { name: '生姜', amount: '1', unit: '片', category: '野菜' },
      { name: '水', amount: '200', unit: 'ml', category: '調味料' }
    ],
    instructions: [
      'サバに熱湯をかけて臭みを取る',
      '鍋に水、酒、生姜を入れて沸騰させる',
      'サバを入れて中火で10分煮る',
      '味噌と砂糖を溶かし入れる',
      'さらに10分煮込む'
    ]
  },

  // 夕食レシピ
  {
    name: '鮭のムニエル',
    description: 'バターの香りが食欲をそそる定番料理',
    servings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    calories: 420,
    protein: 32,
    fat: 26,
    carbs: 18,
    mealType: 'dinner',
    ingredients: [
      { name: '鮭', amount: '2', unit: '切れ', category: '魚類' },
      { name: '小麦粉', amount: '適量', unit: '', category: '穀物' },
      { name: 'バター', amount: '20', unit: 'g', category: '乳製品' },
      { name: 'レモン', amount: '1/2', unit: '個', category: '果物' },
      { name: '塩', amount: '適量', unit: '', category: '調味料' },
      { name: 'こしょう', amount: '適量', unit: '', category: '調味料' }
    ],
    instructions: [
      '鮭に塩こしょうをふる',
      '小麦粉を薄くまぶす',
      'フライパンでバターを溶かす',
      '鮭を両面焼く',
      'レモンを絞って完成'
    ]
  },
  {
    name: '豆腐ハンバーグ',
    description: 'ヘルシーで柔らかい豆腐ハンバーグ',
    servings: 2,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    calories: 340,
    protein: 24,
    fat: 18,
    carbs: 22,
    mealType: 'dinner',
    ingredients: [
      { name: '木綿豆腐', amount: '1', unit: '丁', category: '大豆製品' },
      { name: '鶏ひき肉', amount: '150', unit: 'g', category: '肉類' },
      { name: '玉ねぎ', amount: '1/2', unit: '個', category: '野菜' },
      { name: 'パン粉', amount: '大さじ3', unit: '', category: 'パン類' },
      { name: '卵', amount: '1', unit: '個', category: '卵' },
      { name: '醤油', amount: '大さじ2', unit: '', category: '調味料' },
      { name: 'みりん', amount: '大さじ2', unit: '', category: '調味料' }
    ],
    instructions: [
      '豆腐の水を切る',
      '玉ねぎをみじん切りにする',
      '全ての材料を混ぜる',
      'ハンバーグの形に成形',
      'フライパンで両面を焼く',
      '醤油とみりんでソースを作る'
    ]
  },
  {
    name: '鶏もも肉の照り焼き',
    description: '甘辛いタレが絡んだジューシーな照り焼き',
    servings: 2,
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    calories: 480,
    protein: 35,
    fat: 28,
    carbs: 24,
    mealType: 'dinner',
    ingredients: [
      { name: '鶏もも肉', amount: '2', unit: '枚', category: '肉類' },
      { name: '醤油', amount: '大さじ3', unit: '', category: '調味料' },
      { name: 'みりん', amount: '大さじ3', unit: '', category: '調味料' },
      { name: '砂糖', amount: '大さじ1', unit: '', category: '調味料' },
      { name: '酒', amount: '大さじ2', unit: '', category: '調味料' },
      { name: 'サラダ油', amount: '大さじ1', unit: '', category: '調味料' }
    ],
    instructions: [
      '鶏肉の余分な脂を取る',
      'フライパンで皮目から焼く',
      '裏返して蓋をして蒸し焼き',
      '調味料を全て混ぜる',
      'タレを加えて煮詰める'
    ]
  },
  {
    name: '野菜たっぷりカレー',
    description: '栄養バランスの良い家庭的なカレー',
    servings: 4,
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    calories: 520,
    protein: 22,
    fat: 18,
    carbs: 68,
    mealType: 'dinner',
    ingredients: [
      { name: '豚こま切れ肉', amount: '300', unit: 'g', category: '肉類' },
      { name: 'じゃがいも', amount: '3', unit: '個', category: '野菜' },
      { name: 'にんじん', amount: '2', unit: '本', category: '野菜' },
      { name: '玉ねぎ', amount: '2', unit: '個', category: '野菜' },
      { name: 'カレールー', amount: '1/2', unit: '箱', category: '調味料' },
      { name: 'サラダ油', amount: '大さじ1', unit: '', category: '調味料' },
      { name: '水', amount: '800', unit: 'ml', category: '調味料' }
    ],
    instructions: [
      '野菜を一口大に切る',
      '鍋で肉を炒める',
      '野菜を加えて炒める',
      '水を加えて20分煮込む',
      'カレールーを溶かし入れる',
      'さらに10分煮込む'
    ]
  },
  {
    name: 'アジの南蛮漬け',
    description: 'さっぱりとした味わいの魚料理',
    servings: 2,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    calories: 380,
    protein: 28,
    fat: 16,
    carbs: 32,
    mealType: 'dinner',
    ingredients: [
      { name: 'アジ', amount: '4', unit: '尾', category: '魚類' },
      { name: '玉ねぎ', amount: '1', unit: '個', category: '野菜' },
      { name: 'にんじん', amount: '1/2', unit: '本', category: '野菜' },
      { name: 'ピーマン', amount: '2', unit: '個', category: '野菜' },
      { name: '酢', amount: '100', unit: 'ml', category: '調味料' },
      { name: '醤油', amount: '大さじ3', unit: '', category: '調味料' },
      { name: '砂糖', amount: '大さじ2', unit: '', category: '調味料' },
      { name: '小麦粉', amount: '適量', unit: '', category: '穀物' }
    ],
    instructions: [
      'アジに小麦粉をまぶす',
      '油で揚げ焼きにする',
      '野菜を千切りにする',
      '南蛮酢を作る',
      'アジと野菜を南蛮酢に漬ける'
    ]
  },
  {
    name: '麻婆豆腐',
    description: 'ピリ辛で食欲をそそる中華料理',
    servings: 2,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    calories: 420,
    protein: 26,
    fat: 24,
    carbs: 28,
    mealType: 'dinner',
    ingredients: [
      { name: '木綿豆腐', amount: '1', unit: '丁', category: '大豆製品' },
      { name: '豚ひき肉', amount: '150', unit: 'g', category: '肉類' },
      { name: '長ネギ', amount: '1', unit: '本', category: '野菜' },
      { name: '豆板醤', amount: '小さじ2', unit: '', category: '調味料' },
      { name: '味噌', amount: '大さじ1', unit: '', category: '調味料' },
      { name: '醤油', amount: '大さじ1', unit: '', category: '調味料' },
      { name: '鶏がらスープ', amount: '200', unit: 'ml', category: '調味料' },
      { name: '片栗粉', amount: '大さじ1', unit: '', category: '穀物' }
    ],
    instructions: [
      '豆腐を一口大に切る',
      'フライパンでひき肉を炒める',
      '豆板醤を加えて炒める',
      'スープと調味料を加える',
      '豆腐を加えて煮る',
      '水溶き片栗粉でとろみをつける'
    ]
  }
];

async function seedRecipes() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Seeding recipes...');
    
    for (const recipe of recipes) {
      await conn.execute(
        `INSERT INTO recipes (name, description, servings, prepTimeMinutes, cookTimeMinutes, 
         calories, protein, fat, carbs, ingredients, instructions, mealType) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recipe.name,
          recipe.description,
          recipe.servings,
          recipe.prepTimeMinutes,
          recipe.cookTimeMinutes,
          recipe.calories,
          recipe.protein,
          recipe.fat,
          recipe.carbs,
          JSON.stringify(recipe.ingredients),
          JSON.stringify(recipe.instructions),
          recipe.mealType
        ]
      );
      console.log(`✓ Added recipe: ${recipe.name}`);
    }
    
    console.log(`\nSuccessfully seeded ${recipes.length} recipes!`);
  } catch (error) {
    console.error('Error seeding recipes:', error);
  } finally {
    await conn.end();
  }
}

seedRecipes();
