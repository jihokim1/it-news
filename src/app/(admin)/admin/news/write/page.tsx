"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { saveNews, deleteImageAction, getNewsById } from "@/app/(admin)/admin/news/write/actions";
import dynamicLoader from "next/dynamic";

// ✅ 에디터 로딩 최적화
const NewsEditor = dynamicLoader(
() => import("@/components/editor/NewsEditor"),
{ 
ssr: false, 
loading: () => <div className="h-96 flex items-center justify-center border text-gray-400">에디터 로딩중...</div> 
}
);

// ✅ 충돌나던 revalidate 삭제하고, 안전한 force-dynamic으로 복구
export const dynamic = "force-dynamic";

const REPORTERS = [
{ name: "김형식 기자", email: "trendit_news@naver.com" },
{ name: "이정수 기자", email: "trendit_news@naver.com" },
{ name: "김지영 기자", email: "trendit_news@naver.com" },
{ name: "박민수 기자", email: "trendit_news@naver.com" },
{ name: "최유진 기자", email: "trendit_news@naver.com" },
];

function WriteForm() {
const searchParams = useSearchParams();
const id = searchParams.get("id");
const [loading, setLoading] = useState(!!id);

const [title, setTitle] = useState("");
const [summary, setSummary] = useState("");
const [category, setCategory] = useState("AI");
const [importance, setImportance] = useState("normal");
const [content, setContent] = useState("");
const [reporterName, setReporterName] = useState("박상혁 기자");
const [reporterEmail, setReporterEmail] = useState("trendit_news@naver.com");
const [tags, setTags] = useState("");
const [gallery, setGallery] = useState<string[]>([]);
const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");

// 👇 [기존] 예약 발행 여부 상태
const [isReservation, setIsReservation] = useState(false);

// 👇 [신규 추가] 헤드라인 고정 상태 (Pinned)
const [isPinned, setIsPinned] = useState(false);

useEffect(() => {
if (!id) return;
const loadData = async () => {
    try {
    const news = await getNewsById(Number(id));
    if (news) {
        setTitle(news.title);
        setSummary(news.summary || "");
        setCategory(news.category || "AI");
        setImportance(news.importance || "normal");
        setContent(news.content);
        setSelectedThumbnail(news.imageUrl || "");
        setReporterName(news.reporterName || "");
        setReporterEmail(news.reporterEmail || "");
        setTags(news.tags || "");
        
        // 👇 [신규 추가] DB에서 가져온 고정 여부 반영
        // (DB에 isPinned 필드가 없으면 false 처리됨)
        // @ts-ignore (DB 타입 업데이트 전일 경우 에러 방지용)
        setIsPinned(news.isPinned || false);

        const parser = new DOMParser();
        const doc = parser.parseFromString(news.content, "text/html");
        const imgs = doc.querySelectorAll("img");
        const urls: string[] = [];
        imgs.forEach((img) => { if (img.src) urls.push(img.src); });
        setGallery(Array.from(new Set(urls)));
    }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
};
loadData();
}, [id]);

const preventSubmitOnEnter = (e: React.KeyboardEvent) => {
if (e.key === "Enter") e.preventDefault();
};

const handleImageUploaded = (url: string) => {
setGallery((prev) => {
    const newGallery = [url, ...prev];
    if (!selectedThumbnail) setSelectedThumbnail(url);
    return newGallery;
});
};

const handleSetThumbnail = (url: string) => {
setSelectedThumbnail(url);
};

const handleDeleteImage = async (urlToDelete: string) => {
if (!confirm("삭제하시겠습니까?")) return;
const result = await deleteImageAction(urlToDelete);
if (result.success) {
    setGallery((prev) => prev.filter((u) => u !== urlToDelete));
    if (typeof window !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.querySelectorAll(`img[src="${urlToDelete}"]`);
    images.forEach((img) => {
        img.closest('.news-image-container')?.remove() || img.remove();
    });
    setContent(doc.body.innerHTML);
    }
}
};

const handleReporterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
const selected = REPORTERS.find(r => r.name === e.target.value);
if (selected) {
    setReporterName(selected.name);
    setReporterEmail(selected.email);
}
};

if (loading) return <div className="p-10 text-center font-bold text-gray-500">데이터 로딩중...</div>;

return (
// 📱 [반응형] p-6 -> p-4 md:p-6 (모바일 여백 줄임)
<div className="min-h-screen bg-[#F8F9FA] font-sans p-4 md:p-6 flex justify-center">
    {/* 📱 [반응형] flex-col lg:flex-row (모바일: 세로 배치, PC: 가로 배치) */}
    <div className="w-full max-w-[1600px] flex flex-col lg:flex-row gap-6 items-start">
    
    {/* 입력 폼 영역 */}
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
        {/* 📱 [반응형] p-8 -> p-4 md:p-8 */}
        <form action={saveNews} className="p-4 md:p-8">
        <input type="hidden" name="id" value={id || ""} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="thumbnailUrl" value={selectedThumbnail} />
        {/* 👇 [필수] isPinned 값을 서버로 전송하기 위한 hidden input */}
        <input type="hidden" name="isPinned" value={isPinned ? "true" : "false"} />
        
        {/* 📱 [반응형] flex-col md:flex-row (모바일: 세로, PC: 가로) */}
        <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            {/* 📱 [반응형] w-full md:w-16 (모바일: 전체 너비) */}
            <span className="text-sm font-bold text-gray-900 w-full md:w-16">등급</span>
            <div className="flex gap-2 flex-wrap">
            <label className={`px-4 py-2 text-sm rounded-lg cursor-pointer border transition-all ${importance === 'normal' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                <input type="radio" name="importance" value="normal" className="hidden" checked={importance === 'normal'} onChange={()=>setImportance('normal')} />
                일반기사
            </label>
            <label className={`px-4 py-2 text-sm rounded-lg cursor-pointer border transition-all ${importance === 'high' ? 'bg-red-50 border-red-200 text-red-600 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                <input type="radio" name="importance" value="high" className="hidden" checked={importance === 'high'} onChange={()=>setImportance('high')} />
                헤드라인
            </label>

            {/* 👇 [신규 추가] 헤드라인 고정 버튼 */}
            {/* 📱 [반응형] ml-2 -> md:ml-2 (모바일에서 마진 제거) */}
            <label className={`md:ml-2 px-4 py-2 text-sm rounded-lg cursor-pointer border transition-all flex items-center gap-1 ${isPinned ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold shadow-inner' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isPinned} 
                    onChange={(e) => {
                    setIsPinned(e.target.checked);
                    }} 
                />
                <span>📌 헤드라인 고정</span>
            </label>
            </div>
        </div>

        <div className="space-y-5 mb-8">
            {/* 섹션 선택 */}
            {/* 📱 [반응형] flex-col md:flex-row */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">섹션</label>
            <select name="category" value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full md:w-48 p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="AI">AI </option>
                <option value="Tech">테크</option>
                <option value="IT">IT</option>
                <option value="Coin">코인</option>
                <option value="Stock">주식</option>
                <option value="Game">게임</option>
            </select>
            </div>

            {/* 예약 발행 설정 */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">게시 일시</label>
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    checked={isReservation} 
                    onChange={(e) => setIsReservation(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-700">예약 발행 설정</span>
                </label>

                {isReservation && (
                <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
                    <span className="hidden md:inline text-gray-300">|</span>
                    <input 
                    type="datetime-local" 
                    name="publishedAt"
                    step="300"
                    required={isReservation}
                    defaultValue={new Date(Date.now() + 9 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString().slice(0, 16)} 
                    className="p-2 border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-blue-500 w-full md:w-auto"
                    />
                    <p className="text-xs text-blue-600 font-medium w-full md:w-auto">
                    * 설정한 시간에 자동으로 공개됩니다.
                    </p>
                </div>
                )}
                
                {!isReservation && (
                <p className="text-xs text-gray-400 md:ml-2">
                    * 체크하지 않으면 <span className="font-bold text-gray-500">즉시 발행</span>됩니다.
                </p>
                )}
            </div>
            </div>

            {/* 기자 정보 입력 */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">기자</label>
            <div className="flex-1 flex flex-col md:flex-row gap-2 w-full">
                <select onChange={handleReporterSelect} className="w-full md:w-36 p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600 outline-none">
                <option value="">자동선택...</option>
                {REPORTERS.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                </select>
                <input type="text" name="reporterName" value={reporterName} onChange={(e)=>setReporterName(e.target.value)} className="w-full md:w-32 p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="이름" />
                <input type="text" name="reporterEmail" value={reporterEmail} onChange={(e)=>setReporterEmail(e.target.value)} className="flex-1 p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="이메일" />
            </div>
            </div>

            {/* 제목 입력 */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">제목</label>
            <input type="text" name="title" value={title} onChange={(e)=>setTitle(e.target.value)} onKeyDown={preventSubmitOnEnter} className="flex-1 w-full p-2.5 border border-gray-300 rounded text-sm font-bold text-gray-900 outline-none focus:border-blue-500 placeholder-gray-300" placeholder="기사 제목을 입력하세요" />
            </div>

            {/* 부제목 입력 */}
            <div className="flex flex-col md:flex-row items-start gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800 md:pt-2.5">부제목</label>
            <textarea name="summary" value={summary} onChange={(e)=>setSummary(e.target.value)} rows={3} className="flex-1 w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 placeholder-gray-300 resize-none leading-relaxed" placeholder="기사 요약문 (부제목)을 입력하세요." />
            </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
            <NewsEditor value={content} onChange={setContent} onImageUpload={handleImageUploaded} />
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 mb-6">Tip. 본문 내용이 없으면 포털에 반영이 안될 수 있습니다.</p>
            {/* 📱 [반응형] 키워드 영역 */}
            <div className="flex flex-col md:flex-row md:items-center mb-8 gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">키워드</label>
            <input type="text" name="tags" value={tags} onChange={(e)=>setTags(e.target.value)} onKeyDown={preventSubmitOnEnter} className="flex-1 w-full p-3 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 placeholder-gray-300 text-blue-600" placeholder="#태그 입력 (쉼표로 구분)" />
            </div>
            <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white text-lg font-bold py-4 rounded-lg shadow-sm transition-transform active:scale-[0.99]">저장하기</button>
        </div>
        </form>
    </div>

    {/* 사이드바 (라이브러리) */}
    {/* 📱 [반응형] 모바일: w-full / PC: w-[320px], sticky top-6 */}
    <aside className="w-full lg:w-[320px] bg-white rounded-xl shadow-sm border border-gray-200 h-auto lg:h-[85vh] relative lg:sticky lg:top-6 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">🖼️ 라이브러리</span>
        <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{gallery.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin max-h-[300px] lg:max-h-none">
        {/* 📱 [반응형] 모바일: grid-cols-4 (작게 여러개) / PC: grid-cols-2 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2">
            {gallery.length === 0 ? (
            <div className="col-span-full py-10 lg:py-20 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
                <span className="text-2xl mb-2">📷</span>
                <span className="text-xs">이미지 없음</span>
            </div>
            ) : (
            gallery.map((url, idx) => (
                <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedThumbnail === url ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-300'}`} onClick={()=>handleSetThumbnail(url)}>
                <img src={url} className="w-full h-full object-cover" />
                {selectedThumbnail === url && <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm z-10">대표</div>}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={(e)=>{e.stopPropagation(); handleDeleteImage(url);}} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 font-bold">삭제</button>
                </div>
                </div>
            ))
            )}
        </div>
        </div>
    </aside>
    </div>
</div>
);
}

export default function WritePage() {
return (
<Suspense fallback={<div className="p-10 text-center font-bold">로딩중...</div>}>
    <WriteForm />
</Suspense>
);
}