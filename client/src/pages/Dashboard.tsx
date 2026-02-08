import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChefHat, Users, Calendar, ShoppingCart, Settings, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: familyMembers } = trpc.family.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: latestMenu } = trpc.menu.getLatest.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: nutritionGoal } = trpc.nutrition.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <ChefHat className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-lg">{user?.name || 'ユーザー'}</span>
            <Button variant="outline" onClick={() => {
              trpc.auth.logout.useMutation().mutate();
              setLocation('/');
            }}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <h2 className="mb-8">ダッシュボード</h2>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">家族メンバー</CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{familyMembers?.length || 0}人</div>
              <p className="text-base text-muted-foreground mt-1">
                登録済み
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">今週の献立</CardTitle>
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {latestMenu ? `${latestMenu.items.length}食` : '未作成'}
              </div>
              <p className="text-base text-muted-foreground mt-1">
                {latestMenu ? '生成済み' : '献立を作成しましょう'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">栄養目標</CardTitle>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {nutritionGoal ? `${nutritionGoal.dailyCalories}kcal` : '未設定'}
              </div>
              <p className="text-base text-muted-foreground mt-1">
                1日の目標カロリー
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/menu')}>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">献立管理</CardTitle>
              <CardDescription className="text-lg">
                1週間分の献立を自動生成・編集
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full text-lg">
                献立を見る
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/shopping')}>
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">買い物リスト</CardTitle>
              <CardDescription className="text-lg">
                献立から自動生成された買い物リスト
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full text-lg">
                リストを見る
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/family')}>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">家族設定</CardTitle>
              <CardDescription className="text-lg">
                家族構成・アレルギー・栄養目標の管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full text-lg">
                設定する
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/meal-patterns')}>
            <CardHeader>
              <Settings className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">食事パターン</CardTitle>
              <CardDescription className="text-lg">
                曜日別の食事パターン設定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full text-lg">
                設定する
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
