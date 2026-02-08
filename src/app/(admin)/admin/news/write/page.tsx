"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation"; 
import { saveNews, deleteImageAction, getNewsById, uploadImageAction } from "@/app/(admin)/admin/news/write/actions";
import dynamicLoader from "next/dynamic";
// 🟢 [추가됨] 이미지 압축 및 WebP 변환을 위한 라이브러리
import imageCompression from "browser-image-compression";

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

// 파일 업로드용 Ref
const fileInputRef = useRef<HTMLInputElement>(null);

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

// 👇 예약 발행 여부 상태
const [isReservation, setIsReservation] = useState(false);

// 👇 헤드라인 고정 상태 (Pinned)
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
        
        // @ts-ignore
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

// 🟢 [추가됨] 이미지를 WebP로 압축해서 업로드하는 핵심 함수
const handleCompressAndUpload = async (file: File) => {
try {
    // 1. 압축 옵션 설정 (WebP 변환, 최대 너비 1200px, 품질 자동 조절)
    const options = {
    maxSizeMB: 0.5, // 0.5MB 이하로 줄이기 (SEO & 속도 최적화)
    maxWidthOrHeight: 1200, // 너비 1200px로 리사이징
    useWebWorker: true,
    fileType: "image/webp" // 🟢 강제로 WebP로 변환 (용량 절약)
    };

    // 2. 브라우저에서 압축 진행
    const compressedFile = await imageCompression(file, options);
    
    // 3. 파일명도 .webp로 변경 (한글 파일명 문제 원천 차단)
    const safeName = `news_${Date.now()}.webp`; 
    const finalFile = new File([compressedFile], safeName, { type: "image/webp" });

    // 4. 서버로 업로드 (기존 로직 재활용)
    const formData = new FormData();
    formData.append("file", finalFile);
    
    const result = await uploadImageAction(formData);
    if (result.success && result.url) {
    handleImageUploaded(result.url);
    } else {
    alert("이미지 업로드 실패: " + result.error);
    }
} catch (error) {
    console.error("이미지 압축 실패:", error);
    alert("이미지 변환 중 오류가 발생했습니다.");
}
};

const handleImageUploaded = (url: string) => {
setGallery((prev) => [url, ...prev]);
setSelectedThumbnail((prev) => (prev ? prev : url));
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

// 플로팅 버튼 클릭 -> 🟢 [수정됨] 에디터 버튼이 아니라 우리가 만든 숨겨진 input을 클릭하게 변경
const triggerEditorImageButton = () => {
fileInputRef.current?.click();
};

// 🟢 [추가됨] 파일 선택 시 실행되는 함수 (압축 후 업로드)
const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files && e.target.files[0]) {
    await handleCompressAndUpload(e.target.files[0]);
}
// 입력창 초기화 (같은 파일 다시 선택 가능하게)
e.target.value = ""; 
};

if (loading) return <div className="p-10 text-center font-bold text-gray-500">데이터 로딩중...</div>;

