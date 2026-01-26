import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { NewsSidebar } from "@/components/news/NewsSidebar";
import CommentForm from "@/components/comment/CommentForm";
import CommentList from "@/components/comment/CommentList";
import Script from "next/script";

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
// ⭐ [SEO 업그레이드] 트위터 카드 메타데이터 추가 (SNS 공유 최적화)
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

const safeContent = news.content.replace(/contenteditable/g, 'data-disabled');
const tagsArray = news.tags ? news.tags.split(",").map(t => t.trim()) : [];
const summaryLines = news.summary ? news.summary.split("\n") : [];

// ⭐ [SEO 최적화 추가] 구글 검색엔진용 '뉴스 기사' 구조화 데이터 (JSON-LD) 생성
// 이 데이터가 있어야 구글 뉴스 탭이나 캐러셀에 노출될 확률이 높아집니다.
const jsonLd = {
"@context": "https://schema.org",
"@type": "NewsArticle",
"headline": news.title,
// 이미지가 없으면 사이트 대표 이미지를 넣어주어 에러를 방지합니다.
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

// ⭐ [SEO 업그레이드] 브레드크럼(Breadcrumb) 구조화 데이터 추가
// 검색 결과에 '홈 > 카테고리 > 기사제목' 경로를 예쁘게 보여줍니다.
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
// [수정] 배경색을 모바일에서는 흰색(white), PC에서는 회색(gray-50)으로 분리하여 앱 같은 느낌
<div className="bg-white md:bg-gray-50 min-h-screen pb-10 md:pb-20 font-sans text-[#111827]">

{/* ⭐ [SEO 최적화 추가] 만든 명찰(JSON-LD)을 페이지에 심는 스크립트 */}
<Script
    id="news-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>

{/* ⭐ [SEO 업그레이드] 브레드크럼 스크립트 추가 */}
<Script
    id="breadcrumb-jsonld"
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
/>

{/* [수정] 모바일 패딩 대폭 축소 (px-0 md:px-6) */}
<div className="max-w-[1280px] mx-auto px-0 md:px-6 lg:px-16 py-0 md:py-12">

<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
    
    {/* [왼쪽] 기사 본문 영역 */}
    {/* [수정] 모바일에서는 테두리와 둥근 모서리 제거 (border-0 rounded-none) */}
    <div className="lg:col-span-3 bg-white md:rounded-2xl md:border border-gray-200 md:shadow-sm overflow-hidden">
        
        {/* [수정] 헤더 패딩 축소 (px-5) */}
        <header className="px-5 md:px-8 pt-6 md:pt-10 pb-4 border-b border-gray-100">
            <Link href={`/news/${category}`}>
                <span className="inline-block text-blue-600 font-black text-sm mb-2 uppercase hover:underline cursor-pointer transition-colors">
                    {news.category || "NEWS"}
                </span>
            </Link>
            
            {/* [수정] 제목 폰트 사이즈 및 줄간격 모바일 최적화 */}
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
                {/* ⭐ [SEO 업그레이드] 시맨틱 태그 time 적용 (검색엔진 시간 인식 강화) */}
                <span>
                    {news.reporterName || "이정혁 기자"} ·{" "}
                    <time dateTime={news.createdAt.toISOString()} itemProp="datePublished">
                        {dateString}
                    </time>
                </span>
            </div>
        </header>

        {/* [수정] 본문 패딩 축소 (px-5) */}
        <article className="px-5 md:px-8 py-6 md:py-8">
            {/* [수정] dangerouslySetInnerHTML 스타일링 클래스(view-content)가 핵심 */}
            <div className="view-content max-w-none mx-auto text-gray-800" dangerouslySetInnerHTML={{ __html: safeContent }} />
        </article>

        <div className="px-5 md:px-8 mt-4 pb-10">
            
            {/* 기자 정보 카드 */}
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

            {/* 태그 영역 */}
            {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                    {tagsArray.map((tag, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 border border-blue-100 text-xs md:text-sm px-2.5 py-1 rounded-md font-bold">
                            #{tag.replace(/^#/, '')}
                        </span>
                    ))}
                </div>
            )}

            {/* 관련 기사 */}
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

            {/* 댓글 영역 */}
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
/* [핵심 처방] 모바일 최적화 스타일 */
.view-content {
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    font-size: 17px; /* 모바일 가독성 최적화 */
    line-height: 1.65;
    letter-spacing: -0.01em;
    color: #333;
    word-break: break-word; /* 긴 단어 줄바꿈 */
}

/* 이미지 컨테이너: 무조건 꽉 차게 */
.news-image-container {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 24px 0 !important; /* 위아래 여백 축소 */
}

/* 이미지 자체: 꽉 차게 + 둥근 모서리 */
.news-image-container img {
    display: block;
    width: 100% !important;
    height: auto !important;
    border-radius: 6px;
}

/* 텍스트 간격 조정 */
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

/* PC 화면 대응 (미디어 쿼리) */
@media (min-width: 768px) {
    .view-content { font-size: 18px; line-height: 1.8; }
    .news-image-container { margin: 40px auto !important; }
}
`}</style>
</div>
);
}