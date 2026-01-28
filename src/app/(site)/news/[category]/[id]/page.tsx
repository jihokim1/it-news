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

export default async function NewsDetailPage({ params }: Props) {
const { id, category } = await params;
const newsId = Number(id);

if (isNaN(newsId)) return notFound();

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

const dateString = new Date(news.createdAt).toLocaleDateString("ko-KR", {
year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
});

// 👇 [로직 변경] 캡션을 정규식으로 안전하게 추출 (본문 변환 X -> 추출 O)
let captionText = "";
const captionMatch = news.content?.match(/<input[^>]*value=["']([^"']+)["'][^>]*>/);
if (captionMatch && captionMatch[1] && captionMatch[1] !== "undefined") {
    captionText = captionMatch[1];
}

// 👇 [본문 청소]
let safeContent = news.content || "";

// 1. 느린 이미지(<img>) 삭제 -> 위쪽에서 Fast Image로 보여줄 것임
safeContent = safeContent.replace(/<img[^>]*>/g, '');
// 2. 입력창(<input>) 삭제 -> 위쪽에서 텍스트로 보여줄 것임
safeContent = safeContent.replace(/<input[^>]*>/g, '');

// 3. [핵심] 사진과 본문 사이의 쓸데없는 빈 줄 제거 (간격 좁히기)
safeContent = safeContent.replace(/^(<p>\s*<br\s*\/?>\s*<\/p>)+/gi, '');
safeContent = safeContent.replace(/^(<p>\s*<\/p>)+/gi, '');

// 4. 편집기 찌꺼기 제거
safeContent = safeContent
    .replace(/contenteditable="true"/g, 'contenteditable="false"')
    .replace(/class="ql-cursor"/g, 'style="display:none"') 
    .replace(/<div class="ql-tooltip[^>]*>.*?<\/div>/g, ''); 

const tagsArray = news.tags ? news.tags.split(",").map(t => t.trim()) : [];
const summaryLines = news.summary ? news.summary.split("\n") : [];

const jsonLd = {
"@context": "https://schema.org",
"@type": "NewsArticle",
"headline": news.title,
"image": [
    news.imageUrl || 'https://www.trendit.ai.kr/opengraph-image.png'
],
"datePublished": news.createdAt.toISOString(),
"dateModified": news.updatedAt.toISOString(), 
"description": news.summary || news.title,
"author": [{
    "@type": "Person",
    "name": news.reporterName || "TrendIT 취재팀",
    "url": "https://www.trendit.ai.kr"
}]
};

const breadcrumbLd = {
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": [
    {
    "@type": "ListItem",
    "position": 1,
    "name": "홈",
    "item": "https://www.trendit.ai.kr"
    },
    {
    "@type": "ListItem",
    "position": 2,
    "name": news.category || "전체",
    "item": `https://www.trendit.ai.kr/news/${news.category || "all"}`
    },
    {
    "@type": "ListItem",
    "position": 3,
    "name": news.title,
    "item": `https://www.trendit.ai.kr/news/${news.category}/${news.id}`
    }
]
};

return (
<div className="bg-white md:bg-gray-50 min-h-screen pb-10 md:pb-20 font-sans text-[#111827]">

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
    
    <div className="lg:col-span-3 bg-white md:rounded-2xl md:border border-gray-200 md:shadow-sm overflow-hidden">
        
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
                        {dateString}
                    </time>
                </span>
            </div>
        </header>

        {/* 👇 1. 대표 이미지 (priority=true로 속도 최적화) */}
        {news.imageUrl && (
            <div className="px-5 md:px-8 pt-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                    <Image 
                        src={news.imageUrl} 
                        alt={news.title}
                        fill
                        priority={true} // 🚀 0.1초 로딩 핵심
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                </div>
            </div>
        )}

        {/* 👇 2. 출처 (캡션) - 이미지가 있을 때만 바로 밑에 붙임 */}
        {news.imageUrl && captionText && (
            <div className="px-5 md:px-8 pt-2 text-center">
                <span className="text-xs text-gray-400 font-normal">{captionText}</span>
            </div>
        )}

        {/* 👇 3. 본문 (위쪽 여백 제거 pt-4 -> 사진/캡션과 밀착) */}
        <article className="px-5 md:px-8 pb-6 md:pb-8 pt-4">
            <div className="view-content max-w-none mx-auto text-gray-800" dangerouslySetInnerHTML={{ __html: safeContent }} />
        </article>

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

    <aside className="lg:col-span-1 px-5 md:px-0">
        <NewsSidebar />
    </aside>

</div>
</div>

<style>{`
.view-content {
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.65;
    letter-spacing: -0.01em;
    color: #333;
    word-break: break-word;
}

/* 본문에 남아있는 이미지 컨테이너 숨김 (안전장치) */
.news-image-container { display: none !important; }

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