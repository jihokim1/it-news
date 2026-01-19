import { prisma } from "@/lib/prisma";
import Link from "next/link";
// 👇 방금 만든 랭킹 위젯을 여기서 불러옵니다.
import { MainRankingWidget } from "@/components/ranking/MainRankingWidget";

export async function NewsSidebar() {
  // 1. 인기 뉴스 데이터 가져오기 (조회수 순)
  const popularNews = await prisma.news.findMany({
    take: 5,
    orderBy: { views: "desc" },
  });

  return (
    <div className="sticky top-24 space-y-8">
      
      {/* 1. 🔥 많이 본 뉴스 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-black text-lg text-slate-900 mb-5 pb-3 border-b border-gray-100">
          많이 본 뉴스
        </h3>
        <div className="flex flex-col gap-4">
          {popularNews.length > 0 ? (
            popularNews.map((news, index) => (
              <Link 
                key={news.id} 
                href={`/news/${news.category || 'ai'}/${news.id}`}
                className="flex items-center justify-between gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors"
              >
                {/* 순위 & 제목 */}
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xl font-black text-slate-900 italic leading-none pt-0.5 w-4">{index + 1}</span>
                  <h4 className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 group-hover:underline transition-colors">
                    {news.title}
                  </h4>
                </div>

                {/* 작은 썸네일 */}
                <div className="w-16 h-12 shrink-0 rounded-md overflow-hidden bg-gray-100 border border-gray-100 relative">
                  {news.imageUrl ? (
                    <img 
                      src={news.imageUrl} 
                      alt="thumb" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300">No img</div>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-xs text-gray-400 py-4">데이터가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 2. ㄴ실시간 랭킹 (여기가 핵심입니다) */}
      {/* 아까 만든 MainRankingWidget을 여기서 보여줍니다 */}
      <MainRankingWidget />

      {/* 3. 📢 배너 광고 */}
      <div className="bg-slate-900 rounded-2xl p-6 text-center text-white">
        <p className="text-xs font-bold text-gray-400 mb-2">ADVERTISEMENT</p>
        <h4 className="font-bold text-lg mb-4">개발자를 위한<br/>클라우드 서비스</h4>
        <button className="bg-blue-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
          무료 체험하기
        </button>
      </div>

    </div>
  );
}