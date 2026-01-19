import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";

const formatTime = (date: Date) => new Date(date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

const getCategoryColor = (category: string) => {
switch (category) {
  case "AI": return "bg-blue-100";
  case "Stock": return "bg-red-100";
  case "Coin": return "bg-orange-100";
  case "Game": return "bg-purple-100";
  default: return "bg-slate-200";
}
};

export default async function AllNewsPage() {
// 최신순 정렬
const newsList = await prisma.news.findMany({ 
  orderBy: { createdAt: "desc" } 
});

return (
  <div className="bg-gray-50 min-h-screen pb-20">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* [왼쪽] 뉴스 리스트 */}
          <div className="lg:col-span-3">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8 text-center">
                <span className="text-slate-500 font-bold tracking-widest text-sm uppercase mb-2 block">TOTAL NEWS</span>
                <h1 className="text-4xl font-black text-slate-900">전체 최신 뉴스</h1>
                <p className="text-slate-500 mt-4 max-w-lg mx-auto">분야를 가리지 않는 모든 IT 소식을 최신순으로 확인하세요.</p>
              </div>

              <div className="space-y-6">
                {newsList.length > 0 ? newsList.map((item) => (
                  // 👇 [핵심 수정] Link가 박스 전체를 감싸고, 카테고리가 없으면 'AI'로 처리해서 링크 깨짐 방지
                  <Link key={item.id} href={`/news/${item.category || 'AI'}/${item.id}`} className="block group">
                    <article className="flex flex-col md:flex-row gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer mb-6">
                        {/* 썸네일 */}
                        <div className={`w-full md:w-64 h-40 rounded-xl shrink-0 overflow-hidden ${getCategoryColor(item.category || 'AI')}`}>
                          {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        
                        {/* 내용 */}
                        <div className="flex flex-col justify-center flex-1">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="text-slate-600 text-xs font-bold uppercase border border-slate-200 bg-slate-50 px-2 py-0.5 rounded">{item.category || "NEWS"}</span>
                              <span className="text-slate-400 text-xs">• {formatTime(item.createdAt)}</span>
                          </div>
                          <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600">{item.title}</h2>
                          <p className="text-slate-500 text-sm line-clamp-2">{item.summary}</p>
                        </div>
                    </article>
                  </Link>
                )) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">아직 등록된 뉴스가 없습니다.</div>
                )}
              </div>
          </div>

          {/* [오른쪽] 사이드바 (통합됨) */}
          <aside className="lg:col-span-1">
              <NewsSidebar />
          </aside>
      </div>
    </div>
  </div>
);
}