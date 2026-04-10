import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
const baseUrl = "https://trendit.ai.kr";

// 정확히 48시간 전 기사까지만 (구글 뉴스 규정)
const twoDaysAgo = new Date();
twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

const posts = await prisma.news.findMany({
where: {
    publishedAt: {
    gte: twoDaysAgo,
    },
},
select: {
    id: true,
    category: true,
    publishedAt: true,
    title: true,
    imageUrl: true,
},
orderBy: {
    publishedAt: "desc",
},
});

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

for (const post of posts) {
const url = `${baseUrl}/news/${post.category || "general"}/${post.id}`;
const pubDate = post.publishedAt.toISOString();

// XML 특수문자 안전 처리
const safeTitle = post.title.replace(/[<>&"']/g, (char) => {
    switch (char) {
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '&': return '&amp;';
    case '"': return '&quot;';
    case "'": return '&apos;';
    default: return char;
    }
});

xml += `  <url>\n`;
xml += `    <loc>${url}</loc>\n`;
xml += `    <news:news>\n`;
xml += `      <news:publication>\n`;
xml += `        <news:name>트렌드IT</news:name>\n`;
xml += `        <news:language>ko</news:language>\n`;
xml += `      </news:publication>\n`;
xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
xml += `      <news:title>${safeTitle}</news:title>\n`;
xml += `    </news:news>\n`;

if (post.imageUrl) {
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${post.imageUrl}</image:loc>\n`;
    xml += `    </image:image>\n`;
}
xml += `  </url>\n`;
}

xml += `</urlset>`;

return new NextResponse(xml, {
headers: {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "no-store, max-age=0", 
},
});
}