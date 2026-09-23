import React, { useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TableRow = React.memo(({ row, columns, onRowClick, onHover }) => {
  return (
    <tr 
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      onMouseEnter={onHover ? () => onHover(row) : undefined}
      className={`border-b border-[var(--table-border)] transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''} hover:bg-[var(--table-row-hover)]`}
    >
      {columns.map((col, index) => (
        <td key={col.key || index} className="px-3 py-2.5 text-sm text-[var(--text-primary)]">
          {col.render ? col.render(row) : row[col.key]}
        </td>
      ))}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowHoverPrefetch,
  sortConfig,
  onSort
}) => {
  const handleSort = (key) => {
    if (onSort) onSort(key);
  };

  const handleHover = useCallback((row) => {
    if (rowHoverPrefetch) rowHoverPrefetch(row);
  }, [rowHoverPrefetch]);

  return (
    <div className="w-full overflow-x-auto border border-[var(--table-border)] rounded-md">
      <table className="w-full text-left border-collapse bg-[var(--bg-card)]">
        <thead className="bg-[var(--table-header)] text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--table-border)]">
          <tr>
            {columns.map((col, index) => (
              <th 
                key={col.key || index} 
                className={`px-3 py-2.5 ${col.sortable ? 'cursor-pointer hover:text-[var(--text-primary)]' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortConfig?.key === col.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--table-border)]">
                {columns.map((col, colI) => (
                  <td key={colI} className="px-3 py-2.5">
                    <div className="h-4 bg-[var(--border)] rounded animate-pulse w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-[var(--text-secondary)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <TableRow 
                key={row.id || i}
                row={row}
                columns={columns}
                onRowClick={onRowClick}
                onHover={rowHoverPrefetch ? handleHover : undefined}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
