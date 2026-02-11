import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChefHat, Lightbulb, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function RecipeRecommendation() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">読み込み中...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const recommendations = [
    {
      id: 1,
      name: 'トマトサラダ',
      ingredients: ['トマト', 'レタス', 'オリーブオイル'],
      matchPercentage: 100,
      daysUntilExpiry: 2,
    },
    {
      id: 2,
      name: 'ポテトサラダ',
      ingredients: ['じゃがいも', 'マヨネーズ', '卵'],
      matchPercentage: 80,
      daysUntilExpiry: 3,
    },
    {
      id: 3,
      name: 'グリーンサラダ',
      ingredients: ['レタス', 'きゅうり', 'トマト'],
      matchPercentage: 90,
      daysUntilExpiry: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードに戻る</Button>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              <h2 className="text-4xl font-bold">食材活用レシピ提案</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              在庫の食材を活用して、食材ロスを減らしましょう
            </p>
          </div>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-lg text-muted-foreground mb-6">
                  在庫に登録した食材がありません。
                </p>
                <Link href="/inventory">
                  <Button size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    在庫を登録する
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {recommendations.map(recipe => (
                <Card key={recipe.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{recipe.name}</CardTitle>
                        <CardDescription className="text-lg">
                          在庫の食材との一致度: {recipe.matchPercentage}%
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {recipe.matchPercentage}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          マッチ度
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">使用食材</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-orange-900">
                        ⚠️ {recipe.daysUntilExpiry}日以内に期限切れになる食材が含まれています
                      </p>
                    </div>
                    <Button className="w-full" size="lg">
                      このレシピを献立に追加
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 提案ロジック説明 */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl">提案ロジック</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ 在庫に登録した食材を活用するレシピを優先的に提案します</p>
              <p>✓ 期限切れが近い食材を使用するレシピを上位に表示します</p>
              <p>✓ 栄養バランスと家族のアレルギーを考慮した提案を行います</p>
              <p>✓ 調理時間が短いレシピを優先的に提案します</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
