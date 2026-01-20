import { prisma } from "@/lib/prisma";
import { RefreshCw, Eye, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

// 관리자 페이지: 항상 최신 데이터 로드
export const dynamic = "force-dynamic";

export default async function AdminArticleRankingPage() {
// 1. 뉴스 데이터 가져오기 (조회수 높은 순, 최대 100개)
const rankedArticles = await prisma.news.findMany({
orderBy: { views: "desc" }, // 조회수 내림차순 정렬
take: 100, // 상위 100개만 조회
select: {
    id: true,
    title: true,
    category: true,
    views: true,
    createdAt: true,
    reporterName: true,
}
});

// 날짜 포맷 함수
const formatDate = (date: Date) => {
return new Date(date).toLocaleDateString("ko-KR", {
    month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
});
};

return (
<div className="p-8 max-w-[1600px] mx-auto text-slate-900 font-sans">
    
    {/* 상단 헤더 */}
    <div className="flex items-center justify-between mb-8">
    <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
    기사 조회수 랭킹
        </h1>
        <p className="text-slate-500 text-sm mt-1">
        가장 많이 본 뉴스 TOP 100을 실시간으로 확인합니다.
        </p>
    </div>
    <div className="flex gap-2">
        <Link href="/admin/ranking" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw size={16} /> 새로고침
        </Link>
    </div>
    </div>

    {/* 데이터 테이블 */}
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-200 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
            <h3 className="font-bold text-slate-800">실시간 인기 기사 목록</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">기준: Views (내림차순)</span>
    </div>

    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 w-16 text-center">순위</th>
                    <th className="px-6 py-4 w-24 text-center">카테고리</th>
                    <th className="px-6 py-4">제목</th>
                    <th className="px-6 py-4 w-32 text-center">조회수</th>
                    <th className="px-6 py-4 w-32 text-center">기자</th>
                    <th className="px-6 py-4 w-40 text-center">작성일</th>
                    <th className="px-6 py-4 w-20 text-center">링크</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {rankedArticles.length === 0 ? (
                    <tr><td colSpan={7} className="p-12 text-center text-gray-400">데이터가 없습니다.</td></tr>
                ) : (
                    rankedArticles.map((item, index) => {
                        const rank = index + 1;
                        // 1~3위 강조 스타일
                        let rankStyle = "bg-gray-100 text-gray-500";
                        if (rank === 1) rankStyle = "bg-red-100 text-red-600";
                        if (rank === 2) rankStyle = "bg-orange-100 text-orange-600";
                        if (rank === 3) rankStyle = "bg-yellow-100 text-yellow-600";

                        return (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                {/* 순위 */}
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${rankStyle}`}>
                                        {rank}
                                    </span>
                                </td>
                                
                                {/* 카테고리 */}
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-white border border-gray-200 text-slate-600 uppercase">
                                        {item.category || "기타"}
                                    </span>
                                </td>

                                {/* 제목 */}
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 truncate max-w-md">
                                        {item.title}
                                    </div>
                                </td>

                                {/* 조회수 */}
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 font-bold text-blue-600 bg-blue-50 py-1 px-3 rounded-full w-fit mx-auto">
                                        <Eye size={14} />
                                        {item.views?.toLocaleString() || 0}
                                    </div>
                                </td>

                                {/* 기자 */}
                                <td className="px-6 py-4 text-center text-slate-500">
                                    {item.reporterName || "-"}
                                </td>

                                {/* 작성일 */}
                                <td className="px-6 py-4 text-center text-slate-400 text-xs font-mono">
                                    {formatDate(item.createdAt)}
                                </td>

                                {/* 링크 */}
                                <td className="px-6 py-4 text-center">
                                    <Link 
                                        href={`/news/${item.category || 'AI'}/${item.id}`} 
                                        target="_blank"
                                        className="text-gray-400 hover:text-blue-600 transition-colors inline-block"
                                    >
                                        <ExternalLink size={18} />
                                    </Link>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </table>
    </div>
    </div>
</div>
);
}