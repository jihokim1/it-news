import { prisma } from "@/lib/prisma";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import ResponsiveNewsList from "@/components/news/ResponsiveNewsList"; // 👈 컴포넌트 재사용

interface Props {
searchParams: Promise<{ page?: string }>; // 페이지 번호 받기
}

export default async function AllNewsPage({ searchParams }: Props) {
const { page } = await searchParams;

// 1. 페이지네이션 설정
const currentPage = Number(page) || 1;
const pageSize = 20;
const skip = (currentPage - 1) * pageSize;

// 2. DB 조회 (전체 기사 대상)
const [newsList, totalCount] = await Promise.all([
  prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: pageSize,
    skip: skip,
  }),
  prisma.news.count(), // 조건 없이 전체 개수 세기
]);

return (
  <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
    <div className="container mx-auto px-4 py-12 max-w-screen-xl">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* [왼쪽] 뉴스 리스트 (3/4) */}
          <div className="lg:col-span-3">
              
              {/* 헤더 */}
              <div className="flex items-end gap-3 mb-8 border-b-2 border-slate-900 pb-4">
                  <h1 className="text-3xl font-black uppercase text-slate-900">
                      All News
                  </h1>
                  {/* PC에서만 페이지 번호 표시 */}
                  <span className="hidden md:inline text-gray-400 text-sm font-medium pb-1">
                        Total <strong className="text-slate-900">{totalCount}</strong> articles 
                        <span className="text-xs ml-2 text-slate-300">Page {currentPage}</span>
                  </span>
              </div>

              {newsList.length > 0 ? (
                // 👇 여기서 "ALL" 카테고리로 넘겨줍니다.
                <ResponsiveNewsList 
                  initialNews={newsList}
                  category="ALL" 
                  totalCount={totalCount}
                  currentPage={currentPage}
                />
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg text-gray-400">
                    아직 등록된 뉴스가 없습니다.
                </div>
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