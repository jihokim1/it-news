import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";

// 날짜 포맷 (로직 유지)
const formatTime = (date: Date) => new Date(date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

// 카테고리별 텍스트 색상 (디자인 통일을 위해 텍스트 색상 로직 적용)
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

export default async function AllNewsPage() {
  // 최신순 정렬 (로직 유지)
  const newsList = await prisma.news.findMany({ 
    orderBy: { createdAt: "desc" } 
  });

  return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="container mx-auto px-4 py-12 max-w-screen-xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* [왼쪽] 뉴스 리스트 (3/4) */}
            <div className="lg:col-span-3">
               
               {/* 헤더 (디자인 통일) */}
               <div className="flex items-end gap-3 mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className="text-3xl font-black uppercase text-slate-900">
                        All
                    </h1>
                    <span className="text-gray-400 text-sm font-medium pb-1">
                    </span>
               </div>

               {newsList.length > 0 ? (
                 <div className="flex flex-col">
                    {newsList.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/news/${item.category || 'AI'}/${item.id}`} 
                            className="group block py-8 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl"
                        >
                            <article className="flex flex-col md:flex-row gap-6 items-start">
                                {/* [왼쪽] 썸네일 (240px 고정) */}
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
                                        {/* 카테고리 */}
                                        <span className={`${getCategoryColor(item.category || "")} font-bold uppercase`}>
                                            {item.category || "NEWS"}
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