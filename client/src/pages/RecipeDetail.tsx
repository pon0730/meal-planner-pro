import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChefHat, Clock, Users, ArrowLeft } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function RecipeDetail() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const recipeId = params.id ? parseInt(params.id) : 0;
  
  const { data: recipe } = trpc.recipes.getById.useQuery(
    { id: recipeId },
    { enabled: recipeId > 0 }
  );
  
  const { data: familyMembers } = trpc.family.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">レシピが見つかりません</p>
      </div>
    );
  }

  const familySize = familyMembers?.length || 2;
  const servingRatio = familySize / recipe.servings;
  const ingredients = recipe.ingredients as Array<{name: string, amount: string, unit: string, category: string}>;
  const instructions = recipe.instructions as string[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 cursor-pointer">
              <ChefHat className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
            </div>
          </Link>
          <Button variant="outline" onClick={() => setLocation('/menu')}>
            献立に戻る
          </Button>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => setLocation('/menu')} className="mb-6">
          <ArrowLeft className="mr-2 h-5 w-5" />
          献立に戻る
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-4xl">{recipe.name}</CardTitle>
            <CardDescription className="text-xl mt-4">
              {recipe.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-base text-muted-foreground">人数</p>
                  <p className="text-xl font-semibold">{familySize}人分</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-base text-muted-foreground">調理時間</p>
                  <p className="text-xl font-semibold">{recipe.prepTimeMinutes + recipe.cookTimeMinutes}分</p>
                </div>
              </div>
              <div>
                <p className="text-base text-muted-foreground">カロリー</p>
                <p className="text-xl font-semibold">{Math.round(recipe.calories * servingRatio)}kcal</p>
              </div>
              <div>
                <p className="text-base text-muted-foreground">栄養素</p>
                <p className="text-lg">
                  P:{Math.round(recipe.protein * servingRatio)}g 
                  F:{Math.round(recipe.fat * servingRatio)}g 
                  C:{Math.round(recipe.carbs * servingRatio)}g
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">材料（{familySize}人分）</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {ingredients.map((ing, idx) => {
                  const amount = parseFloat(ing.amount) || 0;
                  const scaledAmount = amount > 0 ? (amount * servingRatio).toFixed(1) : ing.amount;
                  
                  return (
                    <li key={idx} className="flex justify-between items-center p-3 border-b text-lg">
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-muted-foreground">
                        {scaledAmount} {ing.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">作り方</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {idx + 1}
                    </span>
                    <p className="text-lg flex-1 pt-2">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
