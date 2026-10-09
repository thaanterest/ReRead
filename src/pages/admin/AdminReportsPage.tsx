import { useState } from 'react';
import {
  CheckCircle2,
  Ban,
  EyeOff,
  Save,
} from 'lucide-react';
import DataTable, { type Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Drawer from '../../components/admin/Drawer';
import { MOCK_ADMIN_REPORTS } from '../../data/mockReports';
import type { AdminReport, ReportStatus } from '../../types/admin';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>(MOCK_ADMIN_REPORTS);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Internal note editing
  const [editingNote, setEditingNote] = useState<string>('');

  // Quick Action Dialogs
  const [suspendDialogUser, setSuspendDialogUser] = useState<string | null>(null);
  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);

  const [hideBookDialogTitle, setHideBookDialogTitle] = useState<string | null>(null);
  const [isHideBookConfirmOpen, setIsHideBookConfirmOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const handleOpenDetail = (r: AdminReport) => {
    setSelectedReport(r);
    setEditingNote(r.internalNote || '');
    setIsDrawerOpen(true);
  };

  // Action: Change report status
  const handleChangeStatus = (reportId: string, nextStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r))
    );
    if (selectedReport?.id === reportId) {
      setSelectedReport({ ...selectedReport, status: nextStatus });
    }
    showToast(`อัปเดตสถานะข้อร้องเรียนเป็น "${nextStatus}" เรียบร้อยแล้ว`);
  };

  // Action: Save Internal Note
  const handleSaveNote = () => {
    if (!selectedReport) return;
    setReports((prev) =>
      prev.map((r) => (r.id === selectedReport.id ? { ...r, internalNote: editingNote } : r))
    );
    setSelectedReport({ ...selectedReport, internalNote: editingNote });
    showToast('บันทึกโน้ตภายในของแอดมินเรียบร้อยแล้ว');
  };

  // Action: Suspend Reported User
  const handleConfirmSuspendUser = (reason?: string) => {
    if (!suspendDialogUser) return;
    showToast(`ส่งคำสั่งระงับบัญชี "${suspendDialogUser}" เรียบร้อยแล้ว (${reason || 'มีข้อร้องเรียน'})`);
    setIsSuspendConfirmOpen(false);
    setSuspendDialogUser(null);
  };

  // Action: Hide Reported Book
  const handleConfirmHideBook = () => {
    if (!hideBookDialogTitle) return;
    showToast(`ซ่อนหนังสือ "${hideBookDialogTitle}" จากหน้าร้านเรียบร้อยแล้ว`);
    setIsHideBookConfirmOpen(false);
    setHideBookDialogTitle(null);
  };

  const columns: Column<AdminReport>[] = [
    {
      key: 'type',
      header: 'ประเภทข้อร้องเรียน',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
          <span
            className="font-medium text-text-main hover:text-accent cursor-pointer truncate text-xs"
            onClick={() => handleOpenDetail(r)}
          >
            {r.type}
          </span>
        </div>
      ),
    },
    {
      key: 'reporter',
      header: 'ผู้รายงาน',
      render: (r) => (
        <div className="text-xs">
          <p className="font-medium text-text-main truncate max-w-[120px]">{r.reporter.name}</p>
          <p className="text-[11px] text-text-main/50 truncate max-w-[120px]">{r.reporter.email}</p>
        </div>
      ),
    },
    {
      key: 'reportedUser',
      header: 'ผู้ถูกรายงาน',
      render: (r) => (
        <div className="text-xs">
          {r.reportedUser ? (
            <>
              <p className="font-medium text-warning truncate max-w-[120px]">{r.reportedUser.name}</p>
              <p className="text-[11px] text-text-main/50 truncate max-w-[120px]">{r.reportedUser.email}</p>
            </>
          ) : (
            <span className="text-text-main/40">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'วันที่แจ้ง',
      sortable: true,
      render: (r) => <span className="text-xs text-text-main/60">{r.createdAt}</span>,
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
        <button
          onClick={() => handleOpenDetail(r)}
          className="px-2.5 py-1 text-xs border border-border-main rounded hover:bg-bg-secondary transition-colors text-text-main/80"
        >
          ตรวจสอบ
        </button>
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
          รายงานและข้อร้องเรียน ({reports.length})
        </h2>
        <p className="text-xs text-text-main/60 mt-0.5">
          ตรวจสอบพฤติกรรมที่ไม่เหมาะสม หนังสือไม่ตรงปก หรือปัญหาการจัดส่งพัสดุ
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
          ทั้งหมด ({reports.length})
        </button>
        <button
          onClick={() => setStatusFilter('new')}
          className={`px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1.5 ${
            statusFilter === 'new'
              ? 'bg-warning text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          <span>มาใหม่ ({reports.filter(r => r.status === 'new').length})</span>
          {reports.filter(r => r.status === 'new').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setStatusFilter('investigating')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            statusFilter === 'investigating'
              ? 'bg-warning/80 text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          กำลังตรวจสอบ ({reports.filter(r => r.status === 'investigating').length})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded font-medium transition-colors ${
            statusFilter === 'resolved'
              ? 'bg-accent text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          ปิดเรื่องแล้ว ({reports.filter(r => r.status === 'resolved').length})
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredReports}
        keyExtractor={(r) => r.id}
        searchPlaceholder="ค้นหาประเภท, ชื่อผู้รายงาน, ผู้ถูกร้องเรียน..."
        itemsPerPage={10}
      />

      {/* Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`ข้อร้องเรียน: ${selectedReport?.type}`}
        subtitle={`แจ้งเมื่อ ${selectedReport?.createdAt}`}
        footer={
          selectedReport && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                {selectedReport.reportedUser && (
                  <button
                    onClick={() => {
                      setSuspendDialogUser(selectedReport.reportedUser?.name || null);
                      setIsSuspendConfirmOpen(true);
                    }}
                    className="px-2.5 py-1.5 border border-warning/40 text-warning rounded-md text-xs font-medium hover:bg-warning/10 inline-flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>ระงับผู้ใช้นี้</span>
                  </button>
                )}
                {selectedReport.reportedBook && (
                  <button
                    onClick={() => {
                      setHideBookDialogTitle(selectedReport.reportedBook?.title || null);
                      setIsHideBookConfirmOpen(true);
                    }}
                    className="px-2.5 py-1.5 border border-border-main text-text-main rounded-md text-xs font-medium hover:bg-bg-secondary inline-flex items-center gap-1"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>ซ่อนหนังสือ</span>
                  </button>
                )}
              </div>

              {/* Status switcher */}
              <div className="flex items-center gap-1.5">
                {selectedReport.status !== 'resolved' ? (
                  <button
                    onClick={() => handleChangeStatus(selectedReport.id, 'resolved')}
                    className="px-3.5 py-1.5 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90"
                  >
                    ปิดเรื่อง (แก้ไขแล้ว)
                  </button>
                ) : (
                  <button
                    onClick={() => handleChangeStatus(selectedReport.id, 'investigating')}
                    className="px-3.5 py-1.5 border border-border-main rounded-md text-xs font-medium hover:bg-bg-secondary"
                  >
                    เปิดตรวจสอบใหม่
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedReport && (
          <div className="flex flex-col gap-6 text-sm">
            {/* Status & Type */}
            <div className="flex items-center justify-between p-3.5 bg-bg-secondary/30 rounded-md border border-border-main">
              <div>
                <span className="text-[11px] text-text-main/50">ประเภทปัญหา</span>
                <p className="font-heading font-medium text-sm text-text-main">{selectedReport.type}</p>
              </div>
              <StatusBadge status={selectedReport.status} size="md" />
            </div>

            {/* Parties Involved */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-border-main rounded-md bg-bg-main">
                <span className="text-[10px] text-text-main/50 uppercase">ผู้ส่งรายงาน</span>
                <p className="font-medium text-xs text-text-main mt-1">{selectedReport.reporter.name}</p>
                <p className="text-[11px] text-text-main/50">{selectedReport.reporter.email}</p>
              </div>

              <div className="p-3 border border-border-main rounded-md bg-bg-main">
                <span className="text-[10px] text-warning uppercase">ผู้ถูกร้องเรียน</span>
                {selectedReport.reportedUser ? (
                  <>
                    <p className="font-medium text-xs text-warning mt-1">
                      {selectedReport.reportedUser.name}
                    </p>
                    <p className="text-[11px] text-text-main/50">{selectedReport.reportedUser.email}</p>
                  </>
                ) : (
                  <p className="text-xs text-text-main/40 mt-1">ไม่ระบุบุคคล</p>
                )}
              </div>
            </div>

            {/* Description Text */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                คำอธิบายข้อร้องเรียนจากผู้ใช้
              </h4>
              <p className="p-4 bg-bg-secondary/20 rounded-md border border-border-main text-xs text-text-main/80 leading-relaxed whitespace-pre-line">
                "{selectedReport.description}"
              </p>
            </div>

            {/* Evidence Image */}
            {selectedReport.evidenceUrl && (
              <div>
                <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                  หลักฐานภาพถ่ายที่แนบมา
                </h4>
                <div className="rounded-md border border-border-main overflow-hidden bg-bg-secondary">
                  <img
                    src={selectedReport.evidenceUrl}
                    alt="หลักฐานข้อร้องเรียน"
                    className="w-full h-44 object-cover"
                  />
                </div>
              </div>
            )}

            {/* Internal Admin Note */}
            <div className="p-4 border border-dashed border-border-main rounded-md bg-bg-main flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text-main">
                  บันทึกโน้ตภายในสำหรับแอดมิน (Internal Notes)
                </label>
                <button
                  onClick={handleSaveNote}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกโน้ต</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="พิมพ์บันทึกการตรวจสอบ ผลการติดต่อผู้ใช้ หรือขั้นตอนการแก้ไข..."
                className="w-full text-xs p-2.5 bg-bg-secondary/30 border border-border-main rounded focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Suspend Confirmation */}
      <ConfirmDialog
        isOpen={isSuspendConfirmOpen}
        onClose={() => {
          setIsSuspendConfirmOpen(false);
          setSuspendDialogUser(null);
        }}
        onConfirm={handleConfirmSuspendUser}
        title={`ระงับบัญชี "${suspendDialogUser}" จากข้อร้องเรียนนี้`}
        message="การระงับบัญชีจะหยุดการทำธุรกรรมและการใช้งานของผู้ใช้รายนี้ในระบบทันที คุณสามารถปลดระงับได้ในหน้าจัดการผู้ใช้"
        confirmText="ระงับบัญชีผู้ใช้"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="ระบุเหตุผลในการระงับบัญชี..."
      />

      {/* Hide Book Confirmation */}
      <ConfirmDialog
        isOpen={isHideBookConfirmOpen}
        onClose={() => {
          setIsHideBookConfirmOpen(false);
          setHideBookDialogTitle(null);
        }}
        onConfirm={handleConfirmHideBook}
        title={`ซ่อนหนังสือ "${hideBookDialogTitle}"`}
        message="หนังสือเล่มนี้จะไม่แสดงบนหน้าร้านค้าและหน้าค้นหาจนกว่าจะได้รับการตรวจสอบและปลดซ่อน"
        confirmText="ซ่อนหนังสือ"
        variant="warning"
      />
    </div>
  );
}
