"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 카테고리 목록
const categories = [
{ id: "all", label: "전체", href: "/news/all" },
{ id: "ai", label: "AI", href: "/news/ai" },
{ id: "business", label: "IT", href: "/news/business" },
{ id: "stock", label: "주식", href: "/news/stock" },
{ id: "coin", label: "코인", href: "/news/coin" },
{ id: "tech", label: "테크", href: "/news/tech" },
];

export default function CategoryNav() {
const pathname = usePathname();

return (
<>
    {/* 🖥️ PC 버전 (기존 유지) */}
    <div className="hidden md:block border-t border-gray-100 bg-white">
    <div className="container mx-auto px-4 max-w-screen-xl">
        <nav className="flex items-center justify-center gap-10 h-14">
        {categories.map((cat) => {
            const isActive =
            cat.id === "all"
                ? (pathname === "/news/all" || pathname === "/news")
                : pathname?.startsWith(cat.href);

            return (
            <Link
                key={cat.id}
                href={cat.href}
                className={`text-sm transition-colors py-2 relative ${
                isActive
                    ? "font-black text-slate-900"
                    : "font-bold text-slate-400 hover:text-slate-600"
                }`}
            >
                {cat.label}
                {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full block" />
                )}
            </Link>
            );
        })}
        </nav>
    </div>
    </div>

    {/* 📱 모바일 버전 (수정됨: 우측에 'App랭킹' 고정) */}
    <div className="md:hidden border-t border-gray-100 bg-white">
    <div className="flex items-center justify-between h-12 px-4">
        
        {/* 1. 왼쪽: 카테고리 리스트 (스크롤 가능) */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar flex-1 items-center h-full pr-2">
        {categories.map((cat) => {
            const isActive =
            cat.id === "all"
                ? (pathname === "/news/all" || pathname === "/news")
                : pathname?.startsWith(cat.href);

            return (
            <Link
                key={cat.id}
                href={cat.href}
                className={`text-sm whitespace-nowrap transition-colors ${
                isActive
                    ? "font-black text-slate-900"
                    : "font-bold text-slate-400"
                }`}
            >
                {cat.label}
            </Link>
            );
        })}
        </div>

        {/* 2. 오른쪽: App랭킹 버튼 (고정됨) */}
   {/* 2. 오른쪽: App랭킹 버튼 (현재 페이지가 '/ranking'이면 숨김) */}
    {pathname !== "/ranking" && (
                <div className="pl-3 border-l border-gray-100 h-6 flex items-center shrink-0 z-10 bg-white">
                <Link
                    href="/ranking"
                    className="text-xs font-black text-slate-800 flex items-center gap-1 whitespace-nowrap hover:text-blue-600 transition-colors"
                >
                    <span className="text-yellow-500 text-sm"></span>
                    <span className="border-b-2 border-transparent hover:border-blue-600 leading-none">
                    App랭킹 보러가기
                    </span>
                </Link>
                </div>
            )}

    </div>
    </div>
</>
);
}