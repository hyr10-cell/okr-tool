import React from 'react';

export interface TableColumn<T> {
  header: string;
  key: keyof T | string;
  render?: (row: T, value: any) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  actions?: (row: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  actions,
  emptyMessage = '데이터가 없습니다.',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">작업</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((col) => {
                const value = typeof col.key === 'string' ? row[col.key] : row[col.key];
                return (
                  <td key={String(col.key)} className="px-6 py-4 text-sm text-gray-900">
                    {col.render ? col.render(row, value) : String(value ?? '-')}
                  </td>
                );
              })}
              {actions && (
                <td className="px-6 py-4 text-sm">
                  {actions(row, index)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
