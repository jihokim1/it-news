import { Header } from "@/components/layout/Header";

export default function SiteLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
// 🟢 [핵심 수정] overflow-x-hidden과 w-full을 추가하여 사이트 내부 가로 스크롤만 방지합니다.
<div className="relative min-h-screen flex flex-col overflow-x-hidden w-full">
    {/* 헤더는 여기서 보여줍니다 */}
    <Header />
    
    <main className="flex-1 container mx-auto px-4 py-6">
    {children}
    </main>
    
    {/* 푸터 */}
    <footer className="border-t py-6 text-center text-sm text-slate-500">
    </footer>
</div>
);
}