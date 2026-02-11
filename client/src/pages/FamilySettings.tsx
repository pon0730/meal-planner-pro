import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { ChefHat, Plus, Trash2, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const COMMON_ALLERGIES = ['卵', 'エビ', 'カニ', 'くるみ', 'そば', 'ピーナッツ', 'イカ', 'タコ', '牛乳', 'ゴマ', 'キウイ', 'オレンジ'];
const DIETARY_RESTRICTIONS = ['ベジタリアン', 'ビーガン', 'グルテンフリー', 'ハラール', 'コーシャ'];

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
  
  const [newMember, setNewMember] = useState({ 
    name: '', 
    age: '', 
    allergies: [] as string[],
    dislikes: '',
    dietaryRestrictions: [] as string[],
  });
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
    if (!newMember.name) {
      toast.error('名前を入力してください');
      return;
    }

    try {
      await createMember.mutateAsync({
        name: newMember.name,
        age: newMember.age ? parseInt(newMember.age) : undefined,
        allergies: newMember.allergies,
        dislikes: newMember.dislikes ? newMember.dislikes.split(',').map(d => d.trim()) : [],
      });
      
      setNewMember({ name: '', age: '', allergies: [], dislikes: '', dietaryRestrictions: [] });
      refetchFamily();
      toast.success('家族メンバーを追加しました');
    } catch (error) {
      toast.error('追加に失敗しました');
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    try {
      await deleteMember.mutateAsync({ id: memberId });
      refetchFamily();
      toast.success('メンバーを削除しました');
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

  const toggleAllergy = (allergy: string) => {
    setNewMember(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setNewMember(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
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
          {/* 家族メンバー管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">家族メンバー管理</CardTitle>
              <CardDescription>家族構成、アレルギー、食事制限を設定してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 既存メンバー一覧 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">登録済みメンバー</h3>
                {familyMembers && familyMembers.length > 0 ? (
                  familyMembers.map(member => (
                    <div key={member.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{member.name}</p>
                        {member.age && <p className="text-sm text-muted-foreground">年齢: {member.age}歳</p>}
                        {member.allergies && member.allergies.length > 0 && (
                          <p className="text-sm text-red-600">アレルギー: {member.allergies.join(', ')}</p>
                        )}
                        {member.dislikes && member.dislikes.length > 0 && (
                          <p className="text-sm text-orange-600">苦手な食材: {member.dislikes.join(', ')}</p>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleDeleteMember(member.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">メンバーが登録されていません</p>
                )}
              </div>

              {/* 新規メンバー追加 */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">新しいメンバーを追加</h3>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">名前 *</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="例: 太郎"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">年齢（オプション）</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newMember.age}
                      onChange={e => setNewMember({ ...newMember, age: e.target.value })}
                      placeholder="例: 30"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-base mb-3 block">アレルギー</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {COMMON_ALLERGIES.map(allergy => (
                        <div key={allergy} className="flex items-center gap-2">
                          <Checkbox
                            id={`allergy-${allergy}`}
                            checked={newMember.allergies.includes(allergy)}
                            onCheckedChange={() => toggleAllergy(allergy)}
                          />
                          <label htmlFor={`allergy-${allergy}`} className="text-sm cursor-pointer">
                            {allergy}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dislikes">苦手な食材（カンマ区切り）</Label>
                    <Input
                      id="dislikes"
                      value={newMember.dislikes}
                      onChange={e => setNewMember({ ...newMember, dislikes: e.target.value })}
                      placeholder="例: トマト, ナス, ピーマン"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-base mb-3 block">食事制限</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {DIETARY_RESTRICTIONS.map(restriction => (
                        <div key={restriction} className="flex items-center gap-2">
                          <Checkbox
                            id={`restriction-${restriction}`}
                            checked={newMember.dietaryRestrictions.includes(restriction)}
                            onCheckedChange={() => toggleDietaryRestriction(restriction)}
                          />
                          <label htmlFor={`restriction-${restriction}`} className="text-sm cursor-pointer">
                            {restriction}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddMember} size="lg" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    メンバーを追加
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 栄養目標設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">栄養目標設定</CardTitle>
              <CardDescription>1日の栄養目標を設定してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">1日の目標カロリー（kcal）</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={nutrition.dailyCalories}
                    onChange={e => setNutrition({ ...nutrition, dailyCalories: parseInt(e.target.value) })}
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="protein">タンパク質（g）</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={nutrition.proteinGrams}
                    onChange={e => setNutrition({ ...nutrition, proteinGrams: parseInt(e.target.value) })}
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="fat">脂質（g）</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={nutrition.fatGrams}
                    onChange={e => setNutrition({ ...nutrition, fatGrams: parseInt(e.target.value) })}
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="carbs">炭水化物（g）</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={nutrition.carbsGrams}
                    onChange={e => setNutrition({ ...nutrition, carbsGrams: parseInt(e.target.value) })}
                    className="text-lg"
                  />
                </div>
              </div>

              <Button onClick={handleSaveNutrition} size="lg" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                栄養目標を保存
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
