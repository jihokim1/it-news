import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import CommentForm from "@/components/comment/CommentForm";
import CommentList from "@/components/comment/CommentList";
import Script from "next/script";
import Image from "next/image"; 

interface Props {
params: Promise<{ category: string; id: string }>;
}

// =============================================================================
// 1. SEO 메타데이터 생성 (검색엔진 노출 설정)
// =============================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { id } = await params;
const news = await prisma.news.findUnique({ where: { id: Number(id) } });
if (!news) return {};

return {
title: news.title,
description: news.summary || news.title,
keywords: news.tags || "",
openGraph: {
    title: news.title,
    description: news.summary || news.title,
    images: news.imageUrl ? [news.imageUrl] : [],
},
twitter: {
    card: "summary_large_image",
    title: news.title,
    description: news.summary || news.title,
    images: news.imageUrl ? [news.imageUrl] : [],
},
};
}

const formatDate = (date: Date | string) => {
const d = new Date(date);
return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
};

// =============================================================================
// 2. 기사 상세 페이지 메인 컴포넌트 시작
// =============================================================================
export default async function NewsDetailPage({ params }: Props) {
const { id, category } = await params;
const newsId = Number(id);

if (isNaN(newsId)) return notFound();

// ---------------------------------------------------------------------------
// [DB 로직] 조회수 증가 및 기사/관련기사 데이터 조회
// ---------------------------------------------------------------------------
let news;
try {
const [updatedNews] = await prisma.$transaction([
    prisma.news.update({ where: { id: newsId }, data: { views: { increment: 1 } } }),
    prisma.newsView.create({ data: { newsId: newsId } }),
]);
news = updatedNews;
} catch (error) {
return notFound();
}

const relatedNews = await prisma.news.findMany({
where: { id: { not: newsId } },
take: 15,
orderBy: { createdAt: "desc" },
select: { id: true, title: true, category: true },
});

// ---------------------------------------------------------------------------
// [데이터 가공 1] 상단 썸네일용 캡션 추출
// ---------------------------------------------------------------------------
// 👇 [상단 썸네일 캡션용 추출]
let captionText = "";
const captionMatch = news.content?.match(/<input[^>]*value=(["'])(.*?)\1/);
if (captionMatch && captionMatch[2] && captionMatch[2] !== "undefined") {
captionText = captionMatch[2];
}

// ---------------------------------------------------------------------------
// [데이터 가공 2] 본문 HTML 정제 (중복 제거 및 캡션 변환)
// ---------------------------------------------------------------------------
// 👇 [본문 내용 처리]
let safeContent = news.content || "";

// 1. 본문 맨 처음에 나오는 '대표 이미지' 1개 삭제 (중복 방지)
safeContent = safeContent.replace(/<img[^>]*>/, ""); 

// ✅ [여기가 수정됨] 대표 이미지의 '설명(input)'도 1개 삭제해야 중복 안 됨!
safeContent = safeContent.replace(/<input[^>]*>/, "");

// 2. 남은(본문 중간) 캡션들은 <figcaption>으로 변환 (회색 설명글로 보이기)
safeContent = safeContent.replace(
/<input[^>]*value=(["'])(.*?)\1[^>]*>/g, 
'<figcaption class="caption-text">$2</figcaption>'
);

// 3. 변환 안 된 나머지 찌꺼기 input 삭제
safeContent = safeContent.replace(/<input[^>]*>/g, '');

// 4. 툴팁 찌꺼기 등 제거
safeContent = safeContent.replace(/<div[^>]*class="ql-tooltip[^>]*>.*?<\/div>/g, ''); 
safeContent = safeContent.replace(/<div[^>]*class="[^"]*ql-tooltip[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');
safeContent = safeContent.replace(/<span[^>]*class="ql-cursor[^>]*>.*?<\/span>/g, '');

// 5. 빈 줄 및 에디터 속성 제거
safeContent = safeContent.replace(/^(<p>\s*<br\s*\/?>\s*<\/p>)+/gi, '');
safeContent = safeContent.replace(/^(<p>\s*<\/p>)+/gi, '');
safeContent = safeContent.replace(/contenteditable="true"/g, 'contenteditable="false"');

// ---------------------------------------------------------------------------
// [SEO 데이터] 검색엔진용 구조화 데이터 (JSON-LD) 생성
// ---------------------------------------------------------------------------
const tagsArray = news.tags ? news.tags.split(",").map(t => t.trim()) : [];
const summaryLines = news.summary ? news.summary.split("\n") : [];

const jsonLd = {
"@context": "https://schema.org",
"@type": "NewsArticle",
"headline": news.title,
"image": [
    news.imageUrl || 'https://trendit.ai.kr/opengraph-image.png'
],
"datePublished": news.createdAt.toISOString(),
"dateModified": news.updatedAt.toISOString(), 
"description": news.summary || news.title,
"author": [{
    "@type": "Person",
    "name": news.reporterName || "TrendIT 취재팀",
    "url": "https://trendit.ai.kr"
}],
"publisher": {
    "@type": "Organization",
    "name": "트렌드IT",
    "logo": {
    "@type": "ImageObject",
    "url": "https://trendit.ai.kr/logo.png"
    }
}
};

const breadcrumbLd = {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": [
    {
    "@type": "ListItem",
    "position": 1,
    "name": "홈",
    "item": "https://trendit.ai.kr"
    },
    {
    "@type": "ListItem",
    "position": 2,
    "name": news.category || "전체",
    "item": `https://trendit.ai.kr/news/${news.category || "all"}`
    },
    {
    "@type": "ListItem",
    "position": 3,
    "name": news.title,
    "item": `https://trendit.ai.kr/news/${news.category}/${news.id}`
    }
]
};

// =============================================================================
// 3. 화면 렌더링 (UI 구성)
// =============================================================================
return (
<div className="bg-white md:bg-gray-50 min-h-screen pb-10 md:pb-20 font-sans text-[#111827]">

    {/* SEO 스크립트 삽입 */}
    <Script
    id="news-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />

    <Script
    id="breadcrumb-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
    />

    <div className="max-w-[1280px] mx-auto px-0 md:px-6 lg:px-16 py-0 md:py-12">

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ---------------------------------------------------------------- */}
        {/* (1) 메인 기사 영역 (좌측/중앙) */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-3 bg-white md:rounded-2xl md:border border-gray-200 md:shadow-sm overflow-hidden">
            
            {/* [헤더] 카테고리, 제목, 요약, 날짜 */}
            <header className="px-5 md:px-8 pt-6 md:pt-10 pb-4 border-b border-gray-100">
                <Link href={`/news/${category}`}>
                    <span className="inline-block text-blue-600 font-black text-sm mb-2 uppercase hover:underline cursor-pointer transition-colors">
                        {news.category || "NEWS"}
                    </span>
                </Link>
                
                <h1 className="text-[26px] md:text-4xl font-black text-gray-900 leading-[1.3] mb-4 tracking-tight">
                    {news.title}
                </h1>

                {summaryLines.length > 0 && (
                    <div className="mb-6">
                        {summaryLines.map((line, idx) => (
                            <p key={idx} className="text-[17px] md:text-xl font-medium text-gray-600 leading-snug mb-1">
                                {line}
                            </p>
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-end text-gray-400 text-xs md:text-sm pt-2">
                    <span>
                        {news.reporterName || "이정혁 기자"} ·{" "}
                        <time dateTime={news.createdAt.toISOString()} itemProp="datePublished">
                            {formatDate(news.createdAt)}
                        </time>
                    </span>
                </div>
            </header>

            {/* [이미지] 상단 대표 이미지 (썸네일) */}
            {/* 1. 상단 대표 이미지 */}
            {news.imageUrl && (
                <div className="px-5 md:px-8 pt-6">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <Image 
                            src={news.imageUrl} 
                            alt={news.title}
                            fill
                            priority={true}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    </div>
                </div>
            )}
            
            {/* [이미지 설명] 상단 캡션 */}
            {/* 2. 상단 캡션 (썸네일 설명) */}
            {news.imageUrl && captionText && (
                <div className="px-5 md:px-8 pt-2 text-center">
                    <span className="text-xs text-gray-400 font-normal break-keep inline-block leading-relaxed">
                        {captionText}
                    </span>
                </div>
            )}

            {/* [본문] 에디터 작성 내용 출력 */}
            {/* 3. 본문 */}
            <article className="px-5 md:px-8 pb-6 md:pb-8 pt-6">
                <div className="view-content max-w-none mx-auto text-gray-800" dangerouslySetInnerHTML={{ __html: safeContent }} />
            </article>

            {/* [하단 정보] 기자 프로필, 태그, 관련기사, 댓글 */}
            <div className="px-5 md:px-8 mt-4 pb-10">
                <div className="border-t border-b border-gray-100 py-5 flex justify-between items-center bg-gray-50 rounded-lg px-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-xl shadow-sm">
                            👤
                        </div>
                        <div>
                            <h4 className="text-sm md:text-lg font-bold text-gray-900">{news.reporterName || "이정혁 기자"}</h4>
                            <p className="text-xs md:text-sm text-gray-500">{news.reporterEmail || "indisnews1@gmail.com"}</p>
                        </div>
                    </div>
                </div>

                {tagsArray.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {tagsArray.map((tag, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 border border-blue-100 text-xs md:text-sm px-2.5 py-1 rounded-md font-bold">
                                #{tag.replace(/^#/, '')}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mb-10 pt-2">
                    <h3 className="text-base md:text-lg font-bold mb-3 text-slate-900 flex items-center gap-2">
                        <span className="w-1 h-4 bg-slate-900 inline-block"></span>
                        관련기사
                    </h3>
                    <ul className="space-y-3"> 
                        {relatedNews.map((item) => (
                            <li key={item.id}>
                                <Link 
                                    href={`/news/${item.category || 'general'}/${item.id}`} 
                                    className="block text-[15px] text-slate-700 hover:text-blue-600 hover:underline transition-colors truncate"
                                >
                                    <span className="text-gray-300 mr-2 text-xs">·</span>
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <CommentForm newsId={news.id} />
                    <div className="mt-8">
                        <CommentList newsId={news.id} />
                    </div>
                </div>

                <div className="mt-12 text-[11px] text-gray-400 font-medium border-t border-gray-100 pt-6 text-center md:text-left">
                    저작권자 © 트렌드IT 무단전재 및 재배포, AI학습 및 활용 금지
                </div>
            </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* (2) 사이드바 영역 (우측) */}
        {/* ---------------------------------------------------------------- */}
        <aside className="lg:col-span-1 px-5 md:px-0">
            <NewsSidebar />
        </aside>

    </div>
    </div>

    {/* ====================================================================== */}
    {/* 4. 스타일 정의 (CSS 커스텀) */}
    {/* ====================================================================== */}
    <style>{`
    .view-content {
        font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        font-size: 17px;
        line-height: 1.65;
        letter-spacing: -0.01em;
        color: #333;
        word-break: break-word;
    }

    /* 원래 입력창은 숨김 */
    .news-image-container input { display: none !important; }

    /* 본문 이미지 스타일 */
    .view-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 2em auto 0.5em auto;
        display: block; 
    }

    /* ✅ [본문 캡션 스타일] 회색, 가운데 정렬 */
    .view-content figcaption.caption-text {
        display: block;          
        text-align: center;      
        font-size: 13px;         
        color: #9ca3af;          /* 회색 */
        font-style: normal;      
        font-weight: 400;        
        margin-bottom: 2em;      
        line-height: 1.4;
    }

    .view-content p { margin-bottom: 1.35rem; }

    .view-content h1, .view-content h2, .view-content h3 {
        font-weight: 800; 
        margin-top: 2em; 
        margin-bottom: 0.8em; 
        color: #111827;
        font-size: 1.3em;
        line-height: 1.3;
    }

    .view-content blockquote {
        border-left: 3px solid #3b82f6;
        margin: 1.5rem 0;
        padding: 1rem;
        color: #4b5563;
        background: #f8f9fa;
        border-radius: 0 4px 4px 0;
        font-size: 0.95em;
    }

    @media (min-width: 768px) {
        .view-content { font-size: 18px; line-height: 1.8; }
    }
    `}</style>
</div>
);
}