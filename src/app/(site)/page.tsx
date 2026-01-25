import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";

/* DB read 바로 적용시키는 코드 */
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// 1. [수정됨] Business -> IT로 변경 (이제 IT 기사가 정상적으로 나옵니다)
const TOP_WIDE_CATEGORIES = [
  { id: "AI", label: "AI" },
  { id: "IT", label: "IT" }, 
];

// 2. 중간 2단 분할 카테고리 (주식, 코인)
const MIDDLE_SPLIT_CATEGORIES = [
  { id: "Stock", label: "주식" },
  { id: "Coin", label: "코인" },
];

// 3. 맨 밑 와이드 카테고리 (테크)
const BOTTOM_CATEGORY = { id: "Tech", label: "테크" };

// 색상 매핑
const getCategoryColor = (id: string) => {
  const cat = id.toLowerCase();
  switch (cat) {
    case "ai": return "text-blue-600";
    case "tech": return "text-indigo-600";
    case "business":                        
    case "it": return "text-violet-600";
    case "stock": return "text-red-600";
    case "coin": return "text-orange-600";
    default: return "text-slate-900";
  }
};

export default async function HomePage() {
  const allNews = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  // [수정됨] 중요도(importance)가 대문자 High든 소문자 high든 다 찾아내도록 변경
  const heroNews = allNews.filter((n) => n.importance && n.importance.toLowerCase() === "high").slice(0, 5);
  
  const mainHero = heroNews[0]; 
  const subHeroes = heroNews.slice(1, 5); 

  const majorNews = allNews
    .filter(n => !heroNews.find(h => h.id === n.id))
    .slice(0, 4);

  const getCategoryNews = (catId: string, limit: number) => 
    allNews.filter((n) => 
      (n.category?.toLowerCase() === catId.toLowerCase()) && 
      !heroNews.find(h => h.id === n.id)
    ).slice(0, limit);

  // [공통 UI] 리스트 아이템 컴포넌트
  const ListItem = ({ item }: { item: any }) => (
    <Link href={`/news/${item.category}/${item.id}`} className="flex gap-3 group items-start">
        {/* 썸네일 */}
        <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border-2 border-gray-100">
            {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            )}
        </div>
        {/* 텍스트 영역 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-0.5">
            <h5 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-blue-600 line-clamp-1 mb-1 transition-colors">
                {item.title}
            </h5>
            <p className="text-xs text-gray-500 line-clamp-1 mb-1 leading-relaxed">
                {item.summary}
            </p>
            <span className="text-[11px] font-bold text-gray-400">
                {item.reporterName || "이정혁 기자"}
            </span>
        </div>
    </Link>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      
      <div className="container mx-auto px-4 py-8 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            
            {/* [왼쪽 3칸] 메인 콘텐츠 */}
            <div className="lg:col-span-3 space-y-12">
                
                {/* ================= [섹션 1] 헤드라인 ================= */}
                <section className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6">
                    <div className="lg:col-span-4 relative group">
                        {mainHero ? (
                            <Link href={`/news/${mainHero.category || 'AI'}/${mainHero.id}`} className="block h-full w-full">
                                <div className="relative w-full h-[300px] lg:h-[380px] rounded-2xl overflow-hidden shadow-sm border-2 border-gray-200">
                                    {mainHero.imageUrl ? (
                                        <img src={mainHero.imageUrl} alt={mainHero.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">NO IMAGE</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90" />
                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2">{mainHero.category || '이슈'}</span>
                                        <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2 line-clamp-2 drop-shadow-sm">{mainHero.title}</h1>
                                        <p className="text-gray-300 text-sm line-clamp-2 opacity-90 font-medium">{mainHero.summary}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="w-full h-[380px] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">뉴스 없음</div>
                        )}
                    </div>
                    {/* 우측 리스트 */}
                    <div className="lg:col-span-3 flex flex-col gap-2">
                        {subHeroes.map((item) => (
                            <div key={item.id} className="p-2.5 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-black transition-all h-full flex items-center">
                                <ListItem item={item} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ================= [섹션 2] 주요 뉴스 ================= */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-black text-slate-900">주요뉴스</h2>
                        <div className="h-[2px] flex-1 bg-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {majorNews.map((item) => (
                             <Link key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className="group block">
                                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm border-2 border-gray-200">
                                    {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                </div>
                                <h3 className="font-bold text-sm leading-snug text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
                                <span className="text-gray-400 text-[10px] mt-1 block font-bold">{item.reporterName || "이정혁 기자"}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ================= [섹션 3] AI, IT (와이드) ================= */}
                <div className="space-y-10">
                    {TOP_WIDE_CATEGORIES.map((cat) => {
                        const news = getCategoryNews(cat.id, 4);
                        // 기사가 없어도 섹션은 보이게 하려면 아래 if문을 지우세요.
                        if (news.length === 0) return null;
                        
                        const mainCatNews = news[0];
                        const subCatNews = news.slice(1, 4);
                        const titleColor = getCategoryColor(cat.id);

                        return (
                            <section key={cat.id} className="border-t-2 border-gray-200 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-xl font-black ${titleColor}`}>{cat.label}</h3>
                                    <Link href={`/news/${cat.id}`} className="text-sm font-bold text-gray-400 hover:text-slate-900">더보기 +</Link>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="border-r-0 lg:border-r-2 border-gray-200 lg:pr-8">
                                        <Link href={`/news/${mainCatNews.category || cat.id}/${mainCatNews.id}`} className="group block">
                                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200">
                                                 {mainCatNews.imageUrl && <img src={mainCatNews.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                            </div>
                                            <h4 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-blue-600 mb-3 transition-colors">{mainCatNews.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{mainCatNews.summary}</p>
                                        </Link>
                                    </div>
                                    <div className="flex flex-col gap-5">
                                        {subCatNews.map((item) => (
                                            <ListItem key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* ================= [섹션 4] 주식 & 코인 (세트/반반) ================= */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t-2 border-gray-200 pt-6">
                    {MIDDLE_SPLIT_CATEGORIES.map((cat) => {
                        const news = getCategoryNews(cat.id, 4);
                        if (news.length === 0) return null;
                        const main = news[0];
                        const subs = news.slice(1, 4);
                        const titleColor = getCategoryColor(cat.id);

                        return (
                            <div key={cat.id}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-xl font-black ${titleColor}`}>{cat.label}</h3>
                                    <Link href={`/news/${cat.id}`} className="text-xl font-bold text-gray-400 hover:text-slate-900">+</Link>
                                </div>
                                <div className="mb-6">
                                    <Link href={`/news/${main.category || cat.id}/${main.id}`} className="group block">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3 border-2 border-gray-200 relative">
                                            {main.imageUrl && <img src={main.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                        </div>
                                        <h4 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-600 mb-2 line-clamp-2 transition-colors">{main.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{main.summary}</p>
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {subs.map((item) => (
                                        <ListItem key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* ================= [섹션 5] 테크 (맨 밑, 와이드) ================= */}
                {(() => {
                    const cat = BOTTOM_CATEGORY;
                    const news = getCategoryNews(cat.id, 4);
                    if (news.length === 0) return null;
                    const mainCatNews = news[0];
                    const subCatNews = news.slice(1, 4);
                    const titleColor = getCategoryColor(cat.id);

                    return (
                        <section className="border-t-2 border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-xl font-black ${titleColor}`}>{cat.label}</h3>
                                <Link href={`/news/${cat.id}`} className="text-sm font-bold text-gray-400 hover:text-slate-900">더보기 +</Link>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="border-r-0 lg:border-r-2 border-gray-200 lg:pr-8">
                                    <Link href={`/news/${mainCatNews.category || cat.id}/${mainCatNews.id}`} className="group block">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200">
                                                {mainCatNews.imageUrl && <img src={mainCatNews.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                        </div>
                                        <h4 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-blue-600 mb-3 transition-colors">{mainCatNews.title}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{mainCatNews.summary}</p>
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-5">
                                    {subCatNews.map((item) => (
                                        <ListItem key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })()}

            </div>

            {/* [오른쪽 1칸] 사이드바 */}
            <aside className="lg:col-span-1">
                <div className="sticky top-8">
                    <NewsSidebar />
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
}