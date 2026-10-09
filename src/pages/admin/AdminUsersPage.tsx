import { useState } from 'react';
import {
  Shield,
  Coins,
  Ban,
  CheckCircle2,
  Repeat,
  Star,
  MapPin,
  Calendar,
} from 'lucide-react';
import DataTable, { type Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Drawer from '../../components/admin/Drawer';
import Modal from '../../components/admin/Modal';
import { MOCK_ADMIN_USERS } from '../../data/mockUsers';
import type { AdminUser } from '../../types/admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Suspend/Unsuspend Dialog State
  const [userToToggleStatus, setUserToToggleStatus] = useState<AdminUser | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Points Modal State
  const [userToEditPoints, setUserToEditPoints] = useState<AdminUser | null>(null);
  const [pointsDelta, setPointsDelta] = useState<string>('50');
  const [pointsReason, setPointsReason] = useState<string>('');
  const [pointsError, setPointsError] = useState<string>('');
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'all') return true;
    return u.status === statusFilter;
  });

  // Action: Open Drawer
  const handleViewUser = (u: AdminUser) => {
    setSelectedUser(u);
    setIsDrawerOpen(true);
  };

  // Action: Confirm Suspend / Unsuspend
  const handleInitiateToggleStatus = (u: AdminUser) => {
    if (u.role === 'admin') return; // Cannot suspend admin!
    setUserToToggleStatus(u);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggleStatus = (reason?: string) => {
    if (!userToToggleStatus) return;

    const newStatus = userToToggleStatus.status === 'active' ? 'suspended' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userToToggleStatus.id ? { ...u, status: newStatus } : u))
    );

    // If currently viewed in drawer, update it too
    if (selectedUser?.id === userToToggleStatus.id) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }

    showToast(
      newStatus === 'suspended'
        ? `ระงับบัญชีของ "${userToToggleStatus.name}" เรียบร้อยแล้ว (${reason || 'ไม่มีเหตุผลระบุ'})`
        : `ปลดระงับบัญชีของ "${userToToggleStatus.name}" เรียบร้อยแล้ว`
    );

    setIsConfirmOpen(false);
    setUserToToggleStatus(null);
  };

  // Action: Edit Points
  const handleOpenEditPoints = (u: AdminUser) => {
    setUserToEditPoints(u);
    setPointsDelta('50');
    setPointsReason('รางวัลกิจกรรมชุมชนนักอ่าน');
    setPointsError('');
    setIsPointsModalOpen(true);
  };

  const handleSavePoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEditPoints) return;

    const num = parseInt(pointsDelta, 10);
    if (isNaN(num)) {
      setPointsError('กรุณากรอกจำนวนแต้มเป็นตัวเลข');
      return;
    }
    if (!pointsReason.trim()) {
      setPointsError('กรุณาระบุเหตุผลในการปรับแต้ม');
      return;
    }

    const updatedPoints = Math.max(0, userToEditPoints.points + num);
    setUsers((prev) =>
      prev.map((u) => (u.id === userToEditPoints.id ? { ...u, points: updatedPoints } : u))
    );

    if (selectedUser?.id === userToEditPoints.id) {
      setSelectedUser({ ...selectedUser, points: updatedPoints });
    }

    showToast(`ปรับแต้มของ "${userToEditPoints.name}" สำเร็จ (ยอดใหม่: ${updatedPoints} แต้ม)`);
    setIsPointsModalOpen(false);
    setUserToEditPoints(null);
  };

  // Columns definition
  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'ผู้ใช้งาน',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={u.avatarUrl}
              alt={u.name}
              className="w-9 h-9 rounded-full object-cover border border-border-main bg-bg-secondary"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200';
              }}
            />
            {u.role === 'admin' && (
              <span
                title="ผู้ดูแลระบบ"
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent text-bg-main flex items-center justify-center text-[10px]"
              >
                <Shield className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-text-main hover:text-accent cursor-pointer" onClick={() => handleViewUser(u)}>
                {u.name}
              </span>
              {u.role === 'admin' && (
                <span className="text-[10px] bg-accent/15 text-accent border border-accent/30 rounded px-1 font-semibold">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-text-main/50">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'ที่ตั้ง',
      sortable: true,
      render: (u) => (
        <span className="text-xs text-text-main/70 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-text-main/40" />
          {u.location}
        </span>
      ),
    },
    {
      key: 'points',
      header: 'แต้มสะสม',
      sortable: true,
      render: (u) => (
        <span className="font-heading font-medium text-accent">
          {u.points.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'คะแนนรีวิว',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
          <span className="font-medium">{u.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: 'successfulSwaps',
      header: 'แลกสำเร็จ',
      sortable: true,
      render: (u) => (
        <span className="text-xs text-text-main/80 font-medium">
          {u.successfulSwaps} ครั้ง
        </span>
      ),
    },
    {
      key: 'status',
      header: 'สถานะ',
      sortable: true,
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleViewUser(u)}
            className="px-2.5 py-1 text-xs border border-border-main rounded hover:bg-bg-secondary transition-colors text-text-main/80"
          >
            ดูข้อมูล
          </button>

          <button
            onClick={() => handleOpenEditPoints(u)}
            title="ปรับแต้มสะสม"
            className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
          >
            <Coins className="w-4 h-4" />
          </button>

          {u.role === 'admin' ? (
            <span
              title="ไม่สามารถระงับบัญชีผู้ดูแลระบบได้"
              className="p-1 text-text-main/20 cursor-not-allowed"
            >
              <Ban className="w-4 h-4" />
            </span>
          ) : (
            <button
              onClick={() => handleInitiateToggleStatus(u)}
              title={u.status === 'active' ? 'ระงับบัญชีผู้ใช้' : 'ปลดการระงับบัญชี'}
              className={`p-1 rounded transition-colors ${
                u.status === 'active'
                  ? 'text-warning hover:bg-warning/10'
                  : 'text-accent hover:bg-accent/10'
              }`}
            >
              {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-text-main text-bg-main px-4 py-3 rounded-md shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-medium text-text-main">
            รายชื่อผู้ใช้งานในระบบ ({users.length})
          </h2>
          <p className="text-xs text-text-main/60 mt-0.5">
            จัดการข้อมูลผู้ใช้ ตรวจสอบแต้มสะสม และควบคุมความปลอดภัยของชุมชน
          </p>
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 p-1 bg-bg-secondary/60 rounded-md border border-border-main text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-bg-main text-text-main shadow-xs font-semibold' : 'text-text-main/60 hover:text-text-main'
            }`}
          >
            ทั้งหมด ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              statusFilter === 'active' ? 'bg-bg-main text-accent shadow-xs font-semibold' : 'text-text-main/60 hover:text-text-main'
            }`}
          >
            ปกติ ({users.filter(u => u.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              statusFilter === 'suspended' ? 'bg-bg-main text-warning shadow-xs font-semibold' : 'text-text-main/60 hover:text-text-main'
            }`}
          >
            ถูกระงับ ({users.filter(u => u.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        searchPlaceholder="ค้นหาชื่อ, อีเมล, จังหวัด..."
        itemsPerPage={10}
      />

      {/* User Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser?.name || 'รายละเอียดผู้ใช้'}
        subtitle={`รหัสผู้ใช้: ${selectedUser?.id}`}
        footer={
          selectedUser && (
            <div className="flex items-center justify-between w-full">
              {selectedUser.role !== 'admin' ? (
                <button
                  onClick={() => {
                    handleInitiateToggleStatus(selectedUser);
                    setIsDrawerOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    selectedUser.status === 'active'
                      ? 'border-warning/40 text-warning hover:bg-warning/10'
                      : 'border-accent/40 text-accent hover:bg-accent/10'
                  }`}
                >
                  {selectedUser.status === 'active' ? 'ระงับบัญชีผู้ใช้นี้' : 'ปลดการระงับบัญชี'}
                </button>
              ) : (
                <span className="text-xs text-text-main/40">บัญชีผู้ดูแลระบบ (ป้องกันการระงับ)</span>
              )}
              <button
                onClick={() => {
                  handleOpenEditPoints(selectedUser);
                  setIsDrawerOpen(false);
                }}
                className="px-3.5 py-1.5 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                ปรับแต้มสะสม
              </button>
            </div>
          )
        }
      >
        {selectedUser && (
          <div className="flex flex-col gap-6 text-sm">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-md bg-bg-secondary/40 border border-border-main">
              <img
                src={selectedUser.avatarUrl}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full object-cover border border-border-main"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-medium text-lg text-text-main truncate">
                    {selectedUser.name}
                  </h3>
                  <StatusBadge status={selectedUser.status} size="sm" />
                </div>
                <p className="text-xs text-text-main/60">{selectedUser.email}</p>
                <div className="flex items-center gap-3 text-xs text-text-main/60 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedUser.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> เข้าร่วม {selectedUser.joinedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedUser.bio && (
              <div>
                <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-1.5">
                  คำแนะนำตัว (Bio)
                </h4>
                <p className="p-3 bg-bg-secondary/20 rounded-md border border-border-main/60 text-xs text-text-main/80 leading-relaxed">
                  "{selectedUser.bio}"
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                สถิติกิจกรรมในระบบ
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-md border border-border-main bg-bg-main text-center">
                  <span className="text-[11px] text-text-main/60">แต้มสะสม</span>
                  <p className="font-heading text-xl font-medium text-accent mt-0.5">
                    {selectedUser.points}
                  </p>
                </div>
                <div className="p-3 rounded-md border border-border-main bg-bg-main text-center">
                  <span className="text-[11px] text-text-main/60">คะแนนรีวิว</span>
                  <p className="font-heading text-xl font-medium text-warning mt-0.5 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-warning" />
                    {selectedUser.rating.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 rounded-md border border-border-main bg-bg-main text-center">
                  <span className="text-[11px] text-text-main/60">แลกสำเร็จ</span>
                  <p className="font-heading text-xl font-medium text-text-main mt-0.5">
                    {selectedUser.successfulSwaps}
                  </p>
                </div>
              </div>
            </div>

            {/* Mock User History */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                ประวัติการแลกเปลี่ยนล่าสุด
              </h4>
              <div className="flex flex-col gap-2 font-sans text-xs">
                <div className="p-3 rounded-md border border-border-main bg-bg-secondary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-accent" />
                    <span>แลก Dune กับ The Secret History</span>
                  </div>
                  <span className="text-accent font-medium">สำเร็จ</span>
                </div>
                <div className="p-3 rounded-md border border-border-main bg-bg-secondary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-accent" />
                    <span>แลก Norwegian Wood กับ Pride and Prejudice</span>
                  </div>
                  <span className="text-accent font-medium">สำเร็จ</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setUserToToggleStatus(null);
        }}
        onConfirm={handleConfirmToggleStatus}
        title={
          userToToggleStatus?.status === 'active'
            ? `ยืนยันการระงับบัญชี "${userToToggleStatus?.name}"`
            : `ยืนยันการปลดระงับบัญชี "${userToToggleStatus?.name}"`
        }
        message={
          userToToggleStatus?.status === 'active'
            ? 'การระงับบัญชีจะทำให้ผู้ใช้ไม่สามารถลงหนังสือใหม่ ขอแลกเปลี่ยน หรือส่งข้อความได้ชั่วคราว คุณสามารถปลดระงับได้ทุกเมื่อ'
            : 'ผู้ใช้จะกลับมาใช้งานระบบได้ตามปกติทันที'
        }
        confirmText={userToToggleStatus?.status === 'active' ? 'ระงับบัญชีผู้ใช้' : 'ปลดการระงับ'}
        variant={userToToggleStatus?.status === 'active' ? 'danger' : 'primary'}
        requireReason={userToToggleStatus?.status === 'active'}
        reasonPlaceholder="เช่น ไม่จัดส่งหนังสือตามเวลาที่กำหนด, มีพฤติกรรมไม่เหมาะสม..."
      />

      {/* Points Edit Modal */}
      <Modal
        isOpen={isPointsModalOpen}
        onClose={() => {
          setIsPointsModalOpen(false);
          setUserToEditPoints(null);
        }}
        title={`ปรับแต้มสะสม: ${userToEditPoints?.name}`}
        subtitle={`แต้มปัจจุบัน: ${userToEditPoints?.points} แต้ม`}
      >
        <form onSubmit={handleSavePoints} className="flex flex-col gap-4">
          {pointsError && (
            <div className="p-3 rounded bg-warning/10 border border-warning/30 text-warning text-xs">
              {pointsError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-main/80">
              จำนวนแต้มที่ต้องการเพิ่ม / ลด (ใส่เครื่องหมายลบเพื่อหักแต้ม เช่น -50)
            </label>
            <input
              type="number"
              value={pointsDelta}
              onChange={(e) => setPointsDelta(e.target.value)}
              className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-main/80">
              เหตุผลในการปรับแต้ม <span className="text-warning">*</span>
            </label>
            <textarea
              rows={2}
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              placeholder="เช่น รางวัลกิจกรรม, ชดเชยข้อผิดพลาดของระบบ..."
              className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
            <button
              type="button"
              onClick={() => setIsPointsModalOpen(false)}
              className="px-4 py-2 border border-border-main rounded-md text-xs font-medium hover:bg-bg-secondary"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90"
            >
              บันทึกการปรับแต้ม
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
