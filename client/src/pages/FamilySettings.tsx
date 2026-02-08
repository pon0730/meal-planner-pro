import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ChefHat, Plus, Trash2, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FamilySettings() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: familyMembers, refetch: refetchFamily } = trpc.family.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: nutritionGoal, refetch: refetchNutrition } = trpc.nutrition.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const createMember = trpc.family.create.useMutation();
  const deleteMember = trpc.family.delete.useMutation();
  const upsertNutrition = trpc.nutrition.upsert.useMutation();
  
  const [newMember, setNewMember] = useState({ name: '', age: '', allergies: '', dislikes: '' });
  const [nutrition, setNutrition] = useState({
    dailyCalories: 2000,
    proteinGrams: 60,
    fatGrams: 60,
    carbsGrams: 250,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);
  
  useEffect(() => {
    if (nutritionGoal) {
      setNutrition({
        dailyCalories: nutritionGoal.dailyCalories,
        proteinGrams: nutritionGoal.proteinGrams,
        fatGrams: nutritionGoal.fatGrams,
        carbsGrams: nutritionGoal.carbsGrams,
      });
    }
  }, [nutritionGoal]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">読み込み中...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAddMember = async () => {
    if (!newMember.name.trim()) {
      toast.error('名前を入力してください');
      return;
    }
    
    try {
      await createMember.mutateAsync({
        name: newMember.name,
        age: newMember.age ? parseInt(newMember.age) : undefined,
        allergies: newMember.allergies ? newMember.allergies.split(',').map(s => s.trim()) : [],
        dislikes: newMember.dislikes ? newMember.dislikes.split(',').map(s => s.trim()) : [],
      });
      
      setNewMember({ name: '', age: '', allergies: '', dislikes: '' });
      refetchFamily();
      toast.success('家族メンバーを追加しました');
    } catch (error) {
      toast.error('追加に失敗しました');
    }
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await deleteMember.mutateAsync({ id });
      refetchFamily();
      toast.success('家族メンバーを削除しました');
    } catch (error) {
      toast.error('削除に失敗しました');
    }
  };

  const handleSaveNutrition = async () => {
    try {
      await upsertNutrition.mutateAsync(nutrition);
      refetchNutrition();
      toast.success('栄養目標を保存しました');
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
        <h2 className="mb-8">家族設定</h2>

        {/* Family Members */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">家族メンバー</CardTitle>
            <CardDescription className="text-lg">
              家族構成、アレルギー、好き嫌いを登録します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {familyMembers && familyMembers.length > 0 && (
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-xl">{member.name}</p>
                      {member.age && <p className="text-lg text-muted-foreground">{member.age}歳</p>}
                      {member.allergies && (member.allergies as string[]).length > 0 && (
                        <p className="text-lg text-red-600">アレルギー: {(member.allergies as string[]).join(', ')}</p>
                      )}
                      {member.dislikes && (member.dislikes as string[]).length > 0 && (
                        <p className="text-lg text-orange-600">苦手: {(member.dislikes as string[]).join(', ')}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-xl font-semibold">新しいメンバーを追加</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">名前 *</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="例: 太郎"
                  />
                </div>
                <div>
                  <Label htmlFor="age">年齢</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                    placeholder="例: 35"
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">アレルギー（カンマ区切り）</Label>
                  <Input
                    id="allergies"
                    value={newMember.allergies}
                    onChange={(e) => setNewMember({ ...newMember, allergies: e.target.value })}
                    placeholder="例: 卵, 乳製品"
                  />
                </div>
                <div>
                  <Label htmlFor="dislikes">苦手な食材（カンマ区切り）</Label>
                  <Input
                    id="dislikes"
                    value={newMember.dislikes}
                    onChange={(e) => setNewMember({ ...newMember, dislikes: e.target.value })}
                    placeholder="例: セロリ, パクチー"
                  />
                </div>
                <Button onClick={handleAddMember} size="lg" className="w-full">
                  <Plus className="mr-2 h-5 w-5" />
                  メンバーを追加
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">栄養目標</CardTitle>
            <CardDescription className="text-lg">
              家族全体の1日あたりの栄養摂取目標を設定します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="calories">目標カロリー (kcal)</Label>
              <Input
                id="calories"
                type="number"
                value={nutrition.dailyCalories}
                onChange={(e) => setNutrition({ ...nutrition, dailyCalories: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="protein">タンパク質 (g)</Label>
              <Input
                id="protein"
                type="number"
                value={nutrition.proteinGrams}
                onChange={(e) => setNutrition({ ...nutrition, proteinGrams: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="fat">脂質 (g)</Label>
              <Input
                id="fat"
                type="number"
                value={nutrition.fatGrams}
                onChange={(e) => setNutrition({ ...nutrition, fatGrams: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="carbs">炭水化物 (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={nutrition.carbsGrams}
                onChange={(e) => setNutrition({ ...nutrition, carbsGrams: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={handleSaveNutrition} size="lg" className="w-full">
              <Save className="mr-2 h-5 w-5" />
              栄養目標を保存
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
