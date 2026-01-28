"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
const [isOpen, setIsOpen] = useState(false);
const pathname = usePathname();

const menuItems = [
{ name: "대시보드", href: "/admin" },
{ name: "뉴스 관리", href: "/admin/news" },
{ name: "랭킹 관리", href: "/admin/ranking" },
];

return (
<>
    {/* 📱 [모바일 전용] 상단 헤더 (로고 + 햄버거 버튼) */}
    <div className="md:hidden bg-[#0f172a] text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
    <span className="text-xl font-black tracking-tighter">TO.ADMIN</span>
    <button onClick={() => setIsOpen(!isOpen)} className="p-1">
        {isOpen ? (
        // 닫기 아이콘 (X)
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
        // 메뉴 아이콘 (햄버거)
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
    </button>
    </div>

    {/* 🖥️ 사이드바 본체 (모바일: 슬라이드 메뉴 / 데스크톱: 고정 메뉴) */}
    <aside className={`
    fixed inset-y-0 left-0 z-40 w-64 bg-[#0f172a] text-white transition-transform duration-300 ease-in-out flex flex-col
    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
    md:relative md:translate-x-0 md:block
    `}>
    <div className="p-6 flex-1">
        {/* 데스크톱 로고 */}
        <h1 className="text-2xl font-black tracking-tighter mb-10 hidden md:block">TO.ADMIN</h1>
        
        <nav className="space-y-2">
        {menuItems.map((item) => {
            // 현재 경로가 해당 메뉴의 경로를 포함하면 활성화 (예: /admin/news/write 도 뉴스 관리 활성화)
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // 모바일에서 클릭 시 메뉴 닫기
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
            >
                {item.name}
            </Link>
            );
        })}
        </nav>
    </div>

    </aside>

    {/* 📱 [모바일 전용] 배경 어둡게 처리 (Overlay) */}
    {isOpen && (
    <div 
        className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
    />
    )}
</>
);
}