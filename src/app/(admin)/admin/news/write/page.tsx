"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
import { saveNews, deleteImageAction, getNewsById } from "@/app/(admin)/admin/news/write/actions";
import NewsEditor from "@/components/editor/NewsEditor";

const REPORTERS = [
{ name: "IT뉴스", email: "webmaster@indinews.co.kr" },
{ name: "이정수 기자", email: "indisnews1@gmail.com" },
{ name: "김지영 기자", email: "ji_young@indisnews.com" },
{ name: "박민수 기자", email: "min_park@indisnews.com" },
{ name: "최유진 기자", email: "yujin_choi@indisnews.com" },
];

export default function WritePage() {
const searchParams = useSearchParams();
const id = searchParams.get("id");
const [loading, setLoading] = useState(!!id);

// 데이터 상태
const [title, setTitle] = useState("");
const [summary, setSummary] = useState("");
const [category, setCategory] = useState("AI");
const [importance, setImportance] = useState("normal");
const [content, setContent] = useState("");

const [reporterName, setReporterName] = useState("IT뉴스");
const [reporterEmail, setReporterEmail] = useState("webmaster@indinews.co.kr");

const [tags, setTags] = useState("");
const [gallery, setGallery] = useState<string[]>([]);
const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");

const preventSubmitOnEnter = (e: React.KeyboardEvent) => {
if (e.key === "Enter") e.preventDefault();
};

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
        setReporterName(news.reporterName || "인디뉴스");
        setReporterEmail(news.reporterEmail || "");
        setTags(news.tags || "");

        const parser = new DOMParser();
        const doc = parser.parseFromString(news.content, "text/html");
        const imgs = doc.querySelectorAll("img");
        const urls: string[] = [];
        imgs.forEach((img) => { if (img.src) urls.push(img.src); });
        setGallery(Array.from(new Set(urls)));
    }
    } catch (e) {
    console.error(e);
    } finally {
    setLoading(false);
    }
};
loadData();
}, [id]);

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

if (loading) return <div className="p-10 text-center font-bold text-gray-500">데이터 불러오는 중...</div>;

