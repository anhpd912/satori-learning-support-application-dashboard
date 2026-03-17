import { redirect } from 'next/navigation';

export default function TeacherHomepage() {
    // Tạm thời redirect sang my-classes hoặc hiển thị trang chủ trống
    redirect('/my-classes');
}
