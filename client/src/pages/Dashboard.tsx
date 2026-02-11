import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChefHat, Users, Calendar, ShoppingCart, Settings, TrendingUp, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  
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



        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setShowMenuModal(true)}>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">献立管理</CardTitle>
              <CardDescription className="text-lg">
                1週間分の献立を自動生成・編集
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/shopping')}>
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">買い物リスト</CardTitle>
              <CardDescription className="text-lg">
                献立から自動生成された買い物リスト
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setShowMembersModal(true)}>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">家族設定</CardTitle>
              <CardDescription className="text-lg">
                家族構成・アレルギー・栄養目標の管理
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/meal-patterns')}>
            <CardHeader>
              <Settings className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">食事パターン</CardTitle>
              <CardDescription className="text-lg">
                曜日別の食事パターン設定
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation('/recipe-generator')}>
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-2" />
              <CardTitle className="text-2xl">トレンドメニュー生成</CardTitle>
              <CardDescription className="text-lg">
                LLMでトレンドメニューを自動生成
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

      {/* Members Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>家族メンバー一覧</DialogTitle>
            <DialogDescription>
              家族メンバーの情報を確認・編集できます
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {familyMembers && familyMembers.length > 0 ? (
              familyMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{member.name}</CardTitle>
                        <CardDescription>
                          {member.age ? `${member.age}歳` : '年齢未設定'}
                        </CardDescription>
                      </div>
                      <Button onClick={() => setLocation(`/family`)}>
                        編集
                      </Button>
                    </div>
                  </CardHeader>
                  {(member.allergies && member.allergies.length > 0) || (member.dislikes && member.dislikes.length > 0) ? (
                    <CardContent>
                      {member.allergies && member.allergies.length > 0 && (
                        <p className="text-sm"><strong>アレルギー:</strong> {member.allergies.join(', ')}</p>
                      )}
                      {member.dislikes && member.dislikes.length > 0 && (
                        <p className="text-sm"><strong>苦手な食材:</strong> {member.dislikes.join(', ')}</p>
                      )}
                    </CardContent>
                  ) : null}
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">メンバーが登録されていません</p>
            )}
            <Button className="w-full" onClick={() => setLocation('/family')}>
              メンバーを追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Menu Modal */}
      <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>今週の献立</DialogTitle>
            <DialogDescription>
              献立の詳細を確認・編集できます
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {latestMenu && latestMenu.items.length > 0 ? (
              <>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayItems = latestMenu.items.filter((item: any) => item.dayOfWeek === day);
                  if (dayItems.length === 0) return null;
                  
                  const dayNames: Record<string, string> = {
                    monday: '月曜日',
                    tuesday: '火曜日',
                    wednesday: '水曜日',
                    thursday: '木曜日',
                    friday: '金曜日',
                    saturday: '土曜日',
                    sunday: '日曜日'
                  };
                  
                  return (
                    <div key={day}>
                      <h3 className="font-semibold text-lg mb-2">{dayNames[day]}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {dayItems.map((item: any) => (
                          <Card key={item.id}>
                            <CardHeader>
                              <CardTitle className="text-base">{item.recipe.name}</CardTitle>
                              <CardDescription>
                                {item.mealType === 'breakfast' ? '朝食' : item.mealType === 'lunch' ? '昼食' : '夕食'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">{item.recipe.calories}kcal</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <Button className="w-full" onClick={() => { setShowMenuModal(false); setLocation('/menu'); }}>
                  献立を編集
                </Button>
              </>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">献立が生成されていません</p>
                <Button onClick={() => { setShowMenuModal(false); setLocation('/menu'); }}>
                  献立を生成
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
