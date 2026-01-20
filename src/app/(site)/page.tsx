import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import { ArrowUpRight } from "lucide-react";

// 카테고리 설정
const DISPLAY_CATEGORIES = [
  { id: "AI", label: "Artificial Intelligence" },
  { id: "Tech", label: "Technology" },
  { id: "Business", label: "Business" },
  { id: "Game", label: "Gaming" },
  { id: "Stock", label: "Market" },
  { id: "Coin", label: "Crypto" },
];

// 미니멀한 색상 포인트 (텍스트 색상만 변경)
const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || "";
    switch (cat) {
      case "ai": return "text-blue-600";
      case "tech": return "text-indigo-600";
      case "stock": return "text-red-600";
      case "coin": return "text-orange-600";
      default: return "text-slate-900";
    }
};

export default async function HomePage() {
  const allNews = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  const heroNews = allNews.filter((n) => n.importance === "high");
  const mainHero = heroNews[0];
  const subHeroes = heroNews.slice(1, 4);

  // 나머지 뉴스 중 최신 5개 (Newstapa 스타일 리스트용)
  const recentNews = allNews.filter(n => n.id !== mainHero?.id).slice(0, 5);

  const getCategoryNews = (catId: string) => 
    allNews.filter((n) => 
      (n.category?.toLowerCase() === catId.toLowerCase()) && n.importance !== "high"
    ).slice(0, 4); // 4개만 가져오기

  return (
    // 배경: 완전한 화이트 (종이 질감)
    <div className="bg-white min-h-screen font-sans text-black selection:bg-black selection:text-white">
      
      <div className="container mx-auto px-4 max-w-screen-xl border-x border-gray-100 min-h-screen">
        
        {/* [섹션 1] 초대형 헤드라인 (잡지 표지 스타일) */}
        <section className="py-12 md:py-16 border-b border-black">
            {mainHero ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* 텍스트 영역 (왼쪽) */}
                    <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                        <span className={`font-bold tracking-wider text-sm mb-4 uppercase ${getCategoryColor(mainHero.category || '')}`}>
                            {mainHero.category || 'COVER STORY'}
                        </span>
                        <Link href={`/news/${mainHero.category || 'AI'}/${mainHero.id}`} className="group">
                            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-6 group-hover:underline decoration-4 underline-offset-4 decoration-blue-600 transition-all">
                                {mainHero.title}
                            </h1>
                            <p className="text-lg text-gray-500 leading-relaxed font-medium line-clamp-3 mb-6">
                                {mainHero.summary}
                            </p>
                            <div className="flex items-center text-sm font-bold text-black border-b border-black w-fit pb-1 group-hover:text-blue-600 group-hover:border-blue-600 transition-colors">
                                READ ARTICLE <ArrowUpRight className="ml-1 w-4 h-4" />
                            </div>
                        </Link>
                    </div>

                    {/* 이미지 영역 (오른쪽) */}
                    <div className="lg:col-span-7 order-1 lg:order-2">
                        <Link href={`/news/${mainHero.category || 'AI'}/${mainHero.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
                             {mainHero.imageUrl && (
                                <img src={mainHero.imageUrl} alt={mainHero.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0" />
                             )}
                             {/* 이미지 위에 날짜/작성자 오버레이 없음 (미니멀) */}
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center font-black text-6xl text-gray-100 uppercase tracking-tighter">
                    No Headline
                </div>
            )}
        </section>

        {/* [섹션 2] 3칼럼 그리드 (서브 헤드라인 + 최신 뉴스) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-gray-200">
            
            {/* 왼쪽: 서브 헤드라인 (이미지 강조) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:border-r border-gray-200">
                {subHeroes.map((item, idx) => (
                    <Link key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className={`group block p-6 md:p-10 border-b border-gray-200 ${idx % 2 === 0 ? 'md:border-r' : ''}`}>
                        <div className="aspect-video bg-gray-100 mb-6 overflow-hidden">
                            {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{item.category || 'NEWS'}</span>
                        <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-blue-600 transition-colors">
                            {item.title}
                        </h3>
                    </Link>
                ))}
            </div>

            {/* 오른쪽: 텍스트 리스트 (LATEST) */}
            <div className="lg:col-span-4 p-6 md:p-10 bg-gray-50/50">
                <div className="flex items-center justify-between mb-8">
                    <h4 className="font-black text-sm uppercase tracking-widest text-gray-400">Latest Updates</h4>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </div>
                <div className="space-y-8">
                    {recentNews.map((item) => (
                        <Link key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className="group block">
                            <h5 className="text-lg font-bold leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.title}
                            </h5>
                            <span className="text-xs text-gray-400 font-mono">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* [섹션 3] 카테고리별 뉴스 (Bento Grid 스타일) */}
        <section className="py-16">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-12 gap-y-16">
                
                {/* 메인 콘텐츠 영역 (3/4) */}
                <div className="lg:col-span-3 space-y-20">
                    {DISPLAY_CATEGORIES.map((cat) => {
                        const news = getCategoryNews(cat.id);
                        if (news.length === 0) return null;

                        return (
                            <div key={cat.id} className="border-t-4 border-black pt-6">
                                <div className="flex justify-between items-end mb-8">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">{cat.label}</h2>
                                    <Link href={`/news/${cat.id}`} className="text-sm font-bold border-b border-gray-300 hover:border-black transition-colors pb-1">
                                        VIEW ALL
                                    </Link>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                    {news.map((item) => (
                                        <Link key={item.id} href={`/news/${item.category || cat.id}/${item.id}`} className="group flex gap-4 items-start">
                                            <div className="w-24 h-24 bg-gray-100 shrink-0 overflow-hidden">
                                                 {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold leading-snug group-hover:underline decoration-2 underline-offset-4 line-clamp-3">
                                                    {item.title}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 사이드바 (1/4) - Sticky 적용 */}
                <aside className="lg:col-span-1 h-fit sticky top-10 border-l border-gray-100 pl-8 hidden lg:block">
                     <div className="mb-8">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Trending Now</span>
                        <NewsSidebar />
                     </div>
                </aside>

             </div>
        </section>

      </div>
    </div>
  );
}