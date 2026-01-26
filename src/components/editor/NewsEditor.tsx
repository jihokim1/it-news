"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useEffect } from "react";
import "react-quill-new/dist/quill.snow.css";
import { uploadImageAction } from "@/app/(admin)/admin/news/write/actions";

// 👇 [핵심 수정] 한글 깨짐 방지 로직 적용
const ReactQuill = dynamic(async () => {
  const { default: RQ, Quill } = await import("react-quill-new");

  const BlockEmbed = Quill.import("blots/block/embed") as any;

  class ImageCaptionBlot extends BlockEmbed {
    static create(value: string | { url: string; caption: string }) {
      const node = super.create();
      node.setAttribute("class", "news-image-container");

      // 데이터가 객체로 올 수도 있고 문자열(URL만)로 올 수도 있음 처리
      const src = typeof value === 'object' ? value.url : value;
      const captionText = typeof value === 'object' ? value.caption : "";

      const img = document.createElement("img");
      img.setAttribute("src", src);
      img.setAttribute("alt", "news-image");
      
      const caption = document.createElement("input");
      caption.setAttribute("class", "news-caption");
      caption.setAttribute("placeholder", "▲ 사진 설명을 입력하세요 (출처 등)");
      caption.setAttribute("type", "text");
      // 초기값 설정
      caption.value = captionText;
      caption.setAttribute("value", captionText);
      
      // 👇 [핵심 처방 1] 이벤트 전파를 막아서 Quill이 간섭하지 못하게 함
      const stopPropagation = (e: Event) => { e.stopPropagation(); };
      
      caption.addEventListener("mousedown", stopPropagation);
      caption.addEventListener("click", stopPropagation);
      
      // 👇 [핵심 처방 2] 키보드 입력 시 Quill의 단축키나 동작 차단
      caption.addEventListener("keydown", (e: KeyboardEvent) => {
          e.stopPropagation(); 
          // 엔터키 누르면 줄바꿈 대신 그냥 포커스 아웃되거나 유지
          if (e.key === 'Enter') {
            e.preventDefault();
            caption.blur(); // 엔터치면 입력 완료로 처리
          }
      });

      // 복사/붙여넣기 허용하되 Quill로 전파 차단
      caption.addEventListener("copy", stopPropagation);
      caption.addEventListener("cut", stopPropagation);
      caption.addEventListener("paste", stopPropagation);

      // 👇 [핵심 처방 3] 'input' 대신 'blur' 사용 (한글 자모 분리 해결)
      // 글자를 쓰는 도중에는 DOM을 건드리지 않고, 다 쓰고 나갈 때 value 속성에 박음
      caption.addEventListener("blur", (e: any) => {
          caption.setAttribute("value", e.target.value);
      });
      
      // 혹시라도 React 상태 관리를 위해 change 이벤트도 추가 (한글 완성 후)
      caption.addEventListener("change", (e: any) => {
          caption.setAttribute("value", e.target.value);
      });

      node.appendChild(img);
      node.appendChild(caption);
      return node;
    }

    static value(node: HTMLElement) {
      const img = node.querySelector("img");
      const caption = node.querySelector(".news-caption") as HTMLInputElement;
      
      // 저장할 때: 이미지 URL과 캡션 내용을 묶어서 내보냄 (사실상 HTML 파싱이 우선됨)
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

        // 이미지 삽입 (캡션은 빈 상태로 시작)
        quill.insertEmbed(index, "imageCaption", { url: publicUrl, caption: "" });
        
        // 커서를 이미지 다음으로 강제 이동
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
        /* 툴바 스타일 */
        .ql-container.ql-snow { border: none !important; }
        .ql-toolbar.ql-snow { 
            border: none !important; 
            border-bottom: 1px solid #e5e7eb !important;
            position: sticky; top: 0; z-index: 10; background: white;
        }
        
        /* 에디터 본문 */
        .ql-editor {
            min-height: 800px;
            overflow: visible !important;
            padding: 40px 20px !important;
            max-width: 720px; 
            margin: 0 auto; 
            font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
            font-size: 12px;
            line-height: 1.8;
            color: #374151;
        }

        /* 이미지 컨테이너 (틀어짐 방지) */
        .news-image-container {
            display: table; 
            width: 100%; /* 너비 100% 강제 */
            max-width: 100%;
            margin: 40px 0; /* 위아래 여백 */
            clear: both;
        }

        .news-image-container img {
            display: block;
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: 8px 8px 0 0;
            border: 1px solid #e5e7eb;
            border-bottom: none;
        }

        /* 캡션 입력창 스타일 강화 */
        input.news-caption {
            display: block;
            width: 100% !important; /* 너비 강제 */
            box-sizing: border-box; /* 패딩 포함 너비 계산 */
            background-color: #f8f9fa;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            padding: 12px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            outline: none;
            text-align: center;
            margin: 0;
            line-height: 1.5;
        }
        
        input.news-caption:focus { 
            background-color: #fff; 
            border-color: #3b82f6; 
            color: #111827;
        }
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