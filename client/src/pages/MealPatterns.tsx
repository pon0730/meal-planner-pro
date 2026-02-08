import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { ChefHat, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { value: 'monday', label: '月曜日' },
  { value: 'tuesday', label: '火曜日' },
  { value: 'wednesday', label: '水曜日' },
  { value: 'thursday', label: '木曜日' },
  { value: 'friday', label: '金曜日' },
  { value: 'saturday', label: '土曜日' },
  { value: 'sunday', label: '日曜日' },
] as const;

export default function MealPatterns() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: patterns, refetch } = trpc.mealPatterns.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const upsertPattern = trpc.mealPatterns.upsert.useMutation();
  
  const [localPatterns, setLocalPatterns] = useState<Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }>>({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);
  
  useEffect(() => {
    if (patterns) {
      const patternsMap: Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }> = {};
      patterns.forEach(p => {
        patternsMap[p.dayOfWeek] = {
          breakfast: p.breakfast,
          lunch: p.lunch,
          dinner: p.dinner,
        };
      });
      
      DAYS.forEach(day => {
        if (!patternsMap[day.value]) {
          patternsMap[day.value] = { breakfast: true, lunch: true, dinner: true };
        }
      });
      
      setLocalPatterns(patternsMap);
    } else {
      const defaultPatterns: Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }> = {};
      DAYS.forEach(day => {
        defaultPatterns[day.value] = { breakfast: true, lunch: true, dinner: true };
      });
      setLocalPatterns(defaultPatterns);
    }
  }, [patterns]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">読み込み中...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = (day: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    setLocalPatterns(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: !prev[day][meal],
      },
    }));
  };

  const handleSaveAll = async () => {
    try {
      for (const day of DAYS) {
        const pattern = localPatterns[day.value];
        await upsertPattern.mutateAsync({
          dayOfWeek: day.value,
          breakfast: pattern.breakfast,
          lunch: pattern.lunch,
          dinner: pattern.dinner,
        });
      }
      refetch();
      toast.success('食事パターンを保存しました');
    } catch (error) {
      toast.error('保存に失敗しました');
    }
  };

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
          <Button variant="outline" onClick={() => setLocation('/dashboard')}>
            ダッシュボードへ
          </Button>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <h2 className="mb-8">食事パターン設定</h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">曜日別食事パターン</CardTitle>
            <CardDescription className="text-lg">
              各曜日で作る食事を選択してください。チェックを外した食事は献立に含まれません。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {DAYS.map(day => (
              <div key={day.value} className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-4">{day.label}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`${day.value}-breakfast`}
                      checked={localPatterns[day.value]?.breakfast ?? true}
                      onCheckedChange={() => handleToggle(day.value, 'breakfast')}
                    />
                    <label
                      htmlFor={`${day.value}-breakfast`}
                      className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      朝食
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`${day.value}-lunch`}
                      checked={localPatterns[day.value]?.lunch ?? true}
                      onCheckedChange={() => handleToggle(day.value, 'lunch')}
                    />
                    <label
                      htmlFor={`${day.value}-lunch`}
                      className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      昼食
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`${day.value}-dinner`}
                      checked={localPatterns[day.value]?.dinner ?? true}
                      onCheckedChange={() => handleToggle(day.value, 'dinner')}
                    />
                    <label
                      htmlFor={`${day.value}-dinner`}
                      className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      夕食
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            <Button onClick={handleSaveAll} size="lg" className="w-full mt-6">
              <Save className="mr-2 h-5 w-5" />
              すべて保存
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
