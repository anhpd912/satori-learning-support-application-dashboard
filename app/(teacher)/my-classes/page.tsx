import MyClassesList from '@/features/classes/components/MyClassesList';

export const metadata = {
    title: 'Lớp học của tôi | Satori Dashboard',
    description: 'Quản lý danh sách các lớp học được phân công giảng dạy',
};

export default function MyClassesPage() {
    return <MyClassesList />;
}