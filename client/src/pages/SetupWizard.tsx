import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ChefHat } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function SetupWizard() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberAge, setMemberAge] = useState("");
  const [members, setMembers] = useState<Array<{name: string, age: number}>>([]);
  const [dailyCalories, setDailyCalories] = useState("2000");
  const [protein, setProtein] = useState("60");
  const [fat, setFat] = useState("60");
  const [carbs, setCarbs] = useState("250");

  const createFamilyMember = trpc.family.create.useMutation();
  const updateNutritionGoals = trpc.nutrition.upsert.useMutation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">読み込み中...</p></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleAddMember = () => {
    if (memberName.trim()) {
      setMembers([...members, { name: memberName, age: memberAge ? parseInt(memberAge) : 0 }]);
      setMemberName("");
      setMemberAge("");
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!familyName.trim()) {
        toast.error("家族名を入力してください");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (members.length === 0) {
        toast.error("最低1人のメンバーを追加してください");
        return;
      }
      
      // Create family members
      for (const member of members) {
        try {
          await createFamilyMember.mutateAsync({
            name: member.name,
            age: member.age || undefined,
          });
        } catch (error) {
          toast.error(`${member.name}の追加に失敗しました`);
          return;
        }
      }
      
      setStep(3);
    } else if (step === 3) {
      try {
        await updateNutritionGoals.mutateAsync({
          dailyCalories: parseInt(dailyCalories),
          proteinGrams: parseInt(protein),
          fatGrams: parseInt(fat),
          carbsGrams: parseInt(carbs),
        });
        
        toast.success("セットアップが完了しました");
        setTimeout(() => {
          setLocation('/patterns');
        }, 500);
      } catch (error) {
        toast.error("栄養目標の設定に失敗しました");
      }
    }
  };

  const handleSkip = () => {
    setLocation('/patterns');
  };

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

      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-2 mx-1 rounded ${i <= step ? 'bg-primary' : 'bg-gray-300'}`} />
              ))}
            </div>
            <p className="text-center text-muted-foreground">ステップ {step} / 3</p>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">家族情報を入力</CardTitle>
                <CardDescription>家族の基本情報を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="family-name" className="text-lg">家族名</Label>
                  <Input
                    id="family-name"
                    placeholder="例：田中家"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSkip} variant="outline" className="flex-1 h-12 text-lg">
                    スキップ
                  </Button>
                  <Button onClick={handleNext} className="flex-1 h-12 text-lg">
                    次へ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">家族メンバーを追加</CardTitle>
                <CardDescription>家族メンバーの情報を入力します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="member-name" className="text-lg">メンバー名</Label>
                    <Input
                      id="member-name"
                      placeholder="例：太郎"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-age" className="text-lg">年齢（オプション）</Label>
                    <Input
                      id="member-age"
                      type="number"
                      placeholder="例：30"
                      value={memberAge}
                      onChange={(e) => setMemberAge(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>
                  <Button onClick={handleAddMember} variant="outline" className="w-full h-12 text-lg">
                    メンバーを追加
                  </Button>
                </div>

                {members.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="font-semibold text-lg">追加されたメンバー：</p>
                    {members.map((member, idx) => (
                      <div key={idx} className="p-3 bg-gray-100 rounded text-lg">
                        {member.name} {member.age > 0 && `(${member.age}歳)`}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12 text-lg">
                    戻る
                  </Button>
                  <Button onClick={handleNext} className="flex-1 h-12 text-lg">
                    次へ
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">栄養目標を設定</CardTitle>
                <CardDescription>1日の栄養目標を入力します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="calories" className="text-lg">カロリー（kcal）</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={dailyCalories}
                    onChange={(e) => setDailyCalories(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="protein" className="text-lg">タンパク質（g）</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="fat" className="text-lg">脂質（g）</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <Label htmlFor="carbs" className="text-lg">炭水化物（g）</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12 text-lg">
                    戻る
                  </Button>
                  <Button onClick={handleNext} className="flex-1 h-12 text-lg">
                    完了
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
