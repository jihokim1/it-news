import { prisma } from "@/lib/prisma"; 
import Link from "next/link";
import { Search } from "lucide-react"; 
import NewsTicker from "./NewsTicker";
import Image from "next/image";
import CategoryNav from "./CategoryNav";
// 👇 방금 만든 TopNav 가져오기
import TopNav from "./TopNav"; 

export async function Header() {
  const headlines = await prisma.news.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true },
  });

  return (
    <header className="font-sans w-full sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all shadow-sm">
      
      {/* 1. 상단: 로고, 대메뉴, 검색 */}
      <div className="container mx-auto px-4 h-16 md:h-20 max-w-screen-xl flex items-center justify-between">
          
          {/* [좌측] 로고 */}
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-1">
              <Image 
                src="/logo.png"
                alt="TO.NEWS Logo"
                width={2050}
                height={500}
                className="object-contain h-20 md:h-20 w-auto"
                priority
              />
            </Link>
          </div>

          {/* [중앙] 대메뉴 (TopNav 컴포넌트로 교체!) */}
          <TopNav />

          {/* [우측] 검색창 */}
          <div className="flex items-center">
            <form action="/search" className="relative group">
                <input 
                    type="text" 
                    name="q"
                    placeholder="Search..."
                    className="bg-gray-50 text-slate-900 text-sm px-4 py-2 pl-10 rounded-full w-32 md:w-56 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-200 focus:w-48 md:focus:w-64 transition-all placeholder-gray-400 font-medium border border-gray-200"
                    autoComplete="off"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-900 transition-colors">
                    <Search size={16} />
                </button>
            </form>
          </div>
      </div>

      {/* 2. 카테고리 네비게이션 */}
      <CategoryNav />

      {/* 3. 뉴스 티커 (프리미엄 다크 네이비 유지) */}
      <div className="bg-slate-900 border-t border-slate-900 h-10 flex items-center">
         <div className="container mx-auto px-4 max-w-screen-xl flex items-center gap-4">
             <div className="flex items-center gap-2 shrink-0">
                <span className="relative flex h-2 w-2">
                </span>
                
                <div className="w-[1px] h-3 bg-slate-700 mx-2"></div>
             </div>
             <div className="flex-1 overflow-hidden text-gray-200 font-medium text-xs">
                <NewsTicker headlines={headlines} />
             </div>
         </div>
      </div>

    </header>
  );
}