import { prisma } from "@/lib/prisma"; 
import Link from "next/link";
import { Search } from "lucide-react";
import NewsTicker from "./NewsTicker";
import HeaderNav from "./HeaderNav"; // 👈 방금 만든 파일 불러오기

export async function Header() {
  const categories = [
    { id: "all", label: "전체", href: "/" },
    { id: "ai", label: "AI", href: "/news/ai" },
    { id: "tech", label: "테크", href: "/news/tech" },
    { id: "business", label: "IT기업", href: "/news/business" },
    { id: "game", label: "게임", href: "/news/game" },
    { id: "stock", label: "주식", href: "/news/stock" },
    { id: "coin", label: "코인", href: "/news/coin" },
  ];

  const headlines = await prisma.news.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true },
  });

  return (
    <header className="font-sans w-full sticky top-0 z-50 shadow-lg">
      
      {/* 1. 최상단 바 */}
      <div className="bg-slate-900 text-white h-14 md:h-16 border-b border-slate-800">
        <div className="container mx-auto px-4 h-full flex items-center justify-between max-w-screen-xl">
          
          <div className="flex shrink-0 items-center mr-2">
            <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-white">
              TO.NEWS
            </Link>
          </div>

          {/* ⭐ 여기가 핵심: 아까 만든 컴포넌트 끼워넣기 */}
          <HeaderNav />

          <div className="flex shrink-0 justify-end items-center ml-2">
            <form action="/search" className="relative flex items-center">
                <input 
                    type="text" 
                    name="q"
                    placeholder="검색"
                    className="bg-slate-800 text-white text-xs px-3 py-1.5 md:px-4 md:py-2 rounded-full w-24 md:w-48 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500 transition-all focus:w-32 md:focus:w-64 border border-slate-700"
                    autoComplete="off"
                />
                <button type="submit" className="absolute right-2 md:right-3 text-slate-400 hover:text-white">
                    <Search size={14} className="md:w-4 md:h-4" />
                </button>
            </form>
          </div>

        </div>
      </div>

      {/* 2. 카테고리 네비게이션 */}
      <div className="bg-slate-900 border-b border-slate-800 h-12 md:h-14 shadow-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-center max-w-screen-xl overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-6 md:gap-8 text-[13px] md:text-[15px] font-bold text-slate-400 whitespace-nowrap">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={cat.href}
                  className={`hover:text-white transition-colors ${cat.id === 'all' ? 'text-white' : ''}`}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
        </div>
      </div>

      {/* 3. 뉴스 티커 */}
      <NewsTicker headlines={headlines} />

    </header>
  );
}