return (
// 🔥 [핵심] 배경을 회색(bg-[#F8F9FA])으로 깔아서 흰색 박스들이 떠 보이게 만듦
<div className="min-h-screen bg-[#F8F9FA] font-sans p-6 flex justify-center">
    
    <div className="w-full max-w-[1600px] flex gap-6 items-start">
    
    {/* ================= 왼쪽: 기사 작성 카드 ================= */}
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form action={saveNews} className="p-8">
            <input type="hidden" name="id" value={id || ""} />
            <input type="hidden" name="content" value={content} />
            <input type="hidden" name="thumbnailUrl" value={selectedThumbnail} />
            
            {/* 1. 등급 (깔끔한 라디오 버튼) */}
            <div className="border-b border-gray-100 pb-6 mb-8 flex items-center gap-6">
                <span className="text-sm font-bold text-gray-900 w-16">등급</span>
                <div className="flex gap-2">
                    <label className={`px-4 py-2 text-sm rounded-lg cursor-pointer border transition-all ${importance === 'normal' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <input type="radio" name="importance" value="normal" className="hidden" checked={importance === 'normal'} onChange={()=>setImportance('normal')} />
                        일반기사
                    </label>
                    <label className={`px-4 py-2 text-sm rounded-lg cursor-pointer border transition-all ${importance === 'high' ? 'bg-red-50 border-red-200 text-red-600 font-bold' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        <input type="radio" name="importance" value="high" className="hidden" checked={importance === 'high'} onChange={()=>setImportance('high')} />
                        헤드라인
                    </label>
                </div>
            </div>

            {/* 2. 입력 필드들 (테이블 스타일) */}
            <div className="space-y-5 mb-8">
                {/* 섹션 */}
                <div className="flex items-center">
                    <label className="w-24 text-sm font-bold text-gray-800">섹션</label>
                    <select name="category" value={category} onChange={(e)=>setCategory(e.target.value)} className="w-48 p-2.5 bg-white border border-gray-300 rounded text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="AI">AI / 인공지능</option>
                        <option value="Tech">테크 / 기기</option>
                        <option value="Business">IT 기업</option>
                        <option value="Coin">코인</option>
                        <option value="Stock">주식</option>
                        <option value="Game">게임</option>
                    </select>
                </div>

                {/* 기자 */}
                <div className="flex items-center">
                    <label className="w-24 text-sm font-bold text-gray-800">기자</label>
                    <div className="flex-1 flex gap-2">
                        <select onChange={handleReporterSelect} className="w-36 p-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-gray-600 outline-none">
                            <option value="">자동선택...</option>
                            {REPORTERS.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                        </select>
                        <input type="text" name="reporterName" value={reporterName} onChange={(e)=>setReporterName(e.target.value)} className="w-32 p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="이름" />
                        <input type="text" name="reporterEmail" value={reporterEmail} onChange={(e)=>setReporterEmail(e.target.value)} className="flex-1 max-w-sm p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" placeholder="이메일" />
                    </div>
                </div>

                {/* 제목 */}
                <div className="flex items-center">
                    <label className="w-24 text-sm font-bold text-gray-800">제목</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={title} 
                        onChange={(e)=>setTitle(e.target.value)} 
                        onKeyDown={preventSubmitOnEnter}
                        className="flex-1 p-2.5 border border-gray-300 rounded text-sm font-bold text-gray-900 outline-none focus:border-blue-500 placeholder-gray-300" 
                        placeholder="기사 제목을 입력하세요" 
                    />
                </div>

                {/* 부제목 */}
                <div className="flex items-start">
                    <label className="w-24 text-sm font-bold text-gray-800 pt-2.5">부제목</label>
                    <textarea 
                        name="summary" 
                        value={summary}
                        onChange={(e)=>setSummary(e.target.value)}
                        rows={3}
                        className="flex-1 p-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 placeholder-gray-300 resize-none leading-relaxed" 
                        placeholder="기사 요약문 (부제목)을 입력하세요."
                    />
                </div>
            </div>

            {/* 3. 에디터 */}
            <div className="border-t border-gray-100 pt-6">
                <NewsEditor value={content} onChange={setContent} onImageUpload={handleImageUploaded} />
            </div>

            {/* 4. 하단 (안내문구 + 태그 + 저장) */}
            <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400 mb-6">Tip. 본문 내용이 없으면 포털에 반영이 안될 수 있습니다.</p>
                
                <div className="flex items-center mb-8">
                    <label className="w-24 text-sm font-bold text-gray-800">키워드</label>
                    <input 
                        type="text" 
                        name="tags" 
                        value={tags}
                        onChange={(e)=>setTags(e.target.value)}
                        onKeyDown={preventSubmitOnEnter}
                        className="flex-1 p-3 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 placeholder-gray-300 text-blue-600"
                        placeholder="#태그 입력 (쉼표로 구분)" 
                    />
                </div>

                <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white text-lg font-bold py-4 rounded-lg shadow-sm transition-transform active:scale-[0.99]">
                    저장하기
                </button>
            </div>
        </form>
    </div>


    {/* ================= 오른쪽: 라이브러리 사이드바 (별도 카드로 분리) ================= */}
    <aside className="w-[320px] bg-white rounded-xl shadow-sm border border-gray-200 h-[85vh] sticky top-6 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                🖼️ 라이브러리
            </span>
            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {gallery.length}
            </span>
        </div>

        {/* 갤러리 영역 */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="grid grid-cols-2 gap-2">
                {gallery.length === 0 ? (
                    <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
                        <span className="text-2xl mb-2">📷</span>
                        <span className="text-xs">이미지 없음</span>
                    </div>
                ) : (
                    gallery.map((url, idx) => (
                        <div 
                            key={idx} 
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedThumbnail === url ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-300'}`} 
                            onClick={()=>handleSetThumbnail(url)}
                        >
                            <img src={url} className="w-full h-full object-cover" />
                            {selectedThumbnail === url && (
                                <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm z-10">
                                    대표
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button type="button" onClick={(e)=>{e.stopPropagation(); handleDeleteImage(url);}} className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 font-bold">
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {gallery.length > 0 && (
                <p className="text-[10px] text-gray-400 text-center mt-4">
                    이미지를 클릭하면<br/>대표(썸네일) 사진으로 지정됩니다.
                </p>
            )}
        </div>
        
        {/* 하단 장식 (소셜 아이콘 등 - 껍데기지만 비주얼용) */}
        <div className="p-4 border-t border-gray-100 text-center">
                <div className="flex justify-center gap-2 opacity-30 grayscale">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
        </div>
    </aside>

    </div>
</div>
);
}