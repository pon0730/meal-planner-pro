import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ChefHat, ShoppingCart, Calendar, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary">献立プランナー</h1>
          </div>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg">
                ダッシュボードへ
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg">
                ログイン
              </Button>
            </a>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900">
            家族の健康を支える
            <br />
            <span className="text-primary">スマート献立管理</span>
          </h2>
          <p className="text-2xl text-gray-600 leading-relaxed">
            家族構成や栄養目標に基づいて、1週間分の献立と買い物リストを自動生成。
            <br />
            毎日の食事の悩みから解放されます。
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-xl px-8 py-6 h-auto">
                無料で始める
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 bg-white">
        <h2 className="text-center mb-12">主な機能</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">家族管理</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                家族構成、アレルギー、好き嫌いを登録して、一人ひとりに合わせた献立を作成
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">献立自動生成</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                栄養バランスを考慮した1週間分の献立をワンクリックで自動生成
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">買い物リスト</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                献立から必要な食材を自動抽出。買い物頻度に合わせて最適化
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <ChefHat className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-2xl">栄養管理</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg">
                カロリーやPFCバランスの目標達成率をグラフで可視化
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2>今すぐ始めましょう</h2>
          <p className="text-xl text-gray-600">
            献立作りの悩みから解放され、家族との時間をもっと楽しみましょう
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-xl px-8 py-6 h-auto">
                無料で始める
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-gray-50">
        <div className="container text-center text-gray-600">
          <p className="text-lg">© 2026 献立プランナー. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
