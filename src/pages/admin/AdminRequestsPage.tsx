import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import DataTable, { type Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Drawer from '../../components/admin/Drawer';
import { MOCK_ADMIN_REQUESTS } from '../../data/mockRequests';
import type { AdminRequest, RequestStatus } from '../../types/admin';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>(MOCK_ADMIN_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'has_offers' | 'hidden'>('all');

  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Delete dialog
  const [reqToDelete, setReqToDelete] = useState<AdminRequest | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return r.status === 'active' && r.offerCount === 0;
    if (statusFilter === 'has_offers') return r.status === 'has_offers' || r.offerCount > 0;
    return r.status === statusFilter;
  });

  // Action: Toggle Hide
  const handleToggleHide = (r: AdminRequest) => {
    const nextStatus: RequestStatus = r.status === 'hidden' ? 'active' : 'hidden';
    setRequests((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: nextStatus } : item))
    );
    if (selectedRequest?.id === r.id) {
      setSelectedRequest({ ...selectedRequest, status: nextStatus });
    }
    showToast(
      nextStatus === 'hidden'
        ? `ซ่อนกระทู้ตามหาหนังสือ "${r.bookTitle}" แล้ว`
        : `นำกระทู้ "${r.bookTitle}" กลับมาแสดงผลแล้ว`
    );
  };

  // Action: Delete
  const handleConfirmDelete = (reason?: string) => {
    if (!reqToDelete) return;
    setRequests((prev) => prev.filter((item) => item.id !== reqToDelete.id));
    if (selectedRequest?.id === reqToDelete.id) {
      setIsDrawerOpen(false);
      setSelectedRequest(null);
    }
    showToast(`ลบกระทู้ "${reqToDelete.bookTitle}" เรียบร้อยแล้ว (${reason || 'ไม่มีเหตุผลระบุ'})`);
    setIsDeleteOpen(false);
    setReqToDelete(null);
  };

  const handleOpenDetail = (r: AdminRequest) => {
    setSelectedRequest(r);
    setIsDrawerOpen(true);
  };

  const columns: Column<AdminRequest>[] = [
    {
      key: 'bookTitle',
      header: 'ชื่อหนังสือที่ตามหา',
      sortable: true,
      render: (r) => (
        <div className="min-w-0 max-w-xs">
          <h4
            className="font-medium text-text-main hover:text-accent cursor-pointer truncate"
            onClick={() => handleOpenDetail(r)}
          >
            {r.bookTitle}
          </h4>
          <p className="text-xs text-text-main/50 truncate">ผู้แต่ง: {r.author}</p>
        </div>
      ),
    },
    {
      key: 'requestedBy',
      header: 'ผู้ตั้งกระทู้',
      render: (r) => (
        <div className="flex items-center gap-2 text-xs">
          <img
            src={r.requestedBy.avatarUrl}
            alt={r.requestedBy.name}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-text-main/80 font-medium truncate">{r.requestedBy.name}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'วันที่ตั้ง',
      sortable: true,
      render: (r) => <span className="text-xs text-text-main/60">{r.createdAt}</span>,
    },
    {
      key: 'offerCount',
      header: 'ผู้เสนอแลก',
      sortable: true,
      render: (r) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded ${
            r.offerCount > 0 ? 'bg-accent/15 text-accent' : 'bg-bg-secondary text-text-main/60'
          }`}
        >
          {r.offerCount} ข้อเสนอ
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetail(r)}
            className="px-2.5 py-1 text-xs border border-border-main rounded hover:bg-bg-secondary transition-colors text-text-main/80"
          >
            ดูข้อความ
          </button>

          <button
            onClick={() => handleToggleHide(r)}
            title={r.status === 'hidden' ? 'แสดงกระทู้' : 'ซ่อนกระทู้'}
            className="p-1 text-text-main/60 hover:text-text-main hover:bg-bg-secondary rounded transition-colors"
          >
            {r.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setReqToDelete(r);
              setIsDeleteOpen(true);
            }}
            title="ลบกระทู้"
            className="p-1 text-warning hover:bg-warning/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-text-main text-bg-main px-4 py-3 rounded-md shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-medium text-text-main">
          จัดการบอร์ดตามหาหนังสือ ({requests.length})
        </h2>
        <p className="text-xs text-text-main/60 mt-0.5">
          ตรวจสอบคำขอหนังสือจากสมาชิก ป้องกันการโพสต์สแปม หรือกระทู้ที่ไม่เหมาะสม
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-main pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-accent text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          ทั้งหมด ({requests.length})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-accent text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          ยังไม่มีผู้เสนอ ({requests.filter(r => r.offerCount === 0 && r.status !== 'hidden').length})
        </button>
        <button
          onClick={() => setStatusFilter('has_offers')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            statusFilter === 'has_offers'
              ? 'bg-accent text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          มีผู้เสนอแล้ว ({requests.filter(r => r.offerCount > 0 && r.status !== 'hidden').length})
        </button>
        <button
          onClick={() => setStatusFilter('hidden')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            statusFilter === 'hidden'
              ? 'bg-text-main text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          ถูกซ่อน ({requests.filter(r => r.status === 'hidden').length})
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        keyExtractor={(r) => r.id}
        searchPlaceholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ผู้ตั้งกระทู้..."
        itemsPerPage={10}
      />

      {/* Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedRequest?.bookTitle || 'รายละเอียดคำขอ'}
        subtitle={`ผู้แต่ง: ${selectedRequest?.author}`}
        footer={
          selectedRequest && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  setReqToDelete(selectedRequest);
                  setIsDeleteOpen(true);
                }}
                className="px-3 py-1.5 border border-warning/40 text-warning rounded-md text-xs font-medium hover:bg-warning/10"
              >
                ลบกระทู้
              </button>
              <button
                onClick={() => handleToggleHide(selectedRequest)}
                className="px-4 py-1.5 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90"
              >
                {selectedRequest.status === 'hidden' ? 'ยกเลิกการซ่อน' : 'ซ่อนกระทู้'}
              </button>
            </div>
          )
        }
      >
        {selectedRequest && (
          <div className="flex flex-col gap-6 text-sm">
            {/* Header pill */}
            <div className="flex items-center justify-between p-3.5 bg-bg-secondary/30 rounded-md border border-border-main">
              <span className="text-xs text-text-main/70 font-medium">สถานะกระทู้:</span>
              <StatusBadge status={selectedRequest.status} size="md" />
            </div>

            {/* Poster info */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                ผู้ตั้งกระทู้
              </h4>
              <div className="p-3.5 border border-border-main bg-bg-main rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedRequest.requestedBy.avatarUrl}
                    alt={selectedRequest.requestedBy.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-medium text-text-main">{selectedRequest.requestedBy.name}</p>
                    <p className="text-[11px] text-text-main/50">โพสต์เมื่อ: {selectedRequest.createdAt}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-accent px-2 py-0.5 rounded bg-accent/10">
                  {selectedRequest.offerCount} ข้อเสนอ
                </span>
              </div>
            </div>

            {/* Content text */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                ข้อความประกาศตามหา
              </h4>
              <p className="p-4 bg-bg-secondary/20 rounded-md border border-border-main text-xs text-text-main/80 leading-relaxed whitespace-pre-line">
                {selectedRequest.description}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setReqToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`ยืนยันการลบกระทู้ "${reqToDelete?.bookTitle}"`}
        message="การลบกระทู้จะนำคำขอนี้ออกจากบอร์ดตามหาหนังสืออย่างถาวร กรุณาระบุเหตุผลในการลบ"
        confirmText="ลบกระทู้ถาวร"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="เช่น ข้อความสแปม, เนื้อหาไม่เหมาะสม, ชักชวนเล่นการพนัน..."
      />
    </div>
  );
}
