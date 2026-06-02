import React from 'react'
import './DataTable.css'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className="ds-table-container">
      <table className="ds-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="ds-table-loading">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ds-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={
                  item.id ??
                  item.maTaiKhoan ??
                  item.maChuyenBay ??
                  item.maVe ??
                  index
                }
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
