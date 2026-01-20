"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
const pathname = usePathname();

// 현재 페이지가 랭킹 페이지인지 확인
const isRanking = pathname?.startsWith("/ranking");
// 랭킹 페이지가 아니면 뉴스 페이지로 간주
const isNews = !isRanking;

return (
<nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
    
    {/* 1. IT NEWS 버튼 */}
    <Link 
    href="/" 
    className={`text-sm font-black tracking-widest transition-colors uppercase border-b-2 pb-1 ${
        isNews 
        ? "text-slate-900 border-blue-600" // 활성: 진한 검정 + 파란 밑줄
        : "text-slate-400 border-transparent hover:text-slate-600" // 비활성: 회색
    }`}
    >
    IT NEWS
    </Link>

    {/* 2. APP RANKING 버튼 */}
    <Link 
    href="/ranking" 
    className={`text-sm font-black tracking-widest transition-colors uppercase border-b-2 pb-1 ${
        isRanking 
        ? "text-slate-900 border-blue-600" // 활성: 진한 검정 + 파란 밑줄
        : "text-slate-400 border-transparent hover:text-slate-600" // 비활성: 회색
    }`}
    >
    APP RANKING
    </Link>

</nav>
);
}