return (
<div className="min-h-screen bg-[#F8F9FA] font-sans p-4 md:p-6 flex justify-center relative">
    
    {/* 🟢 [추가됨] 숨겨진 파일 입력창 (압축 업로드용) */}
    <input 
    type="file" 
    ref={fileInputRef} 
    onChange={onFileChange} 
    accept="image/*" 
    className="hidden" 
    />

    {/* 우측 하단 플로팅 사진 추가 버튼 */}
    <button 
    type="button"
    onClick={triggerEditorImageButton}
    className="fixed bottom-10 right-10 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center gap-2"
    title="사진 바로 추가 (자동 WebP 변환)"
    >
    <span className="text-2xl">📷</span>
    <span className="font-bold hidden md:inline">사진 추가</span>
    </button>

    <div className="w-full max-w-[1600px] flex flex-col lg:flex-row gap-6 items-start">
    
    {/* 입력 폼 영역 */}
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
        <form action={saveNews} className="p-4 md:p-8">
        <input type="hidden" name="id" value={id || ""} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="thumbnailUrl" value={selectedThumbnail} />
        <input type="hidden" name="isPinned" value={isPinned ? "true" : "false"} />
        
        <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
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

            {/* 🟢 [수정됨] 예약 발행 설정 UI (토글 스위치 + 디자인된 입력창) */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">게시 일시</label>
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full h-10">
                
                {/* 토글 스위치 */}
                <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                    type="checkbox" 
                    checked={isReservation} 
                    onChange={(e) => setIsReservation(e.target.checked)} 
                    className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-bold text-gray-700">
                    {isReservation ? "예약 발행 ON" : "즉시 발행"}
                    </span>
                </label>
                </div>

                {/* 날짜 입력창 (토글 ON일 때만 등장) */}
                {isReservation && (
                <div className="flex items-center gap-2 animate-fadeInLeft transition-all duration-300">
                    <span className="hidden md:inline text-gray-300 mx-2">|</span>
                    <div className="relative">
                    {/* 달력 아이콘 */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <input 
                        type="datetime-local" 
                        name="publishedAt"
                        step="60" // 1분 단위
                        required={isReservation}
                        defaultValue={new Date(Date.now() + 9 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString().slice(0, 16)} 
                        className="pl-10 pr-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm"
                    />
                    </div>
                    <p className="text-xs text-blue-600 font-medium whitespace-nowrap hidden lg:block">
                    * 설정된 시간에 자동으로 공개됩니다.
                    </p>
                </div>
                )}
            </div>
            </div>

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

            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">제목</label>
            <input type="text" name="title" value={title} onChange={(e)=>setTitle(e.target.value)} onKeyDown={preventSubmitOnEnter} className="flex-1 w-full p-2.5 border border-gray-300 rounded text-sm font-bold text-gray-900 outline-none focus:border-blue-500 placeholder-gray-300" placeholder="기사 제목을 입력하세요" />
            </div>

            <div className="flex flex-col md:flex-row items-start gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800 md:pt-2.5">부제목</label>
            <textarea name="summary" value={summary} onChange={(e)=>setSummary(e.target.value)} rows={3} className="flex-1 w-full p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 placeholder-gray-300 resize-none leading-relaxed" placeholder="기사 요약문 (부제목)을 입력하세요." />
            </div>
        </div>

        <style jsx global>{`
            .ql-toolbar {
            position: sticky !important;
            top: 0;
            z-index: 40;
            background: white;
            border-bottom: 1px solid #e5e7eb;
            }
            @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
            }
            .animate-fadeInLeft {
            animation: fadeInLeft 0.3s ease-out forwards;
            }
        `}</style>

        <div className="border-t border-gray-100 pt-6">
            {/* 🟢 [수정됨] onImageUpload 함수를 직접 전달하여 에디터 내부의 이미지 추가 로직과 연결 */}
            <NewsEditor value={content} onChange={setContent} onImageUpload={handleImageUploaded} />
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400 mb-6">Tip. 본문 내용이 없으면 포털에 반영이 안될 수 있습니다.</p>
            <div className="flex flex-col md:flex-row md:items-center mb-8 gap-2 md:gap-0">
            <label className="w-full md:w-24 text-sm font-bold text-gray-800">키워드</label>
            <input type="text" name="tags" value={tags} onChange={(e)=>setTags(e.target.value)} onKeyDown={preventSubmitOnEnter} className="flex-1 w-full p-3 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 placeholder-gray-300 text-blue-600" placeholder="#태그 입력 (쉼표로 구분)" />
            </div>
            <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white text-lg font-bold py-4 rounded-lg shadow-sm transition-transform active:scale-[0.99]">저장하기</button>
        </div>
        </form>
    </div>

    <aside className="w-full lg:w-[320px] bg-white rounded-xl shadow-sm border border-gray-200 h-auto lg:h-[85vh] relative lg:sticky lg:top-6 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">🖼️ 라이브러리</span>
        <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{gallery.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin max-h-[300px] lg:max-h-none">
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