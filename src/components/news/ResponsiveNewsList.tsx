"use client";
// 모바일 카테고리 veiw 내리면 더보기로 10개씩 보이게 하기 

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getMoreNews } from "@/app/(admin)/admin/news/write/actions";

interface NewsItem {
id: number;
title: string;
summary: string | null;
imageUrl: string | null;
category: string | null;
createdAt: Date;
}

interface Props {
initialNews: NewsItem[]; // 서버에서 받은 초기 20개
category: string;
totalCount: number;
currentPage: number;
}

// 날짜 포맷 함수
const formatTime = (date: Date) => {
const d = new Date(date);
const year = d.getFullYear();
const month = String(d.getMonth() + 1).padStart(2, '0');
const day = String(d.getDate()).padStart(2, '0');
return `${year}-${month}-${day}`;
};

// 카테고리 색상 함수
const getCategoryColor = (category: string) => {
const cat = category?.toLowerCase().trim() || "";
if (["ai", "인공지능"].includes(cat)) return "text-blue-600";
if (["tech", "테크", "기기"].includes(cat)) return "text-indigo-600";
if (["it", "business", "기업"].includes(cat)) return "text-violet-600";
if (["stock", "주식"].includes(cat)) return "text-red-600";
if (["coin", "코인"].includes(cat)) return "text-orange-600";
if (["game", "게임"].includes(cat)) return "text-purple-600";
return "text-slate-600";
};

export default function ResponsiveNewsList({ initialNews, category, totalCount, currentPage }: Props) {
// 뉴스 리스트 상태 (모바일에서 '더보기' 누르면 계속 추가됨)
const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);

// 모바일 전용 상태
const [mobilePage, setMobilePage] = useState(currentPage); // 모바일은 독자적으로 페이지 카운트
const [isLoading, setIsLoading] = useState(false);
const [mobileLimit, setMobileLimit] = useState(10); // 모바일에서 처음에 보여줄 개수 (10개)

// PC 페이지네이션 계산
const pageSize = 20;
const totalPages = Math.ceil(totalCount / pageSize);
const hasNextPage = currentPage < totalPages;
const hasPrevPage = currentPage > 1;

// [모바일] '더보기' 버튼 클릭 핸들러
const handleLoadMore = async () => {
// 1. 현재 로딩된 리스트 안에서 아직 안 보여준 게 있는지 확인
// (예: 20개 가져왔는데 10개만 보여주고 있었다면, 나머지 10개 보여주기)
if (mobileLimit < newsList.length) {
    setMobileLimit((prev) => prev + 10);
    return;
}

// 2. 다 보여줬다면 서버에서 다음 페이지(20개) 가져오기
setIsLoading(true);
try {
    const nextPage = mobilePage + 1;
    const newItems = await getMoreNews(category, nextPage);

    if (newItems.length > 0) {
    // 기존 리스트 뒤에 붙이기
    setNewsList((prev) => [...prev, ...newItems]);
    setMobilePage(nextPage);
    setMobileLimit((prev) => prev + 10); // 10개 더 보여주기
    }
} catch (error) {
    console.error("Failed to load more news:", error);
} finally {
    setIsLoading(false);
}
};

return (
<div className="flex flex-col">
    
    {/* 뉴스 리스트 렌더링 */}
    {newsList.map((item, index) => {
    // [모바일 로직] 모바일(md:hidden)에서는 mobileLimit 개수까지만 보여줌
    // [PC 로직] PC(md:block)에서는 항상 다 보여줌 (또는 페이지네이션 된 20개)
    const isHiddenOnMobile = index >= mobileLimit;

    return (
        <Link 
        key={`${item.id}-${index}`} // 중복 방지용 key
        href={`/news/${item.category || category}/${item.id}`}
        className={`group block py-8 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl ${isHiddenOnMobile ? 'hidden md:block' : 'block'}`}
        >
        <article className="flex flex-col md:flex-row gap-6 items-start">
            {/* 썸네일 */}
            <div className="w-full md:w-[240px] aspect-[16/10] shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-100 shadow-sm">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 text-xs font-medium">No Image</div>
                )}
            </div>

            {/* 텍스트 */}
            <div className="flex-1 flex flex-col h-full min-w-0 py-1">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-700 transition-colors break-keep">
                        {item.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 break-keep">
                        {item.summary}
                    </p>
                </div>
                
                <div className="flex items-center text-xs text-gray-400 font-medium mt-auto gap-2">
                    <span className={`${getCategoryColor(item.category || category)} font-bold uppercase`}>
                        {item.category || category}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{formatTime(item.createdAt)}</span>
                </div>
            </div>
        </article>
        </Link>
    );
    })}

    {/* --- [모바일 전용] 더보기 버튼 (md:hidden) --- */}
    <div className="mt-8 md:hidden">
    {/* 더 보여줄 데이터가 있거나 로딩 중일 때만 버튼 표시 */}
    {(mobileLimit < totalCount) && (
        <button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-3.5 bg-white border border-gray-200 rounded-xl text-slate-600 font-bold text-sm shadow-sm active:bg-gray-50 flex items-center justify-center gap-2"
        >
            {isLoading ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    불러오는 중...
                </>
            ) : (
                "뉴스 더보기"
            )}
        </button>
    )}
    </div>

    {/* --- [PC 전용] 페이지네이션 (hidden md:flex) --- */}
    {totalCount > 0 && (
        <div className="hidden md:flex justify-center items-center gap-4 mt-12 py-8 border-t border-gray-100">
            {hasPrevPage ? (
                <Link 
                    href={`/news/${category}?page=${currentPage - 1}`}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all"
                >
                    <ChevronLeft size={16} /> Prev
                </Link>
            ) : (
                <button disabled className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-300 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    <ChevronLeft size={16} /> Prev
                </button>
            )}

            <span className="text-sm font-medium text-slate-500">
                Page <strong className="text-slate-900">{currentPage}</strong> of {totalPages}
            </span>

            {hasNextPage ? (
                <Link 
                    href={`/news/${category}?page=${currentPage + 1}`}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all"
                >
                    Next <ChevronRight size={16} />
                </Link>
            ) : (
                <button disabled className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-300 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
                    Next <ChevronRight size={16} />
                </button>
            )}
        </div>
    )}

</div>
);
}