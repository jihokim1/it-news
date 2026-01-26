import { prisma } from "@/lib/prisma";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import ResponsiveNewsList from "@/components/news/ResponsiveNewsList";

// [필수] 뒤로가기/새로고침 시 캐싱 문제 해결
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

const CATEGORY_MAP: Record<string, string> = {
  all: "전체 기사",      
  ai: "AI",            
  tech: "테크",        
  business: "IT", 
  stock: "주식",       
  coin: "코인",        
};

const getCategoryColor = (categoryName: string) => {
  const name = categoryName.trim();
  if (name === "AI") return "text-blue-600";
  if (name === "테크" || name === "IT") return "text-indigo-600";
  if (name === "비즈니스" || name === "기업") return "text-violet-600";
  if (name === "주식" || name === "마켓") return "text-red-600";
  if (name === "코인" || name === "크립토") return "text-orange-600";
  if (name === "전체 기사") return "text-slate-900"; 
  return "text-slate-600";
};

export default async function NewsCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page } = await searchParams;
  
  const rawCategory = decodeURIComponent(category).toLowerCase();
  const displayTitle = CATEGORY_MAP[rawCategory] || rawCategory.toUpperCase();

  const currentPage = Number(page) || 1;
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  const isAll = rawCategory === "all";
  
  // 👇 [핵심 수정 1] 카테고리 페이지에서도 '예약된 기사' 숨기기 (lte: new Date())
  const whereCondition = isAll 
    ? {
        publishedAt: { lte: new Date() } // 전체보기일 때도 시간 체크
      } 
    : {
        category: {
          contains: rawCategory, 
          mode: 'insensitive' as const, 
        },
        publishedAt: { lte: new Date() } // 특정 카테고리일 때도 시간 체크
      };

  const [newsList, totalCount] = await Promise.all([
    prisma.news.findMany({
      where: whereCondition,
      // 👇 [핵심 수정 2] 정렬 기준을 작성일 -> 발행일로 변경
      orderBy: { publishedAt: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.news.count({ where: whereCondition }),
  ]);

  const refreshKey = newsList.length > 0 ? newsList[0].id : "empty";

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 기사 리스트 */}
            <div className="lg:col-span-3">
                
                <div className="flex items-end gap-3 mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className={`text-3xl font-black uppercase ${getCategoryColor(displayTitle)}`}>
                        {displayTitle}
                    </h1>
                </div>

                {newsList.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-lg text-gray-400">
                        아직 등록된 기사가 없습니다.
                    </div>
                ) : (
                    <ResponsiveNewsList 
                        key={`${rawCategory}-${currentPage}-${refreshKey}`}
                        initialNews={newsList} 
                        category={category} 
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