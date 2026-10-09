import { useState } from 'react';
import {
  Truck,
  ExternalLink,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import DataTable, { type Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Drawer from '../../components/admin/Drawer';
import { MOCK_ADMIN_SWAPS } from '../../data/mockSwaps';
import type { AdminSwap } from '../../types/admin';

const STEP_LABELS = ['ส่งคำขอ', 'ตอบรับ', 'กำลังจัดส่ง', 'ได้รับหนังสือ'];

export default function AdminSwapsPage() {
  const [swaps, setSwaps] = useState<AdminSwap[]>(MOCK_ADMIN_SWAPS);
  const [selectedSwap, setSelectedSwap] = useState<AdminSwap | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');

  // Cancel Dialog
  const [swapToCancel, setSwapToCancel] = useState<AdminSwap | null>(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Dispute Dialog
  const [swapToDispute, setSwapToDispute] = useState<AdminSwap | null>(null);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered
  const filteredSwaps = swaps.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (courierFilter !== 'all' && s.courier !== courierFilter) return false;
    return true;
  });

  const handleOpenDetail = (s: AdminSwap) => {
    setSelectedSwap(s);
    setIsDrawerOpen(true);
  };

  // Action: Cancel
  const handleConfirmCancel = (reason?: string) => {
    if (!swapToCancel) return;
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapToCancel.id ? { ...s, status: 'cancelled', notes: reason || 'แอดมินยกเลิกรายการ' } : s
      )
    );
    if (selectedSwap?.id === swapToCancel.id) {
      setSelectedSwap({ ...selectedSwap, status: 'cancelled' });
    }
    showToast(`ยกเลิกรายการแลกเปลี่ยน "${swapToCancel.code}" เรียบร้อยแล้ว`);
    setIsCancelOpen(false);
    setSwapToCancel(null);
  };

  // Action: Dispute
  const handleConfirmDispute = (reason?: string) => {
    if (!swapToDispute) return;
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapToDispute.id
          ? { ...s, status: 'disputed', disputeReason: reason || 'พบข้อพิพาท' }
          : s
      )
    );
    if (selectedSwap?.id === swapToDispute.id) {
      setSelectedSwap({ ...selectedSwap, status: 'disputed', disputeReason: reason });
    }
    showToast(`ทำเครื่องหมายข้อพิพาทในรายการ "${swapToDispute.code}" เรียบร้อยแล้ว`);
    setIsDisputeOpen(false);
    setSwapToDispute(null);
  };

  // Columns definition
  const columns: Column<AdminSwap>[] = [
    {
      key: 'code',
      header: 'รหัสรายการ',
      sortable: true,
      render: (s) => (
        <span
          className="font-mono font-semibold text-xs text-text-main hover:text-accent cursor-pointer"
          onClick={() => handleOpenDetail(s)}
        >
          {s.code}
        </span>
      ),
    },
    {
      key: 'books',
      header: 'คู่หนังสือที่แลกเปลี่ยน',
      render: (s) => (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
            <img
              src={s.book1.coverUrl}
              alt={s.book1.title}
              className="w-7 h-10 object-cover rounded border border-border-main"
            />
            <img
              src={s.book2.coverUrl}
              alt={s.book2.title}
              className="w-7 h-10 object-cover rounded border border-border-main"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-text-main truncate max-w-[150px]">{s.book1.title}</p>
            <p className="text-[11px] text-text-main/50 truncate max-w-[150px]">⇄ {s.book2.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'users',
      header: 'คู่สมาชิก',
      render: (s) => (
        <div className="text-xs text-text-main/80">
          <p className="truncate max-w-[120px] font-medium">{s.user1.name}</p>
          <p className="text-[11px] text-text-main/50 truncate max-w-[120px]">และ {s.user2.name}</p>
        </div>
      ),
    },
    {
      key: 'step',
      header: 'ขั้นตอนการแลก (4 ขั้นตอน)',
      render: (s) => (
        <div className="flex flex-col gap-1 w-36">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 flex-1 rounded-full ${
                  s.status === 'cancelled'
                    ? 'bg-text-main/20'
                    : s.status === 'disputed'
                    ? 'bg-warning'
                    : stepNum <= s.step
                    ? 'bg-accent'
                    : 'bg-bg-secondary'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-text-main/60">
            ขั้นที่ {s.step}/4: {STEP_LABELS[s.step - 1]}
          </span>
        </div>
      ),
    },
    {
      key: 'courier',
      header: 'ขนส่ง / พัสดุ',
      render: (s) => (
        <div className="text-xs">
          <div className="flex items-center gap-1 font-medium text-text-main/80">
            <Truck className="w-3.5 h-3.5 text-text-main/40" />
            <span>{s.courier}</span>
          </div>
          {s.trackingNumber ? (
            <a
              href={s.trackingUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono mt-0.5"
            >
              <span>{s.trackingNumber}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="text-[11px] text-text-main/40">ยังไม่ระบุเลข</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetail(s)}
            className="px-2.5 py-1 text-xs border border-border-main rounded hover:bg-bg-secondary transition-colors text-text-main/80"
          >
            ดูไทม์ไลน์
          </button>

          {s.status !== 'cancelled' && s.status !== 'completed' && (
            <>
              {s.status !== 'disputed' && (
                <button
                  onClick={() => {
                    setSwapToDispute(s);
                    setIsDisputeOpen(true);
                  }}
                  title="ทำเครื่องหมายมีข้อพิพาท"
                  className="p-1 text-warning hover:bg-warning/10 rounded transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setSwapToCancel(s);
                  setIsCancelOpen(true);
                }}
                title="ยกเลิกรายการแลกเปลี่ยน"
                className="p-1 text-text-main/40 hover:text-warning hover:bg-warning/10 rounded transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
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
          รายการแลกเปลี่ยนหนังสือ ({swaps.length})
        </h2>
        <p className="text-xs text-text-main/60 mt-0.5">
          ติดตามพัสดุ ตรวจสอบขั้นตอนการแลกเปลี่ยน 4 ขั้นตอน และดูแลข้อพิพาทระหว่างคู่แลก
        </p>
      </div>

      {/* Filter Slots for DataTable */}
      <DataTable
        columns={columns}
        data={filteredSwaps}
        keyExtractor={(s) => s.id}
        searchPlaceholder="ค้นหารหัสรายการ, ชื่อหนังสือ, ชื่อสมาชิก..."
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-main border border-border-main rounded-md px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-accent"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="pending">รอตอบรับ</option>
              <option value="shipping">กำลังจัดส่ง</option>
              <option value="completed">แลกสำเร็จ</option>
              <option value="disputed">มีข้อพิพาท</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
            </select>

            {/* Courier Select */}
            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="bg-bg-main border border-border-main rounded-md px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-accent"
            >
              <option value="all">ขนส่งทั้งหมด</option>
              <option value="Flash Express">Flash Express</option>
              <option value="Thailand Post">Thailand Post (EMS)</option>
              <option value="Kerry Express">Kerry Express</option>
              <option value="J&T Express">J&T Express</option>
            </select>
          </div>
        }
        itemsPerPage={10}
      />

      {/* Detail & Timeline Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`รายการแลกเปลี่ยน: ${selectedSwap?.code}`}
        subtitle={`สร้างเมื่อ ${selectedSwap?.createdAt}`}
        footer={
          selectedSwap && (
            <div className="flex items-center justify-between w-full">
              {selectedSwap.status !== 'cancelled' && selectedSwap.status !== 'completed' && (
                <button
                  onClick={() => {
                    setSwapToCancel(selectedSwap);
                    setIsCancelOpen(true);
                  }}
                  className="px-3 py-1.5 border border-warning/40 text-warning rounded-md text-xs font-medium hover:bg-warning/10"
                >
                  ยกเลิกรายการนี้
                </button>
              )}
              {selectedSwap.trackingUrl && (
                <a
                  href={selectedSwap.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90 inline-flex items-center gap-1.5 ml-auto"
                >
                  <span>เปิดเว็บติดตามพัสดุ ({selectedSwap.courier})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )
        }
      >
        {selectedSwap && (
          <div className="flex flex-col gap-6 text-sm font-sans">
            {/* Status and dispute alert */}
            <div className="flex items-center justify-between p-3.5 bg-bg-secondary/30 rounded-md border border-border-main">
              <span className="text-xs text-text-main/70 font-medium">สถานะปัจจุบัน:</span>
              <StatusBadge status={selectedSwap.status} size="md" />
            </div>

            {selectedSwap.disputeReason && (
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-md flex items-start gap-3 text-warning">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-medium text-sm">รายละเอียดข้อพิพาท</h4>
                  <p className="text-xs mt-1 text-text-main/80 leading-relaxed">
                    {selectedSwap.disputeReason}
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Progress */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-3">
                ขั้นตอนการแลกเปลี่ยน
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {STEP_LABELS.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isDone = stepNum <= selectedSwap.step;
                  const isCurrent = stepNum === selectedSwap.step;
                  return (
                    <div
                      key={label}
                      className={`p-2.5 rounded-md border text-center flex flex-col items-center gap-1 ${
                        isCurrent
                          ? 'border-accent bg-accent/10 text-accent font-semibold'
                          : isDone
                          ? 'border-border-main bg-bg-secondary/40 text-text-main'
                          : 'border-border-main/50 text-text-main/30'
                      }`}
                    >
                      <span className="text-xs font-mono">{stepNum}</span>
                      <span className="text-[11px] leading-tight">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Books Paired Card */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-3">
                หนังสือที่แลกเปลี่ยนกัน
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md border border-border-main bg-bg-main flex flex-col gap-2">
                  <span className="text-[10px] text-text-main/50 uppercase">หนังสือฝั่งที่ 1</span>
                  <img
                    src={selectedSwap.book1.coverUrl}
                    alt={selectedSwap.book1.title}
                    className="w-full h-28 object-cover rounded border border-border-main"
                  />
                  <div>
                    <h5 className="font-medium text-xs text-text-main truncate">
                      {selectedSwap.book1.title}
                    </h5>
                    <p className="text-[11px] text-text-main/60 truncate">{selectedSwap.book1.author}</p>
                    <p className="text-[11px] text-accent mt-1">ผู้ส่ง: {selectedSwap.user1.name}</p>
                  </div>
                </div>

                <div className="p-3 rounded-md border border-border-main bg-bg-main flex flex-col gap-2">
                  <span className="text-[10px] text-text-main/50 uppercase">หนังสือฝั่งที่ 2</span>
                  <img
                    src={selectedSwap.book2.coverUrl}
                    alt={selectedSwap.book2.title}
                    className="w-full h-28 object-cover rounded border border-border-main"
                  />
                  <div>
                    <h5 className="font-medium text-xs text-text-main truncate">
                      {selectedSwap.book2.title}
                    </h5>
                    <p className="text-[11px] text-text-main/60 truncate">{selectedSwap.book2.author}</p>
                    <p className="text-[11px] text-accent mt-1">ผู้ส่ง: {selectedSwap.user2.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Courier & Tracking Proof */}
            <div className="p-4 border border-border-main rounded-md bg-bg-secondary/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-main/50">บริษัทขนส่ง</span>
                  <p className="text-sm font-medium text-text-main">{selectedSwap.courier}</p>
                </div>
                <div>
                  <span className="text-xs text-text-main/50">เลขพัสดุ</span>
                  <p className="text-sm font-mono font-semibold text-accent">
                    {selectedSwap.trackingNumber || 'รอแจ้งเลข'}
                  </p>
                </div>
              </div>

              {selectedSwap.shippingProofUrl && (
                <div>
                  <span className="text-[11px] text-text-main/60 mb-1.5 block">ภาพหลักฐานการส่งพัสดุ:</span>
                  <img
                    src={selectedSwap.shippingProofUrl}
                    alt="หลักฐานการจัดส่ง"
                    className="w-full h-36 object-cover rounded-md border border-border-main"
                  />
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-3">
                ประวัติไทม์ไลน์
              </h4>
              <div className="relative pl-5 border-l-2 border-border-main space-y-4">
                {selectedSwap.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-bg-main ${
                        item.done ? 'border-accent bg-accent' : 'border-border-main'
                      }`}
                    />
                    <p className={`text-xs font-medium ${item.done ? 'text-text-main' : 'text-text-main/40'}`}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-text-main/50 mt-0.5">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSwapToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title={`ยืนยันการยกเลิกรายการ "${swapToCancel?.code}"`}
        message="การยกเลิกรายการจะยุติการแลกเปลี่ยน และแจ้งเตือนไปยังคู่แลกทั้งสองฝ่าย กรุณาระบุเหตุผลในการยกเลิก"
        confirmText="ยกเลิกรายการแลกเปลี่ยน"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="เช่น พัสดุสูญหาย, ทั้งสองฝ่ายตกลงขอยกเลิก..."
      />

      {/* Dispute Confirmation */}
      <ConfirmDialog
        isOpen={isDisputeOpen}
        onClose={() => {
          setIsDisputeOpen(false);
          setSwapToDispute(null);
        }}
        onConfirm={handleConfirmDispute}
        title={`เปิดข้อพิพาทในรายการ "${swapToDispute?.code}"`}
        message="การเปิดข้อพิพาทจะหยุดเวลาการทำรายการชั่วคราวเพื่อให้แอดมินเข้าตรวจสอบข้อเท็จจริง กรุณาระบุรายละเอียดข้อพิพาท"
        confirmText="ยืนยันการเปิดข้อพิพาท"
        variant="warning"
        requireReason={true}
        reasonPlaceholder="เช่น ฝ่ายหนึ่งไม่ได้รับพัสดุ, หนังสือชำรุดเสียหายหนัก..."
      />
    </div>
  );
}
