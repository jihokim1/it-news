import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import Image from "next/image";

/* DB 실시간 반영 설정 */
// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";
// export const revalidate = 0;

const getOptimizedUrl = (url: string, width: number) => {
    if (!url) return "";
    if (url.endsWith(".webp")) return url; // 이미 WebP면 통과
    // wsrv.nl을 통해 리사이징 + WebP 변환 + 품질 80% 적용
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
  };

const TOP_WIDE_CATEGORIES = [
  { id: "AI", label: "AI" },
  { id: "IT", label: "IT" },
];
const MIDDLE_SPLIT_CATEGORIES = [
  { id: "Stock", label: "주식" },
  { id: "Coin", label: "코인" },
];
const BOTTOM_CATEGORY = { id: "Tech", label: "테크" };

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
  // 1. 전체 기사 가져오기
  const allNews = await prisma.news.findMany({
    where: {
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 100, 
  });

  // 2. 메인 헤드라인 로직
  // @ts-ignore
  const pinnedHero = allNews.find((n) => n.isPinned === true);

  const mainHero = pinnedHero 
    ? pinnedHero 
    : allNews.find((n) => n.importance && n.importance.toLowerCase() === "high") || allNews[0];

  // 3. 서브 리스트
  const subHeroes = allNews
    .filter((n) => n.id !== mainHero?.id)
    .filter((n) => n.importance && n.importance.toLowerCase() === "high")
    .slice(0, 4);

  // 4. 주요 뉴스
  const majorNews = allNews
    .filter((n) => n.id !== mainHero?.id)       
    .filter((n) => !subHeroes.find(s => s.id === n.id)) 
    .slice(0, 4);

  // 헬퍼 함수
  const getCategoryData = (catId: string) => {
    const catNews = allNews.filter((n) => n.category?.toLowerCase() === catId.toLowerCase());
    if (catNews.length === 0) return null;
    const headline = catNews.find(n => n.importance && n.importance.toLowerCase() === "high");
    const mainNews = headline || catNews[0];
    const subNews = catNews.filter(n => n.id !== mainNews.id).slice(0, 4);
    return { main: mainNews, subs: subNews };
  };

  // ListItem 컴포넌트 (내부 태그 div로 변경하여 에러 방지)
  const ListItem = ({ item }: { item: any }) => (
    <Link href={`/news/${item.category}/${item.id}`} className="flex gap-3 group items-start">
      <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border-2 border-gray-100">
        {item.imageUrl && (
            <Image
            src={getOptimizedUrl(item.imageUrl, 300)}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100px, 120px"
            loading="lazy"    // 👈 추가
            decoding="async"  // 👈 추가
            />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-0.5">
        <div className="text-sm font-bold leading-snug text-slate-900 group-hover:text-blue-600 line-clamp-1 mb-1 transition-colors">
          {item.title}
        </div>
        <div className="text-xs text-gray-500 line-clamp-1 mb-1 leading-relaxed">
          {item.summary}
        </div>
        <span className="text-[11px] font-bold text-gray-400">
          {item.reporterName || "이정혁 기자"}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">

        {/* =====================================================================================
            [섹션 1] 메인 헤드라인
            ===================================================================================== */}
        <section className="mb-12 border-b border-gray-100 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[500px]">
            
            {/* 1-1. 왼쪽 메인 기사 */}
            <div className="lg:col-span-8 relative group 
                aspect-[4/3] h-auto lg:aspect-auto lg:h-full 
                w-screen lg:w-full 
                ml-[50%] -translate-x-1/2 lg:ml-0 lg:translate-x-0 
                -mt-8 lg:mt-0 
                lg:rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/5">
                
                {mainHero ? (
                    <Link href={`/news/${mainHero.category || 'AI'}/${mainHero.id}`} className="block h-full w-full relative">
                        {mainHero.imageUrl ? (
                            <Image 
                                src={mainHero.imageUrl} 
                                alt={mainHero.title} 
                                fill
                                priority={true} 
                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                sizes="(max-width: 1024px) 100vw, 850px"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-500">NO IMAGE</div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                        
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-14 pb-8">
                            <div className="lg:backdrop-blur-md lg:bg-white/20 lg:border lg:border-white/20 rounded-xl lg:rounded-2xl lg:p-6 lg:shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-blue-600/30">
                                        {mainHero.category || 'HEADLINE'}
                                    </span>

                                    {/* @ts-ignore */}
                                    {mainHero.isPinned && (
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                            Main
                                        </span>
                                    )}

                                    <span className="text-gray-300 text-xs font-medium border-l border-white/30 pl-3">
                                        {new Date(mainHero.publishedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-2 drop-shadow-lg line-clamp-3 break-keep">
                                        {mainHero.title}
                                </h1>
                                
                                <p className="text-gray-300 text-sm md:text-lg line-clamp-1 md:line-clamp-2 font-medium opacity-90 block">
                                    {mainHero.summary}
                                </p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">등록된 헤드라인 없음</div>
                )}
            </div>

            {/* 1-2. 오른쪽 Trending Now (4칸) */}
            <div className="lg:col-span-4 flex flex-col h-full mt-8 lg:mt-0 px-1">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="bg-red-100 p-1.5 rounded-lg">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 3.258 1.37 6.12z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Hot Issue
                        </h2>
                    </div>
                    <Link href="/news/all" className="group flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
                        더보기
                        <span className="group-hover:translate-x-0.5 transition-transform">+</span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    {subHeroes.map((item) => (
                        <div key={item.id} className="flex-1 group relative bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 flex items-center">
                            {/* 🟢 Link 내부에는 div만 사용 (Hydration 에러 방지) */}
                            <Link href={`/news/${item.category || 'AI'}/${item.id}`} className="flex gap-4 items-start w-full h-full">
                                <div className="w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-inner">
                                    {item.imageUrl && (
                                        <Image
                                        src={getOptimizedUrl(item.imageUrl, 300)}
                                            alt={item.title} 
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            sizes="128px"
                                            loading="lazy"    // 👈 추가
                                            decoding="async"  // 👈 추가
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                                    <div className="text-sm md:text-[15px] font-bold leading-snug text-slate-900 group-hover:text-blue-600 line-clamp-2 transition-colors mb-1">
                                        {item.title}
                                    </div>
                                    <div className="text-xs text-gray-500 leading-relaxed line-clamp-2 font-medium">
                                        {item.summary || "기사 내용이 없습니다."}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* =====================================================================================
            [나머지 섹션]
            ===================================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="lg:col-span-3 space-y-12">
            
            {/* 섹션 2: 주요 뉴스 */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-black text-slate-900">주요뉴스</h2>
                <div className="h-[2px] flex-1 bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {majorNews.map((item) => (
                    <Link key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className="group block">
                    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm border-2 border-gray-200">
                        {item.imageUrl && (
                        <Image
                        src={getOptimizedUrl(item.imageUrl, 300)}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            loading="lazy"    // 👈 추가
                            decoding="async"  // 👈 추가
                        />
                        )}
                    </div>
                    <div className="font-bold text-sm leading-snug text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</div>
                    <span className="text-gray-400 text-[10px] mt-1 block font-bold">{item.reporterName || "이정혁 기자"}</span>
                    </Link>
                ))}
                </div>
            </section>

            {/* 섹션 3: 카테고리별 뉴스 */}
            <div className="space-y-10">
                {TOP_WIDE_CATEGORIES.map((cat) => {
                    const data = getCategoryData(cat.id);
                    if (!data) return null;
                    const { main: mainCatNews, subs: subCatNews } = data;
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
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200 relative">
                                {mainCatNews.imageUrl && (
                                    <Image
                                    src={mainCatNews.imageUrl}
                                    alt={mainCatNews.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    loading="lazy"    // 👈 추가
                                    decoding="async"  // 👈 추가
                                    />
                                )}
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

            {/* 섹션 4: 주식 & 코인 */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t-2 border-gray-200 pt-6">
                {MIDDLE_SPLIT_CATEGORIES.map((cat) => {
                    const data = getCategoryData(cat.id);
                    if (!data) return null;
                    const { main, subs } = data;
                    const titleColor = getCategoryColor(cat.id);

                    return (
                        <div key={cat.id}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-xl font-black ${titleColor}`}>{cat.label}</h3>
                            <Link href={`/news/${cat.id}`} className="text-xl font-bold text-gray-400 hover:text-slate-900">+</Link>
                        </div>

                        <div className="mb-8">
                            <Link href={`/news/${main.category || cat.id}/${main.id}`} className="group block">
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3 border-2 border-gray-200 relative">
                                {main.imageUrl && (
                                <Image
                                    src={main.imageUrl}
                                    alt={main.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    loading="lazy"    // 👈 추가
                                    decoding="async"  // 👈 추가
                                />
                                )}
                            </div>
                            <div className="min-h-[100px] flex flex-col">
                                <h4 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-600 mb-2 line-clamp-2 transition-colors">
                                {main.title}
                                </h4>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {main.summary}
                                </p>
                            </div>
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

            {/* 섹션 5: 테크 */}
            {(() => {
                const cat = BOTTOM_CATEGORY;
                const data = getCategoryData(cat.id);
                if (!data) return null;
                const { main: mainCatNews, subs: subCatNews } = data;
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
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200 relative">
                            {mainCatNews.imageUrl && (
                            <Image
                                src={mainCatNews.imageUrl}
                                alt={mainCatNews.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                loading="lazy"    // 👈 추가
                                decoding="async"  // 👈 추가
                            />
                            )}
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