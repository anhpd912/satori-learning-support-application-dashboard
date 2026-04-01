import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface CommonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function CommonTable<T,>({ 
    data, 
    columns, 
    keyExtractor, 
    isLoading,
    onRowClick,
    className = ''
}: CommonTableProps<T>) {
  
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không có dữ liệu.</div>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-6 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={keyExtractor(item)} 
                onClick={() => onRowClick && onRowClick(item)}
                className={`hover:bg-gray-50 transition ${onRowClick ? 'cursor-pointer' : ''}`}>
              {columns.map((col, index) => (
                <td key={index} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.render 
                    ? col.render(item) 
                    : col.accessor ? (item[col.accessor] as React.ReactNode) : null
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}