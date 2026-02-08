import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChefHat, RefreshCw, Calendar, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { toast } from "sonner";

const DAYS_MAP: Record<string, string> = {
  monday: '月曜日',
  tuesday: '火曜日',
  wednesday: '水曜日',
  thursday: '木曜日',
  friday: '金曜日',
  saturday: '土曜日',
  sunday: '日曜日',
};

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
};

export default function WeeklyMenu() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: menu, refetch } = trpc.menu.getLatest.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const generateMenu = trpc.menu.generate.useMutation();

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

  const handleGenerate = async () => {
    try {
      toast.info('献立を生成しています...');
      await generateMenu.mutateAsync();
      refetch();
      toast.success('献立を生成しました！');
    } catch (error) {
      toast.error('生成に失敗しました');
    }
  };

  const handleGenerateShoppingList = () => {
    if (menu) {
      setLocation('/shopping');
    } else {
      toast.error('まず献立を生成してください');
    }
  };

  const groupedItems = menu?.items.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = {};
    }
    acc[item.dayOfWeek][item.mealType] = item;
    return acc;
  }, {} as Record<string, Record<string, typeof menu.items[0]>>);

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
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation('/dashboard')}>
              ダッシュボードへ
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h2>週間献立</h2>
          <div className="flex gap-3">
            <Button onClick={handleGenerate} size="lg" disabled={generateMenu.isPending}>
              <RefreshCw className={`mr-2 h-5 w-5 ${generateMenu.isPending ? 'animate-spin' : ''}`} />
              {menu ? '献立を再生成' : '献立を生成'}
            </Button>
            {menu && (
              <Button onClick={handleGenerateShoppingList} size="lg" variant="secondary">
                <ArrowRight className="mr-2 h-5 w-5" />
                買い物リストへ
              </Button>
            )}
          </div>
        </div>

        {!menu ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl mb-4">献立がまだありません</h3>
              <p className="text-lg text-muted-foreground mb-6">
                「献立を生成」ボタンをクリックして、1週間分の献立を自動生成しましょう
              </p>
              <Button onClick={handleGenerate} size="lg" disabled={generateMenu.isPending}>
                <RefreshCw className={`mr-2 h-5 w-5 ${generateMenu.isPending ? 'animate-spin' : ''}`} />
                献立を生成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(DAYS_MAP).map(([dayKey, dayLabel]) => {
              const dayItems = groupedItems?.[dayKey];
              if (!dayItems || Object.keys(dayItems).length === 0) return null;

              return (
                <Card key={dayKey}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{dayLabel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {['breakfast', 'lunch', 'dinner'].map(mealType => {
                        const item = dayItems[mealType];
                        if (!item || !item.recipe) return null;

                        return (
                          <div key={mealType} className="border rounded-lg p-4 hover:border-primary transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-xl font-semibold">{MEAL_TYPE_MAP[mealType]}</h4>
                            </div>
                            <Link href={`/recipe/${item.recipe.id}`}>
                              <div className="cursor-pointer">
                                <p className="font-medium text-lg mb-2 text-primary hover:underline">
                                  {item.recipe.name}
                                </p>
                                <div className="text-base text-muted-foreground space-y-1">
                                  <p>🔥 {item.recipe.calories}kcal</p>
                                  <p>⏱️ 調理時間: {item.recipe.prepTimeMinutes + item.recipe.cookTimeMinutes}分</p>
                                  <p>
                                    P: {item.recipe.protein}g / F: {item.recipe.fat}g / C: {item.recipe.carbs}g
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
