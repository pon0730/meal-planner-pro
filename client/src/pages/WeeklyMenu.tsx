import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ChefHat, RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { useLocation } from "wouter";
import { skipToken } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
const MEAL_TYPES = { breakfast: '朝食', lunch: '昼食', dinner: '夕食' };

export default function WeeklyMenu() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [alternativeRecipes, setAlternativeRecipes] = useState<any[]>([]);
  const [skippedMeals, setSkippedMeals] = useState<number[]>([]);
  const [showSkippedSection, setShowSkippedSection] = useState(false);
  const [showPatternDialog, setShowPatternDialog] = useState(false);

  const { data: menu, refetch, isLoading } = trpc.menu.getLatest.useQuery();
  const generateMenu = trpc.menu.generate.useMutation();
  const updateMenuItem = trpc.menu.replaceItem.useMutation();
  const saveSkippedMealsMutation = trpc.menu.saveSkippedMeals.useMutation();
  const getRecipesByMealType = trpc.recipes.getByMealType.useQuery(
    selectedItem ? { mealType: selectedItem.mealType } : skipToken
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/');
    }
  }, [loading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (getRecipesByMealType.data) {
      setAlternativeRecipes(getRecipesByMealType.data);
    }
  }, [getRecipesByMealType.data]);

  if (loading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">読み込み中...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleGenerateWithPattern = async (pattern: 'balanced' | 'quick' | 'healthy' | 'kids' | 'elderly') => {
    try {
      toast.info('献立を生成しています...');
      await generateMenu.mutateAsync({ pattern });
      refetch();
      toast.success('献立を生成しました！');
      setShowPatternDialog(false);
    } catch (error) {
      toast.error('生成に失敗しました');
    }
  };

  const handleGenerate = () => {
    setShowPatternDialog(true);
  };

  const handleChangeRecipe = async (menuItemId: number, newRecipeId: number) => {
    try {
      await updateMenuItem.mutateAsync({ menuItemId, newRecipeId });
      refetch();
      toast.success('メニューを変更しました');
      setSelectedItem(null);
    } catch (error) {
      toast.error('変更に失敗しました');
    }
  };

  const openRecipeSelector = (item: any) => {
    setSelectedItem(item);
  };

  const toggleSkippedMeal = (menuItemId: number) => {
    setSkippedMeals(prev => 
      prev.includes(menuItemId) 
        ? prev.filter(id => id !== menuItemId)
        : [...prev, menuItemId]
    );
  };

  const handleSaveSkippedMeals = async () => {
    if (skippedMeals.length === 0) {
      toast.info('作らなかった献立を選択してください');
      return;
    }
    try {
      await saveSkippedMealsMutation.mutateAsync({ 
        weeklyMenuId: menu?.id || 0,
        menuItemIds: skippedMeals 
      });
      toast.success(`${skippedMeals.length}個の献立を記録しました`);
      setShowSkippedSection(false);
      setSkippedMeals([]);
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  };

  if (!menu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="border-b bg-white">
          <div className="container py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
            </div>
          </div>
        </header>
        <div className="container py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">献立がまだ生成されていません</h2>
          <Button onClick={handleGenerate} size="lg">
            献立を生成する
          </Button>
        </div>
      </div>
    );
  }

  // Group items by day
  const itemsByDay = DAYS.map((day, idx) => ({
    day,
    dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][idx],
    items: menu.items?.filter((item: any) => item.dayOfWeek === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][idx]) || [],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} variant="outline" size="sm" disabled={generateMenu.isPending}>
              <RefreshCw className="h-4 w-4 mr-2" />
              再生成
            </Button>
            <Button onClick={() => setLocation('/shopping')} size="sm">
              買い物リストへ
            </Button>
          </div>
        </div>
      </header>


      <div className="container py-8">
        {/* 作らなかった献立セクション */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader className="cursor-pointer" onClick={() => setShowSkippedSection(!showSkippedSection)}>
            <CardTitle className="text-lg flex items-center gap-2">
              {showSkippedSection ? '▼' : '▶'} 前週で作らなかった献立を記録
            </CardTitle>
            <CardDescription>
              この週で実際に作らなかった献立を選択すると、その食材が次週の献立に優先的に反映されます
            </CardDescription>
          </CardHeader>
          {showSkippedSection && (
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {menu.items?.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSkippedMeal(item.id)}
                    className="p-3 bg-white rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: skippedMeals.includes(item.id) ? '#ea580c' : '#e5e7eb',
                      backgroundColor: skippedMeals.includes(item.id) ? '#fff7ed' : 'white',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {skippedMeals.includes(item.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-orange-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{MEAL_TYPES[item.mealType as keyof typeof MEAL_TYPES]} - {item.recipe?.name}</p>
                        <p className="text-sm text-muted-foreground">{item.recipe?.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSkippedMeals} className="w-full bg-orange-600 hover:bg-orange-700" disabled={saveSkippedMealsMutation.isPending}>
                {skippedMeals.length > 0 ? `${skippedMeals.length}個の献立を記録` : '記録する'}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* 献立表示セクション */}
        <div className="grid gap-4">
          {itemsByDay.map((dayGroup) => (
            <Card key={dayGroup.dayOfWeek}>
              <CardHeader>
                <CardTitle className="text-2xl">{dayGroup.day}曜日</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayGroup.items.length > 0 ? (
                    dayGroup.items.map((item: any) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-lg">{MEAL_TYPES[item.mealType as keyof typeof MEAL_TYPES]}</p>
                          <p className="text-xl">{item.recipe?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.recipe?.calories}kcal | タンパク質{item.recipe?.protein}g | 脂質{item.recipe?.fat}g | 炭水化物{item.recipe?.carbs}g
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openRecipeSelector(item)} 
                            variant="outline" 
                            size="sm"
                          >
                            変更
                          </Button>
                          <Button 
                            onClick={() => setLocation(`/recipe/${item.recipeId}`)} 
                            variant="outline" 
                            size="sm"
                          >
                            詳細
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">食事が設定されていません</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>メニューを変更</DialogTitle>
            <DialogDescription>
              {selectedItem && `${MEAL_TYPES[selectedItem.mealType as keyof typeof MEAL_TYPES]}の別のメニューを選択してください`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {alternativeRecipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleChangeRecipe(selectedItem.id, recipe.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {recipe.calories}kcal | {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)}分
                  </p>
                  <Button 
                    className="w-full mt-2"
                    size="sm"
                    onClick={() => handleChangeRecipe(selectedItem.id, recipe.id)}
                  >
                    このメニューに変更
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Selection Dialog */}
      <Dialog open={showPatternDialog} onOpenChange={setShowPatternDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>献立パターンを選択</DialogTitle>
            <DialogDescription>
              どのタイプの献立を生成しますか？
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleGenerateWithPattern('balanced')}
              className="p-4 text-left border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
            >
              <p className="font-semibold text-lg">バランス型</p>
              <p className="text-sm text-muted-foreground">栄養バランスを重視した献立</p>
            </button>
            <button
              onClick={() => handleGenerateWithPattern('quick')}
              className="p-4 text-left border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
            >
              <p className="font-semibold text-lg">時短型</p>
              <p className="text-sm text-muted-foreground">調理時間が短い献立</p>
            </button>
            <button
              onClick={() => handleGenerateWithPattern('healthy')}
              className="p-4 text-left border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
            >
              <p className="font-semibold text-lg">健康志向型</p>
              <p className="text-sm text-muted-foreground">ヘルシーな献立</p>
            </button>
            <button
              onClick={() => handleGenerateWithPattern('kids')}
              className="p-4 text-left border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
            >
              <p className="font-semibold text-lg">子ども向け</p>
              <p className="text-sm text-muted-foreground">子どもが好きな献立</p>
            </button>
            <button
              onClick={() => handleGenerateWithPattern('elderly')}
              className="p-4 text-left border rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
            >
              <p className="font-semibold text-lg">高齢者向け</p>
              <p className="text-sm text-muted-foreground">食べやすい献立</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
