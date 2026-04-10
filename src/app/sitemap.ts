import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
// ⭐ [강제 동기화 핵심] 캐시 파괴
headers();

const baseUrl = "https://trendit.ai.kr";

// 1. 시차 폭탄 해체: KST와 UTC 시차로 인한 최신 기사 누락 방지
const posts = await prisma.news.findMany({
where: {

},
select: {
    id: true,
    category: true,
    updatedAt: true,
    publishedAt: true,
},
orderBy: {
    publishedAt: "desc",
},
take: 5000,
});

const latestPostDate = posts.length > 0 ? posts[0].updatedAt || posts[0].publishedAt : new Date();

// 2. 뉴스 기사 URL 만들기
const postUrls = posts.map((post) => ({
url: `${baseUrl}/news/${post.category || "general"}/${post.id}`,
lastModified: post.updatedAt || post.publishedAt,
changeFrequency: "daily" as const,
priority: 0.8,
}));

// 3. 고정 페이지
const routes = [
"",
"/news/AI",
"/news/IT",
"/news/Tech",
"/news/Stock",
"/news/Coin",
].map((route) => ({
url: `${baseUrl}${route}`,
lastModified: latestPostDate, 
changeFrequency: "hourly" as const,
priority: 1.0,
}));

return [...routes, ...postUrls];
}