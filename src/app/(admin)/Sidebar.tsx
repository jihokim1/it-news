"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
const pathname = usePathname();

const menus = [
{ name: "대시보드", href: "/admin" },
{ name: "뉴스 관리", href: "/admin/news"},
{ name: "랭킹 관리", href: "/admin/ranking"},
];

return (
<aside className="w-64 bg-slate-900 text-white min-h-screen flex-shrink-0">
    <div className="p-6">
    <h1 className="text-2xl font-black tracking-tighter mb-10">TO.ADMIN</h1>
    <nav className="space-y-2">
        {menus.map((menu) => {
        // 👇 현재 주소가 메뉴 주소와 일치하거나 포함되면 파란색 켜기
        const isActive = menu.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(menu.href);

        return (
            <Link
            key={menu.href}
            href={menu.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" // 활성 (파란색)
                : "text-slate-400 hover:text-white hover:bg-slate-800"   // 비활성 (회색)
            }`}
            >
            {menu.name}
            </Link>
        );
        })}
    </nav>
    </div>
</aside>
);
}