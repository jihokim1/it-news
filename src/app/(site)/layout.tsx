import { Header } from "@/components/layout/Header";

export default function SiteLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="relative min-h-screen flex flex-col">
    {/* 헤더는 여기서 보여줍니다 */}
    <Header />
    
    <main className="flex-1 container mx-auto px-4 py-6">
    {children}
    </main>
    
    {/* 푸터 */}
    <footer className="border-t py-6 text-center text-sm text-slate-500">
    © 2026 IT News. All rights reserved.
    </footer>
</div>
);
}