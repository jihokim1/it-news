import { prisma } from "@/lib/prisma";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import ResponsiveNewsList from "@/components/news/ResponsiveNewsList";

// [필수] 뒤로가기/새로고침 시 캐싱 문제 해결
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

// 1. [핵심] 박사님이 원하시는 "한글 이름표"를 여기에 정의했습니다.
// URL(영어)로 들어오면 -> 화면(한글)로 바꿔주는 번역기입니다.
const CATEGORY_MAP: Record<string, string> = {
  all: "전체 기사",      // all -> 전체 기사
  ai: "AI",            // ai -> AI
  tech: "테크",        // tech -> 테크
  business: "비즈니스", // business -> 비즈니스
  stock: "주식",       // stock -> 주식
  coin: "코인",        // coin -> 코인
  game: "게임",        // game -> 게임
  it: "IT",            // it -> IT
};

// 2. 카테고리별 색상 설정 (한글 기준)
const getCategoryColor = (categoryName: string) => {
  const name = categoryName.trim();
  if (name === "AI") return "text-blue-600";
  if (name === "테크" || name === "IT") return "text-indigo-600";
  if (name === "비즈니스" || name === "기업") return "text-violet-600";
  if (name === "주식" || name === "마켓") return "text-red-600";
  if (name === "코인" || name === "크립토") return "text-orange-600";
  if (name === "전체 기사") return "text-slate-900"; // 전체는 검정색
  return "text-slate-600";
};

export default async function NewsCategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page } = await searchParams;
  
  // URL에서 온 값 (예: 'all', 'tech', 'stock')
  const rawCategory = decodeURIComponent(category).toLowerCase();

  // 1. [수정] 박사님이 원하시는 "한글 제목" 가져오기
  // 맵에 있으면 한글로, 없으면 그냥 영어(rawCategory) 보여줌
  const displayTitle = CATEGORY_MAP[rawCategory] || rawCategory.toUpperCase();

  // 2. 페이지네이션 설정
  const currentPage = Number(page) || 1;
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  // 3. DB 조회 조건 설정 ('all'이면 조건 없음)
  const isAll = rawCategory === "all";
  
  const whereCondition = isAll 
    ? {} 
    : {
        category: {
          // DB에는 영문/한글 섞여 있을 수 있으니 둘 다 찾도록 처리할 수도 있지만,
          // 일단 URL값(tech 등)을 포함하는 것으로 검색
          contains: rawCategory, 
          mode: 'insensitive' as const, 
        },
      };

  // 4. DB 조회
  const [newsList, totalCount] = await Promise.all([
    prisma.news.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip: skip,
    }),
    prisma.news.count({ where: whereCondition }),
  ]);

  // 5. 화면 갱신용 키값 (데이터 바뀌면 화면 갈아엎기)
  const refreshKey = newsList.length > 0 ? newsList[0].id : "empty";

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 기사 리스트 */}
            <div className="lg:col-span-3">
                
                {/* 헤더: 여기서 이제 '전체 기사', '테크', '주식' 으로 나옵니다. */}
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
                        // 키값에 한글제목을 넣어서 확실하게 구분
                        key={`${rawCategory}-${currentPage}-${refreshKey}`}
                        initialNews={newsList} 
                        category={category} // URL 유지용으로 원본 전달
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