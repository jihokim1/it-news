import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"; // ⭐ 정확한 팩트: next/server에서 가져옵니다.

// ⭐ [캐시 완벽 파괴] 기사가 올라올 때마다 실시간으로 XML을 새로 찍어냅니다.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
const baseUrl = "https://trendit.ai.kr";

// 💡 [구글 뉴스 팩트] 뉴스 사이트맵은 규정상 '최근 48시간' 이내의 기사만 포함해야 합니다.
const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

// 1. 최근 48시간 이내의 뉴스 기사 가져오기
const posts = await prisma.news.findMany({
where: {
    publishedAt: {
    gte: twoDaysAgo, // 최근 2일 기사만 추출
    lte: new Date(), // 예약글 제외
    },
},
select: {
    id: true,
    category: true,
    publishedAt: true,
    title: true,       
    imageUrl: true, 
    tags: true,     
},
orderBy: {
    publishedAt: "desc",
},
});

// 2. XML 뼈대 시작 (구글 뉴스 및 이미지 네임스페이스 포함)
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

// 3. 기사별 데이터 반복문 삽입
for (const post of posts) {
const url = `${baseUrl}/news/${post.category || "general"}/${post.id}`;
const pubDate = post.publishedAt.toISOString();

// ⭐ [에러 방어벽] 제목에 따옴표나 특수문자가 있어도 XML이 깨지지 않게 CDATA로 감쌉니다.
const safeTitle = `<![CDATA[${post.title}]]>`;

// ⭐ 스키마의 tags를 키워드로 활용. 태그가 비어있을 경우를 대비한 기본값 세팅
const keywords = post.tags ? post.tags : `트렌드IT, IT뉴스, ${post.category}`;
const safeKeywords = `<![CDATA[${keywords}]]>`;

xml += `  <url>\n`;
xml += `    <loc>${url}</loc>\n`;
xml += `    <news:news>\n`;
xml += `      <news:publication>\n`;
xml += `        <news:name>트렌드IT</news:name>\n`;
xml += `        <news:language>ko</news:language>\n`;
xml += `      </news:publication>\n`;
xml += `      <news:publication_date>${pubDate}</news:publication_date>\n`;
xml += `      <news:title>${safeTitle}</news:title>\n`;
xml += `      <news:keywords>${safeKeywords}</news:keywords>\n`;
xml += `    </news:news>\n`;

// ⭐ 썸네일 이미지가 존재할 경우 구글 검색 결과에 강제 노출시키기 위한 이미지 태그 삽입
if (post.imageUrl) {
    // 이미지 URL에 포함될 수 있는 특수기호 에러 방지
    const safeImageUrl = post.imageUrl.replace(/&/g, "&amp;");
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${safeImageUrl}</image:loc>\n`;
    xml += `    </image:image>\n`;
}

xml += `  </url>\n`;
}

// 4. XML 뼈대 닫기
xml += `</urlset>`;

// 5. 브라우저와 구글 봇에게 이것이 단순 텍스트가 아닌 '순수 XML 파일'임을 각인시킵니다.
return new NextResponse(xml, {
headers: {
    "Content-Type": "text/xml",
},
});
}