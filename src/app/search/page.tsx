import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import { SearchX } from "lucide-react";

interface Props {
searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
const { q } = await searchParams;

// 검색어가 없으면 빈 배열
const keyword = q || "";

const newsList = keyword ? await prisma.news.findMany({
where: {
    OR: [
    { title: { contains: keyword, mode: 'insensitive' } }, // 제목 검색
    { summary: { contains: keyword, mode: 'insensitive' } }, // 요약 검색
    ]
},
orderBy: { createdAt: "desc" },
}) : [];

// 날짜 포맷
const formatTime = (date: Date) => {
return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit"
}).replace(/\. /g, "-").replace(".", "");
};

return (
<div className="bg-white min-h-screen pb-20 font-sans text-slate-900">
    <div className="container mx-auto px-4 py-12 max-w-screen-xl">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* 검색 결과 영역 */}
        <div className="lg:col-span-3">
            <div className="border-b-2 border-slate-900 pb-4 mb-8">
                <h1 className="text-2xl font-bold">
                    '<span className="text-blue-600">{keyword}</span>' 검색 결과
                </h1>
                <p className="text-gray-500 text-sm mt-1">총 {newsList.length}개의 기사가 검색되었습니다.</p>
            </div>

            {newsList.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                    <SearchX size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">검색 결과가 없습니다.</p>
                    <p className="text-sm">다른 키워드로 검색해 보세요.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {newsList.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/news/${item.category || 'general'}/${item.id}`}
                            className="group block py-8 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl"
                        >
                            <article className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-full md:w-[240px] aspect-[16/10] shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 text-xs">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col h-full min-w-0 py-1">
                                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                        {item.summary}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-400 font-medium mt-auto">
                                        <span className="uppercase font-bold text-slate-600">{item.category}</span>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span>{formatTime(item.createdAt)}</span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>

        {/* 사이드바 */}
        <aside className="lg:col-span-1">
                <div className="sticky top-12">
                <NewsSidebar />
                </div>
        </aside>

    </div>
    </div>
</div>
);
}