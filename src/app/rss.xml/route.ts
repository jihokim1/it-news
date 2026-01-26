import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.trendit.ai.kr";

export async function GET() {
  // 최신 기사 100개 가져오기
  const allNews = await prisma.news.findMany({
    where: {
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take: 100,
    include: {
    }
  });

  // XML 구조 만들기
  const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>트렌드IT - 대한민국 No.1 IT 뉴스</title>
    <link>${BASE_URL}</link>
    <description>가장 빠른 IT 뉴스, 실시간 앱 랭킹, AI 및 테크 트렌드 분석을 제공합니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    
    ${allNews
      .map((post) => {
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/news/${post.category || "general"}/${post.id}</link>
      <guid isPermaLink="true">${BASE_URL}/news/${post.category || "general"}/${post.id}</guid>
      <description><![CDATA[${post.summary || ""}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${post.reporterEmail || "editor@trendit.ai.kr"} (${post.reporterName || "TrendIT"})</author>
      <category>${post.category || "General"}</category>
    </item>`;
      })
      .join("")}
  </channel>
  </rss>`;

  return new Response(feedXml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}