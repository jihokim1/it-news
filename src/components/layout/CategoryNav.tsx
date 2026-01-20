"use client"; // 👈 주소창을 확인하기 위해 필수입니다.

import Link from "next/link";
import { usePathname } from "next/navigation";

// 카테고리 목록
const categories = [
{ id: "all", label: "전체", href: "/news" },
{ id: "ai", label: "AI", href: "/news/ai" },
{ id: "business", label: "IT", href: "/news/business" },
{ id: "stock", label: "주식", href: "/news/stock" },
{ id: "coin", label: "코인", href: "/news/coin" },
{ id: "tech", label: "테크", href: "/news/tech" },
];

export default function CategoryNav() {
const pathname = usePathname(); // 현재 주소를 가져옵니다.

return (
<>
    {/* PC 버전 */}
    <div className="hidden md:block border-t border-gray-100 bg-white">
    <div className="container mx-auto px-4 max-w-screen-xl">
        <nav className="flex items-center justify-center gap-10 h-14">
        {categories.map((cat) => {
            // 현재 주소와 링크가 일치하는지 확인
            // 예: /news/ai 와 /news/ai 가 같으면 true
            const isActive = 
            cat.id === "all" 
                ? pathname === "/news" 
                : pathname?.startsWith(cat.href);

            return (
            <Link
                key={cat.id}
                href={cat.href}
                className={`text-sm transition-colors py-2 relative ${
                isActive
                    ? "font-black text-slate-900" // 👉 활성화됐을 때: 아주 진하고 굵게
                    : "font-bold text-slate-400 hover:text-slate-600" // 비활성화: 연한 회색
                }`}
            >
                {cat.label}
                {/* 활성화 시 밑에 작은 점 하나 찍어주기 (디테일) */}
                {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full block" />
                )}
            </Link>
            );
        })}
        </nav>
    </div>
    </div>

    {/* 모바일 버전 */}
    <div className="md:hidden border-t border-gray-100 overflow-x-auto no-scrollbar bg-white">
    <div className="flex px-4 h-12 items-center gap-6 whitespace-nowrap">
        {categories.map((cat) => {
            const isActive = 
            cat.id === "all" 
                ? pathname === "/news" 
                : pathname?.startsWith(cat.href);

        return (
            <Link
            key={cat.id}
            href={cat.href}
            className={`text-sm transition-colors ${
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
    </div>
</>
);
}