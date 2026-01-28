import Sidebar from "./Sidebar";

export default function AdminLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
// md:flex-row -> 데스크톱에서는 가로 배치 (사이드바 | 콘텐츠)
// flex-col -> 모바일에서는 세로 배치 (헤더 | 콘텐츠)
<div className="flex flex-col md:flex-row min-h-screen bg-[#F8F9FA]">
    
    {/* 사이드바 컴포넌트 */}
    <Sidebar />
    
    {/* 메인 콘텐츠 영역 */}
    {/* flex-1: 남은 공간 다 차지 / overflow-x-hidden: 가로 스크롤 방지 */}
    <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-x-hidden w-full">
    <div className="max-w-[1600px] mx-auto">
        {children}
    </div>
    </main>
</div>
);
}