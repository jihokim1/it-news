"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useEffect } from "react";
import "react-quill-new/dist/quill.snow.css";
import { uploadImageAction } from "@/app/(admin)/admin/news/write/actions";

// 👇 [핵심] 서버 에러 방지용 dynamic import + Blot 정의
const ReactQuill = dynamic(async () => {
  const { default: RQ, Quill } = await import("react-quill-new");

  const BlockEmbed = Quill.import("blots/block/embed") as any;

  // 🖼️ 이미지+캡션 커스텀 블록 (삭제 잠금 기능 포함)
  class ImageCaptionBlot extends BlockEmbed {
    static create(value: string) {
      const node = super.create();
      node.setAttribute("contenteditable", "false"); // 박스 잠금
      node.setAttribute("class", "news-image-container");

      const img = document.createElement("img");
      img.setAttribute("src", value);
      img.setAttribute("alt", "news-image");
      
      const caption = document.createElement("div");
      caption.setAttribute("class", "news-caption");
      caption.setAttribute("contenteditable", "true"); 
      caption.innerText = "사진 출처를 입력하세요";
      
      // 이벤트 전파 차단
      caption.addEventListener("keydown", (e: Event) => { e.stopPropagation(); });
      caption.addEventListener("click", (e: Event) => { e.stopPropagation(); });

      node.appendChild(img);
      node.appendChild(caption);
      return node;
    }

    static value(node: HTMLElement) {
      const img = node.querySelector("img");
      return img ? img.getAttribute("src") : null;
    }
  }

  ImageCaptionBlot.blotName = "imageCaption"; 
  ImageCaptionBlot.tagName = "div";           
  Quill.register(ImageCaptionBlot);

  // ref 전달 해결
  return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
}, { ssr: false });


interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  onImageUpload: (url: string) => void;
}

export default function NewsEditor({ value, onChange, onImageUpload }: EditorProps) {
  const quillRef = useRef<any>(null);

  // 👇 [삭제 방지 로직]
  useEffect(() => {
    const timer = setTimeout(() => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        quill.root.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Backspace' || event.key === 'Delete') {
                const selection = document.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const anchorNode = selection.anchorNode;
                const isInsideCaption = (anchorNode as HTMLElement)?.closest?.('.news-caption') || 
                                        anchorNode?.parentElement?.closest?.('.news-caption');

                if (!isInsideCaption) {
                    const range = quill.getSelection();
                    if (range) {
                        const [blot] = quill.getLeaf(range.index);
                        const blotName = blot?.parent?.statics?.blotName || blot?.statics?.blotName;
                        if (blotName === "imageCaption") {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
        });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        const publicUrl = await uploadImageAction(formData);
        onImageUpload(publicUrl);

        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();

        quill.insertEmbed(index, "imageCaption", publicUrl, "user");
        setTimeout(() => { quill.setSelection(index + 1, 0, "user"); }, 50);
      } catch (e) {
        console.error(e);
        alert("업로드 실패");
      }
    };
  };

  const modules = useMemo(() => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
        ],
        handlers: { image: imageHandler },
      },
    }), []);

  return (
    <div className="mb-12 bg-white flex flex-col h-full">
      {/* 👇 [핵심] 실제 뉴스 기사 뷰와 똑같이 만드는 CSS */}
      <style jsx global>{`
        /* 툴바 스타일 */
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { 
            border: none !important; 
            border-bottom: 1px solid #e5e7eb !important;
            position: sticky;
            top: 0;
            z-index: 10;
            background: white;
        }
        
        /* 에디터 내부 스크롤 허용 */
        .ql-container { 
            height: auto !important; 
            overflow: visible !important;
            flex-grow: 1;
        }
        
        /* 🔥 [여기가 진짜입니다] 실제 기사처럼 보이는 본문 스타일 */
        .ql-editor {
            min-height: 800px;
            overflow: visible !important;
            padding: 40px 20px !important; /* 위아래 40, 좌우 20 (모바일 대응) */
            
            /* 실제 기사처럼 가운데 정렬 & 폭 제한 */
            max-width: 720px; 
            margin: 0 auto; 
            
            /* 폰트 & 가독성 */
            font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", sans-serif;
            font-size: 17px;
            line-height: 1.8;
            color: #374151; /* 진한 회색 (눈 편안함) */
            letter-spacing: -0.02em;
        }

        /* 제목이나 헤더 스타일 */
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
            font-weight: 800;
            margin-top: 2em;
            margin-bottom: 0.5em;
            color: #111827;
        }

        /* 이미지 컨테이너 */
        .news-image-container {
            display: table;
            width: fit-content;
            max-width: 100%;
            margin: 40px auto; /* 이미지 위아래 여백 */
            user-select: none;
        }

        .news-image-container img {
            display: block;
            width: auto;
            max-width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            border: 1px solid #e5e7eb;
            border-bottom: none;
        }

        /* 캡션 박스 */
        .news-caption {
            display: block;
            width: 100%;
            box-sizing: border-box;
            background-color: #f8f9fa;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 10px 12px;
            color: #6b7280;
            font-size: 13px;
            font-weight: 500;
            outline: none;
            user-select: text;
            cursor: text;
            text-align: left;
            word-break: break-all;
        }
        
        .news-caption:focus { background-color: #f3f4f6; }
      `}</style>

      <ReactQuill
        forwardedRef={quillRef} 
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
      />
    </div>
  );
}