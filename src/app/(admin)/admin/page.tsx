import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, Eye, FileText, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  // 1. 데이터 통계 가져오기
  const totalNewsCount = await prisma.news.count();

  const totalViewsSum = await prisma.news.aggregate({
    _sum: { views: true },
  });

  // 👇 [수정됨] 0으로 고정했던 것을 '실제 DB 조회 로직'으로 복구
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 오늘 0시 0분 0초부터

  const todayViewsCount = await prisma.newsView.count({
    where: {
      createdAt: {
        gte: today, // 오늘 생성된 뷰만 카운트
      },
    },
  });

  // (4) 최근 등록된 댓글
  const recentComments = await prisma.comment.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      news: {
        select: { title: true, id: true, category: true },
      },
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
    }).replace(/\. /g, "-").replace(".", "");
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">대시보드</h1>
        <p className="text-slate-500 text-sm mt-1">오늘의 사이트 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total News */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total News</p>
            <h3 className="text-3xl font-black text-slate-900">{totalNewsCount.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Views</p>
            <h3 className="text-3xl font-black text-slate-900">
                {(totalViewsSum._sum.views || 0).toLocaleString()}
            </h3>
          </div>
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <Eye size={24} />
          </div>
        </div>

        {/* Today View (이제 실제 숫자가 나옵니다) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Today View</p>
            <h3 className="text-3xl font-black text-slate-900">{todayViewsCount.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">Today</span>
          </div>
        </div>
      </div>

      {/* 최근 댓글 리스트 (유지) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" />
            최근 등록된 댓글
          </h2>
          <span className="text-xs text-gray-400 font-medium">최신 10개</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-24">작성자</th>
                <th className="px-6 py-4">댓글 내용</th>
                <th className="px-6 py-4 w-1/3">관련 기사</th>
                <th className="px-6 py-4 w-32 text-right">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentComments.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">댓글이 없습니다.</td></tr>
              ) : (
                recentComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700 truncate">{comment.nickname}</td>
                    <td className="px-6 py-4 text-slate-600"><p className="line-clamp-1 max-w-md">{comment.content}</p></td>
                    <td className="px-6 py-4">
                        {comment.news ? (
                             <Link href={`/news/${comment.news.category || 'general'}/${comment.news.id}`} className="text-blue-600 hover:underline flex items-center gap-1 group">
                                <span className="truncate max-w-[200px] font-medium">{comment.news.title}</span>
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                             </Link>
                        ) : <span className="text-gray-300">삭제됨</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-right font-mono text-xs">{formatDate(comment.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}