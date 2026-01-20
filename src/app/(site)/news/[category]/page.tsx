import { prisma } from "@/lib/prisma";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import ResponsiveNewsList from "@/components/news/ResponsiveNewsList";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

// 카테고리 색상 (헤더용)
const getCategoryColor = (category: string) => {
  const cat = category?.toLowerCase().trim() || ""; 
  if (cat === "ai" || cat === "인공지능") return "text-blue-600";
  if (cat === "tech" || cat === "테크" || cat === "기기") return "text-indigo-600";
  if (cat === "it" || cat === "business" || cat === "기업") return "text-violet-600";
  if (cat === "stock" || cat === "주식") return "text-red-600";
  if (cat === "coin" || cat === "코인") return "text-orange-600";
  if (cat === "game" || cat === "게임") return "text-purple-600";
  return "text-slate-600";
};

export default async function NewsCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page } = await searchParams;
  const decodedCategory = decodeURIComponent(category);

  // 1. 페이지 계산 설정
  const currentPage = Number(page) || 1;
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  // ⭐ [핵심 수정] "ALL"이면 조건 없이({}) 검색, 아니면 해당 카테고리 검색
  const isAll = decodedCategory.toUpperCase() === "ALL";

  const whereCondition = isAll 
    ? {} // ALL이면 필터 없음 (전체 조회)
    : {
        category: {
          contains: decodedCategory, 
          mode: 'insensitive' as const, 
        },
      };

  // 3. DB 조회
  const [newsList, totalCount] = await Promise.all([
    prisma.news.findMany({
      where: whereCondition, // 👈 수정된 조건 적용
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.news.count({ where: whereCondition }),
  ]);

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 기사 리스트 영역 */}
            <div className="lg:col-span-3">
                
                {/* 헤더 */}
                <div className="flex items-end gap-3 mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className={`text-3xl font-black uppercase ${isAll ? 'text-slate-900' : getCategoryColor(decodedCategory)}`}>
                        {isAll ? "All News" : decodedCategory} 
                    </h1>
                    
                    <span className="hidden md:inline text-gray-400 text-sm font-medium pb-1">
                         Total <strong className="text-slate-900">{totalCount}</strong> articles 
                         <span className="text-xs ml-2 text-slate-300">Page {currentPage}</span>
                    </span>
                </div>

                {newsList.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-lg text-gray-400">
                        아직 등록된 기사가 없습니다.
                    </div>
                ) : (
                    <ResponsiveNewsList 
                        initialNews={newsList} 
                        category={category} // URL 유지용
                        totalCount={totalCount}
                        currentPage={currentPage}
                    />
                )}

            </div>

            {/* [오른쪽] 사이드바 */}
            <aside className="lg:col-span-1">
                 <div className="sticky top-24">
                    <NewsSidebar />
                 </div>
            </aside>

        </div>
      </div>
    </div>
  );
}