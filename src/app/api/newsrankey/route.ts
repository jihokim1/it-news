import { NextResponse } from 'next/server';

function getNewsRankeyChannel(category: string) {
if (['AI', 'IT', '테크'].includes(category)) return 'it';
if (category === '주식') return 'stock';
if (category === '코인') return 'bitcoin';
return 'it';
}

function formatNewsRankeyDate(dateString: string) {
const date = new Date(dateString);
const pad = (n: number) => n.toString().padStart(2, '0');
return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function stripHtml(html: string) {
if (!html) return '';
return html.replace(/<[^>]*>?/gm, '').substring(0, 1000);
}

export async function POST(request: Request) {
try {
const body = await request.json();

// 1. INSERT, UPDATE, DELETE 이벤트가 아니면 무시
if (!['INSERT', 'UPDATE', 'DELETE'].includes(body.type)) {
    return NextResponse.json({ message: '처리할 이벤트가 아닙니다.' }, { status: 400 });
}

const payload = new URLSearchParams();
const AUTH_CODE = process.env.NEWSRANKEY_AUTH_CODE || "bHRdygtOXugpJldzZddudFXjyO4jhiQzMm9Xy8yytFnOYWYTJjhiQzMWMjMmMmd0M2VINOY2ZmYzY1MhNzdi";

// 필수 공통 항목
payload.append('auth_code', AUTH_CODE); 

//  2-A. 기사가 새로 [등록(INSERT)] 되거나 [수정(UPDATE)] 되었을 때
if (body.type === 'INSERT' || body.type === 'UPDATE') {
    const article = body.record; // 최신 데이터
    if (!article) return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 });

    // INSERT면 'new', UPDATE면 'update'로 송고 구분
    payload.append('act', body.type === 'INSERT' ? 'new' : 'update');
    
    payload.append('channel', getNewsRankeyChannel(article.category)); 
    payload.append('org_id', article.id.toString());
    payload.append('org_url', `https://trendit.ai.kr/news/${article.category}/${article.id}`); 
    payload.append('datetime', formatNewsRankeyDate(article.createdAt)); 
    payload.append('title', article.title);
    payload.append('content', stripHtml(article.content));
    
    // ⭐ [수정됨] 이미지 주소가 절대 경로(http)가 아니면 도메인을 강제로 붙여서 전송
    if (article.imageUrl) {
    const absoluteImageUrl = article.imageUrl.startsWith('http') 
        ? article.imageUrl 
        : `https://trendit.ai.kr${article.imageUrl.startsWith('/') ? '' : '/'}${article.imageUrl}`;
    payload.append('img_url', absoluteImageUrl);
    }

    if (article.reporterName) payload.append('writer_name', article.reporterName);
    if (article.reporterEmail) payload.append('writer_email', article.reporterEmail);
}

// 3. 뉴스랭키 서버로 발송
const response = await fetch('http://newsrankey.com/api/index.php', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: payload.toString(),
});

const result = await response.json();
console.log(`뉴스랭키 ${body.type} 발송 결과:`, result);

return NextResponse.json({ success: true, type: body.type, result });

} catch (error) {
console.error('뉴스랭키 연동 에러:', error);
return NextResponse.json({ error: "Server Error" }, { status: 500 });
}
}