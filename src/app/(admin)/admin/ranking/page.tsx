import { prisma } from "@/lib/prisma";
import { ArrowLeft, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";

// 관리자 페이지니까 항상 최신 데이터 로드
export const dynamic = "force-dynamic";

export default async function AdminRankingPage() {
  // 1. 구글 랭킹 가져오기
  const googleRankings = await prisma.appRanking.findMany({
    where: { platform: "google" },
    orderBy: { rank: "asc" },
  });

  // 2. 애플 랭킹 가져오기
  const appleRankings = await prisma.appRanking.findMany({
    where: { platform: "apple" },
    orderBy: { rank: "asc" },
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto text-slate-900">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            📊 앱 랭킹 관리
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            현재 DB에 저장된 실시간 랭킹 데이터를 확인합니다.
          </p>
        </div>
        <div className="flex gap-2">
           {/* 새로고침 버튼 (단순 페이지 리로드) */}
           <Link href="/admin/ranking" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
             <RefreshCw size={16} /> 새로고침
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* [왼쪽] 구글 플레이 데이터 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-green-50/50 flex justify-between items-center">
                <h3 className="font-bold text-green-700 flex items-center gap-2">
                    🤖 Google Play ({googleRankings.length}개)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center">순위</th>
                            <th className="px-4 py-3">앱 이름</th>
                            <th className="px-4 py-3">퍼블리셔</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {googleRankings.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-gray-400">데이터가 없습니다.</td></tr>
                        ) : (
                            googleRankings.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center font-bold text-slate-700">{app.rank}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{app.title}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{app.publisher}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* [오른쪽] 애플 앱스토어 데이터 테이블 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-blue-50/50 flex justify-between items-center">
                <h3 className="font-bold text-blue-700 flex items-center gap-2">
                    🍎 App Store ({appleRankings.length}개)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center">순위</th>
                            <th className="px-4 py-3">앱 이름</th>
                            <th className="px-4 py-3">퍼블리셔</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                         {appleRankings.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-gray-400">데이터가 없습니다.</td></tr>
                        ) : (
                            appleRankings.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center font-bold text-slate-700">{app.rank}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900">{app.title}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{app.publisher}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}