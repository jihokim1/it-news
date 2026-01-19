import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
// 1. 감시 로그 출력 (터미널에 이 글자가 뜨는지 확인하세요!)
console.log("👮‍♂️ 미들웨어 작동 중! 현재 경로:", request.nextUrl.pathname);

// 2. 관리자 페이지로 가려는지 확인
if (request.nextUrl.pathname.startsWith("/admin")) {

// 입장권(쿠키) 확인
const session = request.cookies.get("admin_session");
console.log("🎫 입장권(쿠키) 상태:", session ? "있음(통과)" : "없음(쫓겨남)");

// 3. 입장권 없으면 '/admin-login' 으로 강제 이동
if (!session) {
    console.log("🚨 쫓겨남! 로그인 페이지로 이동");
    return NextResponse.redirect(new URL("/admin-login", request.url));
}
}

return NextResponse.next();
}

// 감시할 경로 설정 (정규식 등으로 확실하게 잡기)
export const config = {
matcher: [
/*
    * 아래 경로로 시작하는 것들은 다 감시함:
    * - /admin
    * - /admin/dashboard
    * - /admin/write
    */
"/admin/:path*",
],
};