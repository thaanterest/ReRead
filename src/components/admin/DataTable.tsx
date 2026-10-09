import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Inbox, Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  filterSlot?: ReactNode;
  actionSlot?: ReactNode;
  itemsPerPage?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
  searchFilter?: (item: T, query: string) => boolean;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = 'ค้นหาข้อมูล...',
  searchQuery,
  onSearchChange,
  filterSlot,
  actionSlot,
  itemsPerPage = 10,
  isLoading = false,
  emptyMessage = 'ไม่พบข้อมูลที่ตรงกับเงื่อนไข',
  emptySubMessage = 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง',
  searchFilter,
}: DataTableProps<T>) {
  // Internal search state if uncontrolled
  const [internalSearch, setInternalSearch] = useState('');
  const activeSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  // Sorting state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase().trim();
      if (searchFilter) {
        result = result.filter(item => searchFilter(item, q));
      } else {
        result = result.filter(item => {
          return Object.values(item as Record<string, unknown>).some(val => {
            if (val === null || val === undefined) return false;
            if (typeof val === 'string' || typeof val === 'number') {
              return String(val).toLowerCase().includes(q);
            }
            return false;
          });
        });
      }
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a as Record<string, unknown>)[sortKey];
        const valB = (b as Record<string, unknown>)[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB), 'th')
          : String(valB).localeCompare(String(valA), 'th');
      });
    }

    return result;
  }, [data, activeSearch, sortKey, sortOrder, searchFilter]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={activeSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-bg-main border border-border-main rounded-md pl-9 pr-3 py-2 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-main/40"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-main/40" />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {filterSlot}
          {actionSlot}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-bg-main border border-border-main rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm font-sans">
            <thead>
              <tr className="border-b border-border-main bg-bg-secondary/40 text-text-main/70 uppercase text-xs tracking-wider">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`py-3.5 px-4 font-medium ${col.headerClassName || ''} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-text-main' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-text-main/40">
                          {sortKey === col.key ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border-main/50">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-text-main/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-accent" />
                      <span>กำลังโหลดข้อมูล...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-text-main/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center text-text-main/40 mb-1">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="font-heading font-medium text-base text-text-main">{emptyMessage}</p>
                      <p className="text-xs text-text-main/50 max-w-sm">{emptySubMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className="hover:bg-bg-secondary/30 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3.5 px-4 text-text-main ${col.className || ''}`}>
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        {!isLoading && processedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border-main bg-bg-secondary/20 text-xs text-text-main/70">
            <div>
              แสดง{' '}
              <span className="font-medium text-text-main">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              ถึง{' '}
              <span className="font-medium text-text-main">
                {Math.min(currentPage * itemsPerPage, processedData.length)}
              </span>{' '}
              จากทั้งหมด{' '}
              <span className="font-medium text-text-main">{processedData.length}</span> รายการ
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="หน้าก่อนหน้า"
                className="p-1.5 rounded border border-border-main disabled:opacity-30 hover:bg-bg-secondary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 font-medium">
                หน้า {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="หน้าถัดไป"
                className="p-1.5 rounded border border-border-main disabled:opacity-30 hover:bg-bg-secondary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
