"use client"; // 👈 클라이언트 기능(confirm)을 쓰기 위해 필수

import { ComponentProps } from "react";

interface Props {
id: number;
deleteAction: (formData: FormData) => Promise<void>;
}

export default function DeleteNewsButton({ id, deleteAction }: Props) {
return (
<form
    action={deleteAction}
    onSubmit={(e) => {
    // 👇 여기서 확인 창을 띄웁니다. 취소 누르면 실행 막음(preventDefault)
    if (!confirm("진짜 삭제할꾸얌><? 뿌잉뿌잉)")) {
        e.preventDefault();
    }
    }}
>
    <input type="hidden" name="id" value={id} />
    <button className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">
    삭제
    </button>
</form>
);
}