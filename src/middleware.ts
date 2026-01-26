import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
// 현재 접속하려는 경로
const { pathname, searchParams } = request.nextUrl;

// 1. '/admin'으로 시작하는 경로만 감시
if (pathname.startsWith("/admin")) {

// --------------------------------------------------------
// [1차 관문] 이미 로그인 했나? (쿠키 확인)
// --------------------------------------------------------
// 이미 로그인한 상태라면 비밀번호 검사 생략하고 프리패스!
// (이게 있어야 내부에서 메뉴 클릭할 때 에러가 안 납니다)
const session = request.cookies.get("admin_session");
if (session) {
    return NextResponse.next();
}

// --------------------------------------------------------
// [2차 관문] 로그인은 안 했지만, 비밀 열쇠를 가지고 있나?
// --------------------------------------------------------
const key = searchParams.get("key");

// 비밀번호가 틀리면 -> 가차없이 404 화면을 던져버림 (사이드바도 안 보임)
if (key !== "trendit1234") { // 🔒 박사님 비밀번호
    console.log("🚨 침입자 발생! 404로 위장합니다.");
    return NextResponse.rewrite(new URL("/404", request.url));
}

// 비밀번호가 맞으면 -> 통과! (페이지 접속 허용)
console.log("✅ 비밀 열쇠 확인됨. 입장 허용.");
}

return NextResponse.next();
}

// 감시할 경로 설정
export const config = {
matcher: ["/admin/:path*"],
};