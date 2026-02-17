import { Header } from "@/components/layout/Header";

export default function SiteLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
// 🟢 [핵심 수정] sticky 고장을 일으키는 주범인 'overflow-x-hidden'을 과감히 삭제했습니다.
<div className="relative min-h-screen flex flex-col w-full">
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