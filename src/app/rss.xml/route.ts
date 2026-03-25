import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = "https://trendit.ai.kr";

export async function GET() {
  // 1. 최신 기사 100개 가져오기 (전체 본문 포함)
  const allNews = await prisma.news.findMany({
    where: {
      publishedAt: { lte: new Date() }, // 예약글 제외
    },
    orderBy: { publishedAt: "desc" },
    take: 100,
    select: { 
      id: true,
      title: true,
      category: true,
      summary: true,
      content: true, 
      publishedAt: true,
      reporterEmail: true,
      reporterName: true,
    }
  });

  // XML 구조 (RSS 2.0 및 Atom Link 최신 규격 완벽 준수)
  const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>트렌드IT - 대한민국 No.1 IT 뉴스 &amp; 앱 랭킹</title>
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
      <description><![CDATA[${post.content || post.summary || ""}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${post.reporterEmail || "editor@trendit.ai.kr"} (${post.reporterName || "TrendIT"})</author>
      <category>${post.category || "General"}</category>
    </item>`;
      })
      .join("")}
  </channel>
  </rss>`;

  // 브라우저와 검색 봇에게 XML 파일임을 명시하여 반환
  return new Response(feedXml, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}