'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  // Tính toán số hiển thị (Ví dụ: 1 đến 5)
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Hàm tạo danh sách số trang
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === i
            ? 'bg-[#253A8C] text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white  border-t-0 rounded-b-xl">

      {/* Thông tin bên trái */}
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-medium text-gray-900">{startItem}</span> đến{' '}
        <span className="font-medium text-gray-900">{endItem}</span> trong số{' '}
        <span className="font-medium text-gray-900">{totalItems}</span>
      </div>

      {/* Các nút bấm bên phải */}
      <div className="flex items-center gap-2">
        {/* Nút Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.32026 0.820312L1.64058 3.5L4.32026 6.17969L3.49995 7L-4.86374e-05 3.5L3.49995 0L4.32026 0.820312Z" fill="#111418" />
          </svg>

        </button>

        {/* Danh sách số trang */}
        <div className="flex gap-2">
          {renderPageNumbers()}
        </div>

        {/* Nút Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.820264 0L4.32026 3.5L0.820264 7L-4.86374e-05 6.17969L2.67964 3.5L-4.86374e-05 0.820312L0.820264 0Z" fill="#111418" />
          </svg>

        </button>
      </div>
    </div>
  );
}