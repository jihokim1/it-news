import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import { ChevronRight } from "lucide-react";

// 메인에 보여줄 카테고리 순서
const DISPLAY_CATEGORIES = [
  { id: "AI", label: "인공지능 (AI)" },
  { id: "Tech", label: "테크 / 기기" },
  { id: "Business", label: "IT 기업" },
  { id: "Game", label: "게임" },
  { id: "Stock", label: "주식" },
  { id: "Coin", label: "코인" },
];

// 카테고리별 포인트 색상
const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || "";
    switch (cat) {
      case "ai": return "text-blue-600";
      case "tech": return "text-indigo-600";
      case "stock": return "text-red-600";
      case "coin": return "text-orange-600";
      case "game": return "text-purple-600";
      case "business": return "text-emerald-600";
      default: return "text-slate-600";
    }
  };

export default async function HomePage() {
  const allNews = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  const heroNews = allNews.filter((n) => n.importance === "high");
  
  const getCategoryNews = (catId: string) => 
    allNews.filter((n) => 
      (n.category?.toLowerCase() === catId.toLowerCase()) && n.importance !== "high"
    );

  const mainHero = heroNews[0];
  const sideHeroes = heroNews.slice(1, 4);

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 메인 콘텐츠 영역 (3/4) */}
            <div className="lg:col-span-3">
            
                {/* 1. 🔥 상단 헤드라인 (카테고리/날짜 제거됨) */}
                <section className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
                    </div>
                    
                    {heroNews.length === 0 ? (
                        <div className="text-gray-400 py-32 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            중요 뉴스가 없습니다.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* 메인 기사 */}
                            {mainHero && (
                                <div className="lg:col-span-7">
                                    <Link href={`/news/${mainHero.category || 'AI'}/${mainHero.id}`} className="group block">
                                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 mb-5">
                                            {mainHero.imageUrl ? (
                                                <img src={mainHero.imageUrl} alt={mainHero.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                            )}
                                        </div>
                                        {/* 👇 [수정] 카테고리 태그 제거하고 제목만 남김 */}
                                        <h3 className="text-3xl font-black leading-tight group-hover:text-blue-700 transition-colors mt-2">
                                            {mainHero.title}
                                        </h3>
                                    </Link>
                                </div>
                            )}
                            {/* 서브 기사 리스트 */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                {sideHeroes.map((item) => (
                                    <Link key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className="group flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold leading-snug group-hover:text-blue-700 line-clamp-3 mb-1">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. ⚡️ 카테고리 섹션 (2열 그리드) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                    {DISPLAY_CATEGORIES.map((cat) => {
                        const catNews = getCategoryNews(cat.id);
                        if (catNews.length === 0) return null;

                        const visualNews = catNews[0];
                        const listNews = catNews.slice(1, 11); 

                        return (
                            <section key={cat.id} className="flex flex-col">
                                {/* 카테고리 헤더 */}
                                <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-900">
                                    <h3 className={`text-xl font-black ${getCategoryColor(cat.id)}`}>
                                        {cat.label}
                                    </h3>
                                    <Link href={`/news/${cat.id}`} className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center">
                                        더보기 <ChevronRight size={12} />
                                    </Link>
                                </div>

                                {/* [상단] 대표 이미지 기사 1개 (제목만 표시) */}
                                {visualNews && (
                                    <div className="mb-6 group">
                                        <Link href={`/news/${visualNews.category || cat.id}/${visualNews.id}`}>
                                            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                                                {visualNews.imageUrl ? (
                                                    <img 
                                                        src={visualNews.imageUrl} 
                                                        alt={visualNews.title} 
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No Image</div>
                                                )}
                                            </div>
                                            <h4 className="text-xl font-bold leading-snug text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                                                {visualNews.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                {visualNews.summary}
                                            </p>
                                        </Link>
                                    </div>
                                )}

                                {/* [하단] 텍스트 리스트 (제목만 표시) */}
                                <ul className="flex flex-col gap-3">
                                    {listNews.map((item) => (
                                        <li key={item.id}>
                                            <Link 
                                                href={`/news/${item.category || cat.id}/${item.id}`}
                                                className="group block"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="text-[15px] font-medium text-slate-700 leading-snug group-hover:text-blue-700 line-clamp-1 transition-colors">
                                                        <span className="text-gray-300 mr-2">·</span>
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            </div>

            {/* [오른쪽] 사이드바 (Sticky) */}
            <aside className="lg:col-span-1">
                 <div className="sticky top-12">
                    <NewsSidebar />
                 </div>
            </aside>

        </div>
      </div>
    </div>
  );
}