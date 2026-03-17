import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";
import { headers } from "next/headers"; // ⭐ [추가] 캐시 파괴용 무기 장착

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
// ⭐ [강제 동기화 핵심] 이 함수를 호출하는 순간 Next.js의 모든 캐싱이 무력화됩니다.
headers();

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

// ⭐ [추가] 가장 최근에 작성된 기사의 시간을 추출합니다. (기사가 없으면 현재 시간)
const latestPostDate = posts.length > 0 ? posts[0].updatedAt : new Date();

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
lastModified: latestPostDate, // ⭐ [수정] 무의미한 현재 시간 대신, 최신 기사 등록 시간으로 완벽하게 고정합니다!
changeFrequency: "hourly" as const,
priority: 1.0,
}));

return [...routes, ...postUrls];
}