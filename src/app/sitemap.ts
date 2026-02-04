import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const baseUrl = "https://trendit.ai.kr"; // 도메인

// 1. 모든 뉴스 기사 가져오기 (최신 5000개 정도)
const posts = await prisma.news.findMany({
where: {
    publishedAt: { lte: new Date() }, // 예약글 제외
},
select: {
    id: true,
    category: true,
    updatedAt: true,
},
orderBy: {
    publishedAt: "desc",
},
take: 5000,
});

// 2. 뉴스 기사 URL 만들기
const postUrls = posts.map((post) => ({
url: `${baseUrl}/news/${post.category || "general"}/${post.id}`,
lastModified: post.updatedAt,
changeFrequency: "daily" as const,
priority: 0.8,
}));

// 3. 고정 페이지 (메인, 카테고리 등)
const routes = [
"",
"/news/AI",
"/news/IT",
"/news/Tech",
"/news/Stock",
"/news/Coin",
].map((route) => ({
url: `${baseUrl}${route}`,
lastModified: new Date(),
changeFrequency: "hourly" as const,
priority: 1.0,
}));

return [...routes, ...postUrls];
}