export const RECIPE_PATTERNS = [
  { 
    id: 'balanced' as const, 
    name: 'バランス型', 
    description: '様々なジャンルの定番メニュー。栄養バランスが取れた献立' 
  },
  { 
    id: 'quick' as const, 
    name: '時短型', 
    description: '調理時間が短い料理を中心。忙しい日向け' 
  },
  { 
    id: 'healthy' as const, 
    name: '健康志向型', 
    description: '低カロリー・高タンパク。ダイエットや健康管理向け' 
  },
  { 
    id: 'kids' as const, 
    name: '子ども向け型', 
    description: 'お子さんが喜ぶメニュー。栄養価も高い' 
  },
  { 
    id: 'elderly' as const, 
    name: '高齢者向け型', 
    description: '柔らかく消化しやすい。高齢者向け' 
  },
];
