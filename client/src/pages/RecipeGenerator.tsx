import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export function RecipeGenerator() {
  const [pattern, setPattern] = useState<'balanced' | 'quick' | 'healthy' | 'kids' | 'elderly'>('balanced');
  const [count, setCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = trpc.recipes.generateTrendRecipes.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      alert(`${data.count}個のレシピを生成・保存しました！`);
    },
    onError: (error) => {
      setIsGenerating(false);
      alert(`エラー: ${error.message}`);
    },
  });

  const patternDescriptions: Record<string, { title: string; description: string }> = {
    balanced: {
      title: 'バランス型',
      description: 'バランスの取れた栄養価の高い日本の家庭料理',
    },
    quick: {
      title: '時短型',
      description: '調理時間が15分以内の時短メニュー',
    },
    healthy: {
      title: '健康志向型',
      description: '低カロリーで高タンパク質の健康志向メニュー',
    },
    kids: {
      title: '子ども向け',
      description: '子どもが好む食べやすく栄養価の高いメニュー',
    },
    elderly: {
      title: '高齢者向け',
      description: '柔らかく消化しやすい高齢者向けメニュー',
    },
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateMutation.mutateAsync({ count, pattern });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">トレンドメニュー生成</CardTitle>
            <CardDescription className="text-blue-100">
              LLMを使用して新しいレシピを自動生成します
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* パターン選択 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                献立パターンを選択
              </label>
              <Select value={pattern} onValueChange={(value: any) => setPattern(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">バランス型</SelectItem>
                  <SelectItem value="quick">時短型</SelectItem>
                  <SelectItem value="healthy">健康志向型</SelectItem>
                  <SelectItem value="kids">子ども向け</SelectItem>
                  <SelectItem value="elderly">高齢者向け</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-800">
                  {patternDescriptions[pattern].title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {patternDescriptions[pattern].description}
                </p>
              </div>
            </div>

            {/* レシピ数選択 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                生成するレシピ数: {count}個
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">1～20個のレシピを生成できます</p>
            </div>

            {/* 注意事項 */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">
                <strong>注意:</strong> レシピ生成には数秒～数十秒かかる場合があります。
                生成中は画面を離れないでください。
              </p>
            </div>

            {/* 生成ボタン */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                'レシピを生成'
              )}
            </Button>

            {/* 成功メッセージ */}
            {generateMutation.isSuccess && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ {generateMutation.data?.count}個のレシピを生成・保存しました！
                </p>
              </div>
            )}

            {/* エラーメッセージ */}
            {generateMutation.isError && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  ✗ エラーが発生しました: {generateMutation.error?.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 情報パネル */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">生成されたレシピについて</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              • 生成されたレシピは自動的にデータベースに保存されます
            </p>
            <p>
              • 献立生成時に新しいレシピが利用可能になります
            </p>
            <p>
              • 重複するレシピは自動的に排除されます
            </p>
            <p>
              • すべてのレシピは選択したパターンに基づいて生成されます
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
