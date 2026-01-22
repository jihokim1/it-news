import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import type { Metadata } from "next";


export const dynamic = "force-dynamic";

interface Props {
searchParams: Promise<{ store?: string; category?: string }>;
}
//  앱 랭킹 페이지 seo 작업 함수
export const metadata: Metadata = {
title: "실시간 인기 앱 랭킹 TOP 100 | TrendIT", // 제목에 핵심 키워드 배치
description: "대한민국에서 지금 가장 핫한 앱 순위(App Ranking)를 확인하세요. 게임, 금융, 소셜 등 분야별 실시간 앱 랭킹 정보를 제공합니다.",
keywords: ["앱랭킹", "앱순위", "어플순위", "모바일앱순위", "인기앱", "TrendIT", "안드로이드순위", "아이폰순위"],
openGraph: {
    title: "실시간 인기 앱 랭킹 - TrendIT",
    description: "오늘의 급상승 앱 순위를 한눈에 확인하세요.",
    type: "website",
    url: "https://trendit.ai.kr/ranking", // 박사님 도메인
    // images: ["/og-ranking.png"], // 나중에 썸네일 이미지 있으면 추가
},
};


export default async function RankingPage({ searchParams }: Props) {
const { store, category } = await searchParams;
const currentStore = store === "apple" ? "apple" : "google";

const categoryParam = category || "all";
const currentCategoryLabel = categoryParam === "all" ? "전체" : categoryParam;

// DB 필터링 (박사님 로직 100% 유지)
let whereCondition: any = {
    platform: currentStore,
    category: {
    contains:
        currentCategoryLabel === "game" ? "게임"
        : currentCategoryLabel === "finance" ? "금융"
        : currentCategoryLabel === "social" ? "소셜"
        : currentCategoryLabel === "enter" ? "엔터"
        : currentCategoryLabel === "life" ? "생활"
        : "전체",
    },
};

if (currentCategoryLabel === "life") {
    whereCondition.category = undefined;
    whereCondition.OR = [
    { category: { contains: "생활" } },
    { category: { contains: "라이프" } },
    { category: { contains: "쇼핑" } },
    ];
}

// 데이터 조회
const filteredList = await prisma.appRanking.findMany({
    where: whereCondition,
    orderBy: { rank: "asc" },
    take: 50,
});

const categories = [
    { label: "전체", value: "all" },
    { label: "게임", value: "game" },
    { label: "금융", value: "finance" },
    { label: "소셜", value: "social" },
    { label: "엔터", value: "enter" },
    { label: "생활", value: "life" },
];

const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-yellow-500 text-3xl";
    if (rank === 2) return "text-slate-400 text-2xl";
    if (rank === 3) return "text-amber-600 text-2xl";
    return "text-slate-800 text-lg";
};

return (
    <div className="bg-white min-h-screen pb-20 font-sans text-slate-900">
    
    {/* 1. 상단 타이틀 & 실시간 표시 */}
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto max-w-5xl px-4 py-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
            {/* 👇 2. 제목 수정: '차트' -> '실시간 앱 랭킹' (SEO 필수) */}
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                실시간 앱 랭킹
            </h1>
            <span className="flex items-center gap-1 bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                LIVE
            </span>
            </div>
        </div>

        {/* 2. 스토어 선택 */}
        <div className="mt-4 flex p-1 bg-gray-100 rounded-xl">
            <Link
            href={`/ranking?store=google&category=${categoryParam}`}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
                currentStore === "google"
                ? "bg-white text-green-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-400 hover:text-gray-600"
            }`}
            >
            구글 플레이
            </Link>
            <Link
            href={`/ranking?store=apple&category=${categoryParam}`}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${
                currentStore === "apple"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-400 hover:text-gray-600"
            }`}
            >
            앱스토어
            </Link>
        </div>

        {/* 3. 카테고리 */}
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => (
            <Link
                key={cat.value}
                href={`/ranking?store=${currentStore}&category=${cat.value}`}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                categoryParam === cat.value
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
                }`}
            >
                {cat.label}
            </Link>
            ))}
        </div>
        </div>
    </div>

    <div className="container mx-auto max-w-5xl px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 메인 리스트 (8칸) */}
        <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-xl font-bold">Top 50</h2>
            </div>

            <div className="space-y-2">
            {filteredList.length > 0 ? (
                filteredList.map((app) => (
                <div
                    key={app.id}
                    className="group relative bg-white hover:bg-gray-50 rounded-xl p-3 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-0"
                >
                    {/* 순위 */}
                    <div className="w-8 flex justify-center shrink-0">
                    <span className={`font-black italic ${getRankStyle(app.rank)}`}>
                        {app.rank}
                    </span>
                    </div>

                    {/* 변동폭 (데코) */}
                    <div className="w-4 text-center text-[10px] text-gray-400 shrink-0 hidden sm:block">
                    -
                    </div>

                    {/* 아이콘 */}
                    <Link
                    href={app.link || "#"}
                    target="_blank"
                    className="relative w-14 h-14 shrink-0 rounded-[14px] overflow-hidden border border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                    >
                    {app.iconUrl ? (
                        <img
                        src={app.iconUrl}
                        alt={app.title}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        📱
                        </div>
                    )}
                    </Link>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                    <Link href={app.link || "#"} target="_blank">
                        <h3 className="text-[16px] font-bold text-slate-900 truncate group-hover:text-blue-600 mb-0.5">
                        {app.title}
                        </h3>
                        <p className="text-[13px] text-gray-500 truncate">
                        {app.publisher}
                        <span className="mx-1.5 text-gray-300">|</span>
                        <span className="text-gray-400">{app.category}</span>
                        </p>
                    </Link>
                    </div>

                    {/* 다운로드 버튼 */}
                    <div className="shrink-0">
                    <Link
                        href={app.link || "#"}
                        target="_blank"
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all"
                    >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                        </svg>
                    </Link>
                    </div>
                </div>
                ))
            ) : (
                <div className="py-24 text-center text-gray-400">
                <p className="text-4xl mb-2">🐢</p>
                <p>데이터 로딩 중...</p>
                </div>
            )}
            </div>
        </div>

        {/* 사이드바 */}
        <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-44">
            <NewsSidebar />
            </div>
        </aside>
        </div>
    </div>
    </div>
);
}