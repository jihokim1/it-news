import Sidebar from "./Sidebar"; // 👈 같은 폴더에서 불러오기

export default function AdminLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="flex min-h-screen bg-gray-50">
    
    {/* 사이드바 */}
    <Sidebar />

    {/* 메인 콘텐츠 */}
    <main className="flex-1 p-10">
    <header className="flex justify-between items-center mb-8">
        <h2 className="font-bold text-gray-500">관리자 모드</h2>
        <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-600">박사님 (Super Admin)</span>
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
        </div>
    </header>
    {children}
    </main>
</div>
);
}