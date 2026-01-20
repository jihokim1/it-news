import { prisma } from "@/lib/prisma"; 
import Link from "next/link";
import { Search } from "lucide-react"; // [수정] Menu 아이콘 삭제
import NewsTicker from "./NewsTicker";
import Image from "next/image";

export async function Header() {
  // [복구] 카테고리 명칭을 영문(ID 기준)으로 되돌렸습니다.
  // 필요하신 한글 명칭이 있다면 이곳의 label 값을 수정해 주십시오.
  const categories = [
    { id: "all", label: "전체", href: "/news" },
    { id: "ai", label: "AI", href: "/news/ai" },
    { id: "tech", label: "테크", href: "/news/tech" },
    { id: "business", label: "IT", href: "/news/business" },
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
    <header className="font-sans w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all">
      
      <div className="container mx-auto px-4 h-16 md:h-20 max-w-screen-xl flex items-center justify-between">
          
          {/* [좌측] 햄버거 버튼 삭제 및 로고 유지 */}
          <div className="flex items-center gap-4">
            {/* 삭제됨: <button className="md:hidden..."><Menu /></button> */}
            
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

          {/* [중앙] 대메뉴 */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-sm font-bold tracking-widest text-slate-900 hover:text-blue-600 transition-colors uppercase border-b-2 border-transparent hover:border-blue-600 pb-1">
              IT NEWS
            </Link>
            <Link href="/ranking" className="text-sm font-bold tracking-widest text-slate-400 hover:text-slate-900 transition-colors uppercase border-b-2 border-transparent hover:border-slate-900 pb-1">
              APP RANKING
            </Link>
          </nav>

          {/* [우측] 검색창 */}
          <div className="flex items-center">
            <form action="/search" className="relative group">
                <input 
                    type="text" 
                    name="q"
                    placeholder="Search..."
                    className="bg-gray-100 text-slate-900 text-sm px-4 py-2 pl-10 rounded-xl w-32 md:w-56 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:w-48 md:focus:w-64 transition-all placeholder-gray-400 font-medium"
                    autoComplete="off"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Search size={16} />
                </button>
            </form>
          </div>
      </div>

      {/* 2. 카테고리 (PC) */}
      <div className="border-t border-gray-100 bg-white/50 hidden md:block">
        <div className="container mx-auto px-4 max-w-screen-xl">
            <nav className="flex items-center justify-center gap-10 h-12 text-sm font-bold text-slate-500">
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={cat.href}
                  className={`relative hover:text-black transition-colors py-3 ${cat.id === 'all' ? 'text-black' : ''}`}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
        </div>
      </div>

      {/* 3. 카테고리 (모바일) */}
      <div className="md:hidden border-t border-gray-100 overflow-x-auto no-scrollbar bg-white">
         <div className="flex px-4 h-12 items-center gap-6 text-sm font-bold text-slate-500 whitespace-nowrap">
            {categories.map((cat) => (
                <Link key={cat.id} href={cat.href} className={cat.id === 'all' ? 'text-black' : ''}>
                    {cat.label}
                </Link>
            ))}
         </div>
      </div>

      {/* 4. 뉴스 티커 */}
      <div className="bg-black text-white text-[11px] md:text-xs font-bold py-2 border-t border-black">
         <div className="container mx-auto px-4 max-w-screen-xl flex items-center gap-4">
             <span className="text-blue-400 shrink-0 tracking-widest uppercase animate-pulse">Breaking</span>
             <div className="flex-1 overflow-hidden">
                <NewsTicker headlines={headlines} />
             </div>
         </div>
      </div>

    </header>
  );
}