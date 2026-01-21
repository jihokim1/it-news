"use client";

import { useState } from "react";
import Link from "next/link";

type RankingItem = {
  id: number;
  rank: number;
  title: string;
  publisher: string;
  iconUrl: string | null;
};

interface Props {
  googleData: RankingItem[];
  appleData: RankingItem[];
}

export default function RankingWidgetClient({ googleData, appleData }: Props) {
  // ⚙️ [로직 유지] 박사님이 만드신 로직 그대로입니다. 건드리지 않았습니다.
  const [tab, setTab] = useState<"google" | "apple">("google");
  const currentData = tab === "google" ? googleData : appleData;

  return (
    <div className="space-y-6">
      
      {/* 1. 랭킹 위젯 (디자인 개선됨) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        
        {/* 👇 [핵심 수정] 
             기존: flex-row (가로 배치) -> 공간 좁아서 글자 깨짐
             변경: flex-col (세로 배치) -> 제목과 버튼을 위아래로 분리해서 공간 확보 
        */}
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            🚀 실시간 App 랭킹
          </h3>
          
          {/* 버튼 그룹 (이제 줄바꿈 걱정 없이 넓게 씁니다) */}
          <div className="flex bg-slate-100 rounded-lg p-1 self-start">
            <button 
              onClick={() => setTab("google")} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                tab === "google" 
                  ? "bg-white text-green-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Google
            </button>
            <button 
              onClick={() => setTab("apple")} 
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                tab === "apple" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Apple
            </button>
          </div>
        </div>

        {/* 랭킹 리스트 */}
        <div className="space-y-5">
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                {/* 순위 (1~3위는 진하게, 나머지는 연하게) */}
                <span className={`text-xl font-black italic w-5 text-center ${item.rank <= 3 ? 'text-slate-900' : 'text-slate-300'}`}>
                  {item.rank}
                </span>
                
                {/* 앱 아이콘 */}
                <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                   {item.iconUrl ? (
                     <img src={item.iconUrl} alt={item.title} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs text-slate-300 font-bold">APP</span>
                   )}
                </div>

                {/* 텍스트 정보 */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {item.publisher}
                  </p>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-10 text-xs text-gray-400 bg-slate-50 rounded-lg">
               랭킹 데이터를 불러오는 중...
             </div>
          )}
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link href="/ranking" className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 transition-colors">
            전체 순위 보러가기 <span className="text-[10px]">➜</span>
          </Link>
        </div>
      </div>

      {/* 2. 광고 배너 (박사님이 좋아하셨던 디자인 유지) */}
      <Link href="/ads" className="block group">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
            <p className="text-slate-300 text-xs font-medium mb-1 group-hover:text-white transition-colors">
                개발자님, 앱 홍보가 필요하신가요? 
            </p>
            <h3 className="text-white font-bold text-lg mb-4">
                트렌드IT 공식 광고 문의
            </h3>
            <span className="inline-block bg-white text-slate-900 text-xs font-bold px-5 py-2 rounded-full group-hover:bg-blue-50 transition-colors shadow-sm">
                문의하기
            </span>
        </div>
      </Link>
    </div>
  );
}