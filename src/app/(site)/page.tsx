import { prisma } from "@/lib/prisma";
// import Link from "next/link"; //  Next.js 링크 삭제 (구글 광고 충돌 원인)
import { NewsSidebar } from "@/components/news/NewsSidebar";
import Image from "next/image"; // Next.js Image 사용 (unoptimized 적용)

/* DB 실시간 반영 설정 */
// export const dynamic = "force-dynamic"; //  삭제 (캐싱 적용)
// export const fetchCache = "force-no-store"; //  삭제 (캐싱 적용)
export const revalidate = 60; // [수정] 60초 캐싱 (뒤로가기 속도 향상 & 메모리 보호)

// [핵심 수정] 스토리지 직통 연결 (슈파베이스 이미지 변환 API를 통한 해상도 강제 축소)
const getOptimizedUrl = (url: string, width: number = 400) => {
  if (!url) return "";
  
  // 1. 이미 슈파베이스 이미지 변환 URL이 적용된 경우 원본 반환
  if (url.includes('/render/image/public/')) return url;

  // 2. 일반 public URL인 경우, 슈파베이스 내부 변환 API 주소로 글자 바꿔치기 및 해상도 파라미터 추가
  return url.replace(
    '/storage/v1/object/public/', 
    `/storage/v1/render/image/public/`
  ) + `?width=${width}&resize=contain`; 
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
  const now = new Date();

  //  Promise.all을 사용하여 필요한 기사만 '동시에' 정확하게 타격하여 가져옵니다.
  const [
    latestNews, // 메인 상단용 (최신 10개)
    aiNews,     // AI 카테고리용 (최신 5개)
    itNews,     // IT 카테고리용 (최신 5개)
    stockNews,  // 주식 카테고리용 (최신 5개)
    coinNews,   // 코인 카테고리용 (최신 5개)
    techNews    // 테크 카테고리용 (최신 5개)
  ] = await Promise.all([
    prisma.news.findMany({ where: { publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 10 }),
    prisma.news.findMany({ where: { category: "AI", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.news.findMany({ where: { category: "IT", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.news.findMany({ where: { category: "Stock", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.news.findMany({ where: { category: "Coin", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 5 }),
    prisma.news.findMany({ where: { category: "Tech", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 5 }),
  ]);

  // 2. 메인 헤드라인 로직 (latestNews에서 추출)
  // @ts-ignore
  const pinnedHero = latestNews.find((n) => n.isPinned === true);
  const mainHero = pinnedHero 
    ? pinnedHero 
    : latestNews.find((n) => n.importance && n.importance.toLowerCase() === "high") || latestNews[0];

  // 3. 서브 리스트 및 주요 뉴스 (latestNews에서 추출)
  const subHeroes = latestNews
    .filter((n) => n.id !== mainHero?.id)
    .filter((n) => n.importance && n.importance.toLowerCase() === "high")
    .slice(0, 4);

  const majorNews = latestNews
    .filter((n) => n.id !== mainHero?.id)       
    .filter((n) => !subHeroes.find(s => s.id === n.id)) 
    .slice(0, 4);

  // ⭐ [핵심 교정] 미리 가져온 병렬 데이터를 매핑해 줍니다.
  const categoryMap: Record<string, any[]> = {
    "AI": aiNews,
    "IT": itNews,
    "Stock": stockNews,
    "Coin": coinNews,
    "Tech": techNews,
  };

  // 헬퍼 함수 교정 (전체 필터링 대신 매핑된 배열을 바로 사용)
  const getCategoryData = (catId: string) => {
    const catNews = categoryMap[catId];
    if (!catNews || catNews.length === 0) return null; // 이제 기사가 없어서 깨질 일은 거의 없습니다.
    
    const headline = catNews.find(n => n.importance && n.importance.toLowerCase() === "high");
    const mainNews = headline || catNews[0];
    const subNews = catNews.filter(n => n.id !== mainNews.id).slice(0, 4);
    return { main: mainNews, subs: subNews };
  };

  // ListItem 컴포넌트
  const ListItem = ({ item, isPriority = false }: { item: any; isPriority?: boolean }) => (
    // [핵심 수정] Link -> a 태그로 변경하여 구글 광고 충돌(Back 버튼 오류) 원천 차단
    <a 
      href={`/news/${item.category}/${item.id}`} 
      className="flex gap-3 group items-start"
      // [핵심 추가] 60개 렌더링 렉을 없애기 위해, 화면 밖 요소의 렌더링을 생략시키는 CSS 최신 기술 적용
      style={{ contentVisibility: "auto", containIntrinsicSize: "80px" }}
    >
      <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border-2 border-gray-100">
        {item.imageUrl && (
          <Image
            src={getOptimizedUrl(item.imageUrl, 200)}
            alt={item.title}
            width={200}  
            height={133} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized // Vercel 한도 우회
            // [수정] 60개의 네트워크 폭주를 막기 위해, 우선순위가 아니면 지연 로딩 적용
            {...(isPriority ? { priority: true } : { loading: "lazy", decoding: "async" })}
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
    </a>
  );

  return (
    <>
      {/* 슈파베이스 스토리지 서버 사전 연결 (Preconnect & DNS-Prefetch) */}
      <link rel="preconnect" href="https://luzcrfpmfdodyplchtkq.supabase.co" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://luzcrfpmfdodyplchtkq.supabase.co" />

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
                  // [핵심 수정] Link -> a 태그로 변경
                  <a href={`/news/${mainHero.category || 'AI'}/${mainHero.id}`} className="block h-full w-full relative">
                    {mainHero.imageUrl ? (
                      <Image 
                        src={getOptimizedUrl(mainHero.imageUrl, 800)}
                        alt={mainHero.title} 
                        width={800}  
                        height={600} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        priority // 메인 헤드라인 즉시 로딩 강제
                        unoptimized
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
                  </a>
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
                  {/* [핵심 수정] Link -> a 태그 */}
                  <a href="/news/all" className="group flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">
                    더보기
                    <span className="group-hover:translate-x-0.5 transition-transform">+</span>
                  </a>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  {subHeroes.map((item) => (
                    <div key={item.id} className="flex-1 group relative bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 flex items-center">
                      {/* [핵심 수정] Link -> a 태그 */}
                      <a href={`/news/${item.category || 'AI'}/${item.id}`} className="flex gap-4 items-start w-full h-full">
                        <div className="w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-inner">
                          {item.imageUrl && (
                            <Image 
                              src={getOptimizedUrl(item.imageUrl, 200)}
                              alt={item.title} 
                              width={200}  
                              height={150} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              priority // 우측 상단 핫이슈 즉시 로딩
                              unoptimized
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
                      </a>
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
                    // [핵심 수정] Link -> a 태그
                    <a key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className="group block">
                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm border-2 border-gray-200">
                        {item.imageUrl && (
                          <Image
                            src={getOptimizedUrl(item.imageUrl, 300)}
                            alt={item.title}
                            width={300}  
                            height={188} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            priority // 상단 주요뉴스 즉시 로딩
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="font-bold text-sm leading-snug text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</div>
                      <span className="text-gray-400 text-[10px] mt-1 block font-bold">{item.reporterName || "이정혁 기자"}</span>
                    </a>
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
                        {/* [핵심 수정] Link -> a 태그 */}
                        <a href={`/news/${cat.id}`} className="text-sm font-bold text-gray-400 hover:text-slate-900">더보기 +</a>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="border-r-0 lg:border-r-2 border-gray-200 lg:pr-8">
                          {/* [핵심 수정] Link -> a 태그 */}
                          <a href={`/news/${mainCatNews.category || cat.id}/${mainCatNews.id}`} className="group block">
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200 relative">
                              {mainCatNews.imageUrl && (
                                <Image
                                  src={getOptimizedUrl(mainCatNews.imageUrl, 500)}
                                  alt={mainCatNews.title}
                                  width={500}  
                                  height={281} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  unoptimized // Vercel 한도 우회
                                  // 하단 섹션들은 기본값(lazy loading) 유지
                                />
                              )}
                            </div>
                            <h4 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-blue-600 mb-3 transition-colors">{mainCatNews.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{mainCatNews.summary}</p>
                          </a>
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
                        {/* [핵심 수정] Link -> a 태그 */}
                        <a href={`/news/${cat.id}`} className="text-xl font-bold text-gray-400 hover:text-slate-900">+</a>
                      </div>

                      <div className="mb-8">
                        {/* [핵심 수정] Link -> a 태그 */}
                        <a href={`/news/${main.category || cat.id}/${main.id}`} className="group block">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3 border-2 border-gray-200 relative">
                            {main.imageUrl && (
                              <Image
                                src={getOptimizedUrl(main.imageUrl, 500)}
                                alt={main.title}
                                width={500}  
                                height={281} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized // Vercel 한도 우회
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
                        </a>
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
                      {/* [핵심 수정] Link -> a 태그 */}
                      <a href={`/news/${cat.id}`} className="text-sm font-bold text-gray-400 hover:text-slate-900">더보기 +</a>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="border-r-0 lg:border-r-2 border-gray-200 lg:pr-8">
                        {/* [핵심 수정] Link -> a 태그 */}
                        <a href={`/news/${mainCatNews.category || cat.id}/${mainCatNews.id}`} className="group block">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 border-2 border-gray-200 relative">
                            {mainCatNews.imageUrl && (
                              <Image
                                src={getOptimizedUrl(mainCatNews.imageUrl, 500)}
                                alt={mainCatNews.title}
                                width={500}  
                                height={281} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized // Vercel 한도 우회
                              />
                            )}
                          </div>
                          <h4 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-blue-600 mb-3 transition-colors">{mainCatNews.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{mainCatNews.summary}</p>
                        </a>
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
    </>
  );
}