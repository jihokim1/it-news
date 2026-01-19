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
  const [tab, setTab] = useState<"google" | "apple">("google");
  const currentData = tab === "google" ? googleData : appleData;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h3 className="font-black text-lg text-slate-900">🚀 실시간 랭킹</h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setTab("google")} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tab === "google" ? "bg-white text-green-600 shadow-sm" : "text-gray-400"}`}>Google</button>
          <button onClick={() => setTab("apple")} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${tab === "apple" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>Apple</button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {currentData.length > 0 ? (
          currentData.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-900 italic w-4 text-center">{item.rank}</span>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                 {item.iconUrl ? <img src={item.iconUrl} alt={item.title} className="w-full h-full object-cover" /> : <span className="text-xs">📱</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{item.publisher}</p>
              </div>
            </div>
          ))
        ) : (
            <div className="text-center py-6 text-xs text-gray-400">데이터 없음</div>
        )}
      </div>
      <div className="mt-5 pt-3 border-t border-gray-50 text-center">
        <Link href="/ranking" className="text-xs font-bold text-slate-400 hover:text-blue-600">전체 순위 보러가기 →</Link>
      </div>
    </div>
  );
}