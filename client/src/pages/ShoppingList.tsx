import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ChefHat, ShoppingCart, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FREQUENCY_MAP: Record<string, string> = {
  weekly: '週1回',
  twice_weekly: '週2回',
  three_times_weekly: '週3回',
};

export default function ShoppingList() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: menu } = trpc.menu.getLatest.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const [shoppingListId, setShoppingListId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'weekly' | 'twice_weekly' | 'three_times_weekly'>('weekly');
  
  const { data: shoppingList, refetch } = trpc.shopping.getByMenuId.useQuery(
    { weeklyMenuId: menu?.id || 0 },
    { enabled: isAuthenticated && !!menu }
  );
  
  const generateList = trpc.shopping.generate.useMutation();
  const toggleItem = trpc.shopping.toggleItem.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);
  
  useEffect(() => {
    if (shoppingList) {
      setShoppingListId(shoppingList.id);
      setFrequency(shoppingList.shoppingFrequency);
    }
  }, [shoppingList]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">読み込み中...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleGenerate = async () => {
    if (!menu) {
      toast.error('まず献立を生成してください');
      setLocation('/menu');
      return;
    }
    
    try {
      toast.info('買い物リストを生成しています...');
      await generateList.mutateAsync({
        weeklyMenuId: menu.id,
        shoppingFrequency: frequency,
      });
      refetch();
      toast.success('買い物リストを生成しました！');
    } catch (error) {
      toast.error('生成に失敗しました');
    }
  };

  const handleToggleItem = async (itemId: number, checked: boolean) => {
    try {
      await toggleItem.mutateAsync({ itemId, checked });
      refetch();
    } catch (error) {
      toast.error('更新に失敗しました');
    }
  };

  const groupedItems = shoppingList?.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof shoppingList.items>);

  const itemsByTrip = shoppingList?.items.reduce((acc, item) => {
    if (!acc[item.tripNumber]) {
      acc[item.tripNumber] = [];
    }
    acc[item.tripNumber].push(item);
    return acc;
  }, {} as Record<number, typeof shoppingList.items>);

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
            <Button variant="outline" onClick={() => setLocation('/menu')}>
              献立を見る
            </Button>
            <Button variant="outline" onClick={() => setLocation('/dashboard')}>
              ダッシュボードへ
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h2>買い物リスト</h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">買い物頻度設定</CardTitle>
            <CardDescription className="text-lg">
              買い物に行く頻度を選択してください。生鮮食品は複数回に分散されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-lg font-medium mb-2 block">買い物頻度</label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">週1回</SelectItem>
                    <SelectItem value="twice_weekly">週2回</SelectItem>
                    <SelectItem value="three_times_weekly">週3回</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerate} size="lg" disabled={generateList.isPending}>
                <RefreshCw className={`mr-2 h-5 w-5 ${generateList.isPending ? 'animate-spin' : ''}`} />
                {shoppingList ? 'リストを再生成' : 'リストを生成'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {!shoppingList ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl mb-4">買い物リストがまだありません</h3>
              <p className="text-lg text-muted-foreground mb-6">
                献立から買い物リストを生成しましょう
              </p>
              <Button onClick={handleGenerate} size="lg" disabled={generateList.isPending || !menu}>
                <RefreshCw className={`mr-2 h-5 w-5 ${generateList.isPending ? 'animate-spin' : ''}`} />
                リストを生成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {frequency !== 'weekly' && itemsByTrip && (
              <div className="space-y-6">
                {Object.entries(itemsByTrip)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([tripNum, items]) => (
                    <Card key={tripNum}>
                      <CardHeader>
                        <CardTitle className="text-2xl">買い物 {tripNum}回目</CardTitle>
                        <CardDescription className="text-lg">
                          {items.length}点の食材
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Checkbox
                                id={`item-${item.id}`}
                                checked={item.checked}
                                onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                              />
                              <label
                                htmlFor={`item-${item.id}`}
                                className={`flex-1 text-lg cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                              >
                                <span className="font-medium">{item.ingredientName}</span>
                                <span className="ml-2 text-muted-foreground">
                                  {item.amount} {item.unit}
                                </span>
                                <span className="ml-2 text-sm text-muted-foreground">
                                  ({item.category})
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}

            {frequency === 'weekly' && groupedItems && (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-2xl">{category}</CardTitle>
                      <CardDescription className="text-lg">
                        {items.length}点の食材
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={`item-${item.id}`}
                              checked={item.checked}
                              onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                            />
                            <label
                              htmlFor={`item-${item.id}`}
                              className={`flex-1 text-lg cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                            >
                              <span className="font-medium">{item.ingredientName}</span>
                              <span className="ml-2 text-muted-foreground">
                                {item.amount} {item.unit}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
