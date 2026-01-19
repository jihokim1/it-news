"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderNav() {
const pathname = usePathname();
const isRanking = pathname.includes("/ranking");

return (
<nav className="flex-1 flex justify-start md:justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-bold tracking-wide ml-2 md:ml-0">
    {/* 1. IT NEWS 버튼 (랭킹 아닐 때 하얗게) */}
    <Link 
    href="/" 
    className={`hidden md:block transition-colors ${
        !isRanking 
        ? "text-white"
        : "text-slate-400 hover:text-white"
    }`}
    >
    IT NEWS
    </Link>

    {/* 2. APP RANKING 버튼 (랭킹일 때 하얗게) */}
    <Link 
    href="/ranking" 
    className={`whitespace-nowrap transition-colors ${
        isRanking 
        ? "text-white"
        : "text-slate-400 hover:text-white"
    }`}
    >
    APP RANKING
    </Link>
</nav>
);
}