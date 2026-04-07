import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
const baseUrl = "https://trendit.ai.kr";
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const posts = await prisma.news.findMany({
where: {
    publishedAt: {
    gte: twoDaysAgo,
    lte: new Date(),
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

// 제목은 반드시 페이지의 <title>과 일치해야 하며, 특수문자 안전 처리를 수행합니다.
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
    const safeImageUrl = encodeURI(post.imageUrl);
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${safeImageUrl}</image:loc>\n`;
    xml += `    </image:image>\n`;
}
xml += `  </url>\n`;
}

xml += `</urlset>`;

return new NextResponse(xml, {
headers: {
    "Content-Type": "application/xml; charset=utf-8",
    "X-Content-Type-Options": "nosniff", // 보안 헤더 추가
},
});
}