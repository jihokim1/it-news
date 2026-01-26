"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useEffect } from "react";
import "react-quill-new/dist/quill.snow.css";
import { uploadImageAction } from "@/app/(admin)/admin/news/write/actions";

// 👇 [핵심 수정 1] ReactQuill 로딩 방식 및 커스텀 Blot 재설계
const ReactQuill = dynamic(async () => {
  const { default: RQ, Quill } = await import("react-quill-new");

  const BlockEmbed = Quill.import("blots/block/embed") as any;

  class ImageCaptionBlot extends BlockEmbed {
    static create(value: string) {
      const node = super.create();
      // ⭐ 핵심: contenteditable="false"를 굳이 명시하지 않음 (Quill이 알아서 함)
      node.setAttribute("class", "news-image-container");

      const img = document.createElement("img");
      img.setAttribute("src", value);
      img.setAttribute("alt", "news-image");
      
      const caption = document.createElement("input"); // ⭐ div 대신 input 사용 (가장 확실함)
      caption.setAttribute("class", "news-caption");
      caption.setAttribute("placeholder", "▲ 사진 설명을 입력하세요 (출처 등)");
      caption.setAttribute("type", "text");
      
      // ⭐ 핵심: 이벤트 버블링을 아주 강력하게 차단
      // Quill이 "어? 여기서 키보드 눌렀네? 내가 처리해야지" 하는 걸 원천 봉쇄
      const stopEvent = (e: Event) => { e.stopPropagation(); };
      
      caption.addEventListener("mousedown", stopEvent);
      caption.addEventListener("click", stopEvent);
      caption.addEventListener("keydown", (e: KeyboardEvent) => {
          e.stopPropagation(); 
          // 엔터 키 눌렀을 때 줄바꿈 방지하고 그냥 입력 유지
          if(e.key === 'Enter') e.preventDefault();
      });
      // 붙여넣기 허용
      caption.addEventListener("paste", stopEvent); 
      caption.addEventListener("copy", stopEvent);
      caption.addEventListener("cut", stopEvent);

      // 입력값 저장 (HTML로 변환될 때 value 속성에 박히도록)
      caption.addEventListener("input", (e: any) => {
          caption.setAttribute("value", e.target.value);
      });

      node.appendChild(img);
      node.appendChild(caption);
      return node;
    }

    static value(node: HTMLElement) {
      const img = node.querySelector("img");
      const caption = node.querySelector(".news-caption") as HTMLInputElement;
      
      // 데이터를 저장할 때는 JSON 객체로 저장하는 게 좋지만, 
      // 현재 구조상 이미지 URL만 리턴하고 캡션 내용은 HTML 자체에 박혀있게 둠
      return {
          url: img ? img.getAttribute("src") : null,
          caption: caption ? caption.value : ""
      };
    }
  }

  ImageCaptionBlot.blotName = "imageCaption"; 
  ImageCaptionBlot.tagName = "div";           
  Quill.register(ImageCaptionBlot);

  return ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
}, { ssr: false });

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  onImageUpload: (url: string) => void;
}

export default function NewsEditor({ value, onChange, onImageUpload }: EditorProps) {
  const quillRef = useRef<any>(null);

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

        // 커서 위치에 이미지 삽입
        quill.insertEmbed(index, "imageCaption", publicUrl);
        // 이미지 바로 뒤로 커서 이동
        setTimeout(() => { quill.setSelection(index + 1); }, 50);
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
      <style jsx global>{`
        /* ... (기존 스타일 유지) ... */
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { 
            border: none !important; 
            border-bottom: 1px solid #e5e7eb !important;
            position: sticky; top: 0; z-index: 10; background: white;
        }
        .ql-container { height: auto !important; overflow: visible !important; flex-grow: 1; }
        
        .ql-editor {
            min-height: 800px;
            overflow: visible !important;
            padding: 40px 20px !important;
            max-width: 720px; 
            margin: 0 auto; 
            font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
            font-size: 17px;
            line-height: 1.8;
            color: #374151;
        }

        /* 제목 스타일 */
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
            font-weight: 800; margin-top: 2em; margin-bottom: 0.5em; color: #111827;
        }

        /* 이미지 컨테이너 */
        .news-image-container {
            display: table; /* 중앙 정렬 유지 */
            width: fit-content;
            max-width: 100%;
            margin: 40px auto; 
            text-align: center;
        }

        .news-image-container img {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            border: 1px solid #e5e7eb;
            border-bottom: none;
        }

        /* 캡션 입력창 (Input으로 변경됨) */
        input.news-caption {
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
            text-align: center; /* 가운데 정렬 */
            margin: 0;
        }
        
        input.news-caption:focus { background-color: #fff; border-color: #3b82f6; }
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