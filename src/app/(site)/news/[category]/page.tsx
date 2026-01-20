import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";

interface Props {
  params: Promise<{ category: string }>;
}

// [수정됨] 카테고리별 포인트 색상 (대소문자/한글 완벽 호환)
const getCategoryColor = (category: string) => {
  const cat = category?.toLowerCase().trim() || ""; // 소문자 변환 및 공백 제거

  // 1. AI (파랑)
  if (cat === "ai" || cat === "인공지능") return "text-blue-600";
  
  // 2. 테크/Tech (인디고)
  if (cat === "tech" || cat === "테크" || cat === "기기") return "text-indigo-600";
  
  // 3. IT/Business (보라) - 헤더와 통일
  if (cat === "it" || cat === "business" || cat === "기업") return "text-violet-600";
  
  // 4. 주식/Stock (빨강)
  if (cat === "stock" || cat === "주식") return "text-red-600";
  
  // 5. 코인/Coin (주황)
  if (cat === "coin" || cat === "코인") return "text-orange-600";
  
  // 6. 게임/Game (보라)
  if (cat === "game" || cat === "게임") return "text-purple-600";

  // 기본값 (회색)
  return "text-slate-600";
};

// 날짜 포맷
const formatTime = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default async function NewsCategoryPage({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  // DB 조회
  const newsList = await prisma.news.findMany({
    where: {
      category: {
        contains: decodedCategory, 
        mode: 'insensitive', 
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 기사 리스트 영역 (3/4) */}
            <div className="lg:col-span-3">
                
                {/* 헤더: 색상 적용 확인 */}
                <div className="flex items-end gap-3 mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className={`text-3xl font-black uppercase ${getCategoryColor(decodedCategory)}`}>
                        {decodedCategory} 
                    </h1>
                    {/* 부가 정보가 없다면 빈 span 제거하거나 내용 추가 가능 */}
                    <span className="text-gray-400 text-sm font-medium pb-1">
                         News
                    </span>
                </div>

                {newsList.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-lg text-gray-400">
                        아직 등록된 기사가 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* 모든 기사를 동일한 리스트 스타일로 출력 */}
                        {newsList.map((item) => (
                            <Link 
                                key={item.id} 
                                href={`/news/${item.category || category}/${item.id}`}
                                className="group block py-8 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl"
                            >
                                <article className="flex flex-col md:flex-row gap-6 items-start">
                                    {/* [왼쪽] 썸네일 (고정 너비 240px) */}
                                    <div className="w-full md:w-[240px] aspect-[16/10] shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-100 shadow-sm">
                                        {item.imageUrl ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 text-xs font-medium">No Image</div>
                                        )}
                                    </div>

                                    {/* [오른쪽] 텍스트 정보 */}
                                    <div className="flex-1 flex flex-col h-full min-w-0 py-1">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors break-keep">
                                                {item.title}
                                            </h2>
                                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 break-keep">
                                                {item.summary}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center text-xs text-gray-400 font-medium mt-auto gap-2">
                                            {/* 카테고리 뱃지: 색상 적용 */}
                                            <span className={`${getCategoryColor(item.category || decodedCategory)} font-bold uppercase`}>
                                                {item.category || decodedCategory}
                                            </span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            {/* 날짜 */}
                                            <span>{formatTime(item.createdAt)}</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
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