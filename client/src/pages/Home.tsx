import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="border-b bg-white">
          <div className="container py-4">
            <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
          </div>
        </header>
        <div className="container py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">家族の健康的な食生活を応援</h2>
          <p className="text-xl text-muted-foreground mb-8">
            栄養目標に基づいた献立と買い物リストを自動生成
          </p>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg">
            ログインして始める
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
          <Button variant="outline" onClick={() => logout()}>
            ログアウト
          </Button>
        </div>
      </header>
      <div className="container py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">ようこそ、{user?.name}さん</h2>
        <p className="text-xl text-muted-foreground mb-8">
          献立パターンを選択して、献立計画を始めましょう
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setLocation('/patterns')} size="lg">
            パターンを選択
          </Button>
          <Button onClick={() => setLocation('/dashboard')} variant="outline" size="lg">
            ダッシュボードへ
          </Button>
        </div>
      </div>
    </div>
  );
}
