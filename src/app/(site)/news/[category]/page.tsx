import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";

interface Props {
  params: Promise<{ category: string }>;
}

// 카테고리별 포인트 색상
const getCategoryColor = (category: string) => {
  const cat = category?.toLowerCase() || "";
  if (["ai", "인공지능"].includes(cat)) return "text-blue-600";
  if (["tech", "테크", "기기"].includes(cat)) return "text-indigo-600";
  if (["stock", "주식"].includes(cat)) return "text-red-600";
  if (["coin", "코인"].includes(cat)) return "text-orange-600";
  if (["game", "게임"].includes(cat)) return "text-purple-600";
  if (["business", "기업"].includes(cat)) return "text-emerald-600";
  return "text-slate-600";
};

// 날짜 포맷 (YYYY-MM-DD)
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

  // 👇 [핵심] 최신 2개(featured)와 나머지(normal) 분리
  const featuredNews = newsList.slice(0, 2);
  const normalNews = newsList.slice(2);

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 기사 리스트 영역 (3/4) */}
            <div className="lg:col-span-3">
                
                {/* 헤더 */}
                <div className="flex items-end gap-3 mb-10 border-b-2 border-slate-900 pb-4">
                    <h1 className={`text-3xl font-black uppercase ${getCategoryColor(decodedCategory)}`}>
                        {decodedCategory} News
                    </h1>
                    <span className="text-gray-400 text-sm font-medium pb-1">
                        총 <strong className="text-slate-900">{newsList.length}</strong>개의 기사
                    </span>
                </div>

                {newsList.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-lg text-gray-400">
                        아직 등록된 기사가 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col">
                        
                        {/* 1. 🔥 상단 최신 2개 (초대형 히어로 스타일) */}
                        <div className="mb-12 flex flex-col gap-12">
                            {featuredNews.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={`/news/${item.category || category}/${item.id}`}
                                    className="group block"
                                >
                                    <article className="flex flex-col lg:flex-row gap-8 items-start pb-12 border-b border-slate-900">
                                        {/* [왼쪽] 대형 썸네일 (50% 너비) */}
                                        <div className="w-full lg:w-1/2 aspect-video shrink-0 rounded-xl overflow-hidden bg-gray-100 relative shadow-sm">
                                            {item.imageUrl ? (
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">No Image</div>
                                            )}
                                        </div>

                                        {/* [오른쪽] 대형 텍스트 */}
                                        <div className="flex-1 flex flex-col h-full min-w-0 py-2">
                                            <div className="mb-4">
                                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-700 transition-colors break-keep">
                                                    {item.title}
                                                </h2>
                                                <p className="text-lg text-slate-600 leading-relaxed line-clamp-3 break-keep">
                                                    {item.summary}
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center text-sm font-bold text-gray-400 mt-auto">
                                                <span className={`${getCategoryColor(item.category || "")} uppercase`}>
                                                    {item.category || decodedCategory}
                                                </span>
                                                <span className="mx-3 text-gray-300">|</span>
                                                <span className="text-slate-500">{formatTime(item.createdAt)}</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {/* 2. 하단 나머지 리스트 (기존 일반 스타일) */}
                        {normalNews.length > 0 && (
                            <div className="flex flex-col">
                                {normalNews.map((item) => (
                                    <Link 
                                        key={item.id} 
                                        href={`/news/${item.category || category}/${item.id}`}
                                        className="group block py-8 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl"
                                    >
                                        <article className="flex flex-col md:flex-row gap-6 items-start">
                                            {/* [왼쪽] 일반 썸네일 (240px) */}
                                            <div className="w-full md:w-[240px] aspect-[16/10] shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                                                {item.imageUrl ? (
                                                    <img 
                                                        src={item.imageUrl} 
                                                        alt={item.title} 
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 text-xs">No Image</div>
                                                )}
                                            </div>

                                            {/* [오른쪽] 일반 텍스트 */}
                                            <div className="flex-1 flex flex-col h-full min-w-0 py-1">
                                                <div>
                                                    <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors break-keep">
                                                        {item.title}
                                                    </h2>
                                                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 break-keep">
                                                        {item.summary}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center text-xs text-gray-400 font-medium mt-auto">
                                                    <span className={`${getCategoryColor(item.category || "")} font-bold uppercase`}>
                                                        {item.category || decodedCategory}
                                                    </span>
                                                    <span className="mx-2 text-gray-300">|</span>
                                                    <span>{formatTime(item.createdAt)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* [오른쪽] 사이드바 */}
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