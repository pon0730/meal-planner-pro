import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ChefHat, Plus, Trash2, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ['野菜', '肉', '魚', '卵・乳製品', '調味料', 'その他'];
const SHELF_LIFE_DEFAULTS: Record<string, number> = {
  '野菜': 7,
  '肉': 3,
  '魚': 2,
  '卵・乳製品': 10,
  '調味料': 180,
  'その他': 7,
};

export default function InventoryManagement() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [newItem, setNewItem] = useState({
    ingredientName: '',
    amount: '',
    unit: 'g',
    category: '野菜',
    shelfLifeDays: 7,
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

  const handleAddItem = async () => {
    if (!newItem.ingredientName) {
      toast.error('食材名を入力してください');
      return;
    }

    try {
      // TODO: API呼び出しを追加
      toast.success('食材を追加しました');
      setNewItem({
        ingredientName: '',
        amount: '',
        unit: 'g',
        category: '野菜',
        shelfLifeDays: 7,
      });
    } catch (error) {
      toast.error('追加に失敗しました');
    }
  };

  const handleCategoryChange = (category: string) => {
    setNewItem({
      ...newItem,
      category,
      shelfLifeDays: SHELF_LIFE_DEFAULTS[category] || 7,
    });
  };

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
        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* 食材ロス警告 */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl text-orange-900">もうすぐ期限切れ</CardTitle>
              </div>
              <CardDescription className="text-orange-800">
                以下の食材は3日以内に期限切れになります
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* TODO: 期限切れ間近の食材を表示 */}
                <p className="text-muted-foreground">登録済みの食材がありません</p>
              </div>
            </CardContent>
          </Card>

          {/* 在庫一覧 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">在庫管理</CardTitle>
              <CardDescription>購入した食材を登録して、ロスを減らしましょう</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 既存在庫 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">登録済みの食材</h3>
                <p className="text-muted-foreground">登録済みの食材がありません</p>
              </div>

              {/* 新規食材追加 */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">新しい食材を追加</h3>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="ingredient-name">食材名 *</Label>
                    <Input
                      id="ingredient-name"
                      value={newItem.ingredientName}
                      onChange={e => setNewItem({ ...newItem, ingredientName: e.target.value })}
                      placeholder="例: トマト"
                      className="text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="amount">数量</Label>
                      <Input
                        id="amount"
                        value={newItem.amount}
                        onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                        placeholder="例: 500"
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">単位</Label>
                      <Select value={newItem.unit} onValueChange={(unit) => setNewItem({ ...newItem, unit })}>
                        <SelectTrigger className="text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="個">個</SelectItem>
                          <SelectItem value="本">本</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="category">カテゴリ</Label>
                      <Select value={newItem.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shelf-life">保存期間（日）</Label>
                    <Input
                      id="shelf-life"
                      type="number"
                      value={newItem.shelfLifeDays}
                      onChange={e => setNewItem({ ...newItem, shelfLifeDays: parseInt(e.target.value) })}
                      className="text-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {newItem.category}の推奨保存期間: {SHELF_LIFE_DEFAULTS[newItem.category]}日
                    </p>
                  </div>

                  <Button onClick={handleAddItem} size="lg" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    食材を追加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 食材活用提案 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">食材活用提案</CardTitle>
              <CardDescription>在庫の食材を活用したメニューを提案します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  食材を登録すると、それらを活用したメニューを提案します。
                </p>
                <Button variant="outline" className="w-full" disabled>
                  提案メニューを見る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
