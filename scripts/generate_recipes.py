#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI
from datetime import datetime

# OpenAI クライアントの初期化
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# データベース接続
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="meal_planner"
    )

# レシピ生成関数
def generate_recipes(count, pattern):
    pattern_descriptions = {
        "balanced": "バランスの取れた栄養価の高い日本の家庭料理",
        "quick": "調理時間が15分以内の時短メニュー",
        "healthy": "低カロリーで高タンパク質の健康志向メニュー",
        "kids": "子どもが好む食べやすく栄養価の高いメニュー",
        "elderly": "柔らかく消化しやすい高齢者向けメニュー",
    }
    
    system_prompt = f"""あなたは日本の料理研究家です。ユーザーのリクエストに基づいて、トレンドメニューのレシピを生成します。
必ずJSON形式で以下の構造で返してください：

{{
  "recipes": [
    {{
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
        {{
          "name": "食材名",
          "amount": "100",
          "unit": "g",
          "category": "野菜"
        }}
      ],
      "instructions": ["手順1", "手順2"],
      "mealType": "lunch",
      "pattern": "{pattern}"
    }}
  ]
}}

注意事項：
- 各レシピは実際に調理可能で、材料と手順が明確であること
- 栄養情報は現実的な値を設定すること
- 食材カテゴリは「野菜」「肉」「魚」「穀物」「乳製品」「調味料」などで分類
- 手順は3～8ステップで、具体的で実行可能であること
- 日本の家庭で一般的に入手可能な食材を使用すること"""
    
    user_prompt = f"""{pattern_descriptions[pattern]}のレシピを{count}個生成してください。
多様なメニューを生成し、朝食・昼食・夕食をバランスよく含めてください。
最新のトレンドを反映した、人気のあるメニューを優先してください。"""
    
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.8
    )
    
    content = response.choices[0].message.content
    if not content:
        raise Exception("LLM response is empty")
    
    parsed = json.loads(content)
    return parsed["recipes"]

# レシピをデータベースに保存
def save_recipe(cursor, recipe):
    sql = """INSERT INTO recipes 
             (name, description, servings, prepTimeMinutes, cookTimeMinutes, 
              calories, protein, fat, carbs, ingredients, instructions, 
              mealType, pattern)
             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    
    values = (
        recipe["name"],
        recipe["description"],
        recipe["servings"],
        recipe["prepTimeMinutes"],
        recipe["cookTimeMinutes"],
        recipe["calories"],
        recipe["protein"],
        recipe["fat"],
        recipe["carbs"],
        json.dumps(recipe["ingredients"], ensure_ascii=False),
        json.dumps(recipe["instructions"], ensure_ascii=False),
        recipe["mealType"],
        recipe["pattern"]
    )
    
    cursor.execute(sql, values)

def main():
    patterns = ["balanced", "quick", "healthy", "kids", "elderly"]
    
    print("🚀 トレンドレシピ生成を開始します...\n")
    
    total_generated = 0
    total_errors = 0
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        for pattern in patterns:
            print(f"📝 パターン: {pattern} のレシピを生成中...")
            
            try:
                recipes = generate_recipes(10, pattern)
                print(f"✅ {len(recipes)}個のレシピを生成しました")
                
                for recipe in recipes:
                    try:
                        save_recipe(cursor, recipe)
                        conn.commit()
                        total_generated += 1
                        print(f"  - {recipe['name']} ({recipe['mealType']})")
                    except Exception as e:
                        print(f"  ❌ レシピ保存エラー: {recipe['name']}", str(e))
                        total_errors += 1
                
                print("")
            except Exception as e:
                print(f"❌ パターン {pattern} のレシピ生成に失敗しました:", str(e))
                total_errors += 1
                print("")
        
        print("\n=== 生成結果 ===")
        print(f"✅ 成功: {total_generated}個のレシピをデータベースに保存しました")
        if total_errors > 0:
            print(f"❌ エラー: {total_errors}件")
        print("\n🎉 レシピ生成が完了しました！")
        
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
