import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChefHat } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PatternSelection() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const { data: patterns } = trpc.patterns.list.useQuery();

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

  const handleSelectPattern = (patternId: string) => {
    setSelectedPattern(patternId);
    toast.success(`${patterns?.find(p => p.id === patternId)?.name}を選択しました`);
    
    // Save pattern selection and navigate to dashboard
    setTimeout(() => {
      setLocation('/dashboard');
    }, 500);
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">献立パターンを選択</h2>
            <p className="text-xl text-muted-foreground">
              あなたのライフスタイルに合ったパターンを選択してください。
              後からいつでも変更できます。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {patterns?.map(pattern => (
              <Card 
                key={pattern.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedPattern === pattern.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleSelectPattern(pattern.id)}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{pattern.name}</CardTitle>
                  <CardDescription className="text-lg">{pattern.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={selectedPattern === pattern.id ? "default" : "outline"}
                  >
                    {selectedPattern === pattern.id ? '選択済み' : 'このパターンを選ぶ'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button 
              onClick={() => setLocation('/dashboard')} 
              size="lg"
              variant="secondary"
            >
              スキップしてダッシュボードへ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
